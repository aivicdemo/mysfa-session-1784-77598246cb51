import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  DynamoDBClient,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import {
  extractAuthContext,
  requirePermission,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from './rbac';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE || 'SalesManagementDB';

interface AuditLog {
  pk: string;
  sk: string;
  userId: string;
  operationType: string;
  targetTable: string;
  targetRecordId?: string;
  operationContent: string;
  ipAddress?: string;
  timestamp: number;
}

interface BulkImportRequest {
  items: Record<string, unknown>[];
}

interface BulkImportResponse {
  imported: number;
  failed: number;
  errors: string[];
}

const TABLE_INDICES: Record<number, string> = {
  0: 'user',
  1: 'customer',
  2: 'deal',
  3: 'quote',
  4: 'order',
  5: 'invoice',
  6: 'invoiceDetail',
  7: 'dealActivity',
  8: 'dealStatusHistory',
  9: 'issue',
  10: 'issueResolution',
  11: 'revenue',
  12: 'operationLog',
};

const REQUIRED_FIELDS: Record<string, string[]> = {
  user: ['loginId', 'passwordHash', 'userName', 'email', 'permissionLevel', 'status', 'createdBy', 'updatedBy'],
  customer: ['customerName', 'status', 'createdById', 'updatedById'],
  deal: ['customerId', 'assignedUserId', 'dealName', 'dealAmount', 'stage', 'probability', 'expectedClosingDate', 'createdById', 'updatedById'],
  quote: ['dealId', 'customerId', 'quoteNumber', 'quoteDate', 'totalAmount', 'status', 'createdById'],
  order: ['dealId', 'customerId', 'orderNumber', 'orderDate', 'dueDate', 'orderAmount', 'status', 'createdById'],
  invoice: ['invoiceNumber', 'customerId', 'invoiceDate', 'dueDate', 'invoiceAmount', 'taxAmount', 'status', 'createdById', 'updatedById'],
  invoiceDetail: ['invoiceId', 'productCode', 'productName', 'quantity', 'unitPrice', 'amount', 'taxRate', 'taxAmount', 'lineNumber', 'createdById'],
  dealActivity: ['dealId', 'activityType', 'activityDate', 'activityContent', 'createdById'],
  dealStatusHistory: ['dealId', 'previousStatus', 'newStatus', 'createdById'],
  issue: ['dealId', 'issueType', 'title', 'priority', 'status', 'createdById', 'updatedById'],
  issueResolution: ['issueId', 'dealId', 'resolutionStatus', 'responseContent', 'priority', 'createdById'],
  revenue: ['orderId', 'customerId', 'salesPersonId', 'revenueDate', 'revenueAmount', 'taxAmount', 'revenueTotal', 'productCategory', 'revenueStatus', 'createdById', 'updatedById'],
  operationLog: ['userId', 'operationType', 'targetTable', 'operationDate'],
};

async function logAudit(
  userId: string,
  operationType: string,
  targetTable: string,
  targetRecordId: string | undefined,
  operationContent: string,
  ipAddress?: string
): Promise<void> {
  const auditLog: AuditLog = {
    pk: 'AUDIT',
    sk: `${Date.now()}#${randomUUID()}`,
    userId,
    operationType,
    targetTable,
    targetRecordId,
    operationContent,
    ipAddress,
    timestamp: Date.now(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: auditLog,
    })
  );
}

function validateRequiredFields(data: Record<string, unknown>, tableName: string): void {
  const required = REQUIRED_FIELDS[tableName] || [];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      throw new ValidationError(`Required field missing: ${field}`);
    }
  }
}

function addTimestamps(item: Record<string, unknown>, isUpdate: boolean = false): Record<string, unknown> {
  const now = Date.now();
  if (!isUpdate) {
    item.createdAt = now;
  }
  item.updatedAt = now;
  return item;
}

async function handleGetResources(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, 'user:read');

    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'attribute_exists(pk) AND pk <> :auditPk',
        ExpressionAttributeValues: {
          ':auditPk': 'AUDIT',
        },
        Limit: 100,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items || [],
        count: result.Count || 0,
      }),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleBulkImport(
  event: APIGatewayProxyEvent,
  tableIndex: number
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, 'bulk:import');

    const tableName = TABLE_INDICES[tableIndex];
    if (!tableName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid table index' }),
      };
    }

    const body: BulkImportRequest = JSON.parse(event.body || '{}');
    if (!Array.isArray(body.items)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'items must be an array' }),
      };
    }

    const items = body.items;
    const response: BulkImportResponse = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    const chunks: Record<string, unknown>[][] = [];
    for (let i = 0; i < items.length; i += 25) {
      chunks.push(items.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      const requestItems: Record<string, unknown>[] = [];

      for (const item of chunk) {
        try {
          const processedItem = { ...item } as Record<string, unknown>;
          if (!processedItem.id) {
            processedItem.id = randomUUID();
          }
          if (!processedItem.pk) {
            processedItem.pk = tableName;
          }
          if (!processedItem.sk) {
            processedItem.sk = processedItem.id as string;
          }

          validateRequiredFields(processedItem, tableName);
          addTimestamps(processedItem, false);

          requestItems.push(processedItem);
          response.imported++;
        } catch (error) {
          response.failed++;
          response.errors.push(
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }

      if (requestItems.length > 0) {
        const batchInput: BatchWriteItemCommandInput = {
          RequestItems: {
            [TABLE_NAME]: requestItems.map((item) => ({
              PutRequest: {
                Item: item as Record<string, unknown>,
              },
            })),
          },
        };

        await docClient.send(new BatchWriteItemCommand(batchInput));
      }
    }

    await logAudit(
      authContext.userId,
      'BULK_IMPORT',
      tableName,
      undefined,
      `Imported ${response.imported} items`,
      event.requestContext?.identity?.sourceIp
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleGetById(
  event: APIGatewayProxyEvent,
  tableName: string,
  permission: string
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, permission);

    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing id parameter' }),
      };
    }

    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: tableName,
          sk: id,
        },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    await logAudit(
      authContext.userId,
      'READ',
      tableName,
      id,
      'Retrieved record',
      event.requestContext?.identity?.sourceIp
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleCreate(
  event: APIGatewayProxyEvent,
  tableName: string,
  permission: string
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, permission);

    const body = JSON.parse(event.body || '{}');
    validateRequiredFields(body, tableName);

    const id = randomUUID();
    const item = {
      pk: tableName,
      sk: id,
      id,
      ...body,
    };

    addTimestamps(item, false);

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    await logAudit(
      authContext.userId,
      'CREATE',
      tableName,
      id,
      JSON.stringify(body),
      event.requestContext?.identity?.sourceIp
    );

    return {
      statusCode: 201,
      body: JSON.stringify(item),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    if (error instanceof ValidationError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleUpdate(
  event: APIGatewayProxyEvent,
  tableName: string,
  permission: string
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, permission);

    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing id parameter' }),
      };
    }

    const body = JSON.parse(event.body || '{}');

    const existing = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: tableName,
          sk: id,
        },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    const updateExpressionParts: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(body).forEach(([key, value], index) => {
      if (key !== 'pk' && key !== 'sk' && key !== 'id' && key !== 'createdAt') {
        const attrName = `#attr${index}`;
        const valName = `:val${index}`;
        updateExpressionParts.push(`${attrName} = ${valName}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[valName] = value;
      }
    });

    updateExpressionParts.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = Date.now();

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: tableName,
          sk: id,
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    await logAudit(
      authContext.userId,
      'UPDATE',
      tableName,
      id,
      JSON.stringify(body),
      event.requestContext?.identity?.sourceIp
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleDelete(
  event: APIGatewayProxyEvent,
  tableName: string,
  permission: string
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, permission);

    const id = event.pathParameters?.id;
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing id parameter' }),
      };
    }

    const existing = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: tableName,
          sk: id,
        },
      })
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Resource not found' }),
      };
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          pk: tableName,
          sk: id,
        },
      })
    );

    await logAudit(
      authContext.userId,
      'DELETE',
      tableName,
      id,
      'Deleted record',
      event.requestContext?.identity?.sourceIp
    );

    return {
      statusCode: 204,
      body: '',
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

async function handleList(
  event: APIGatewayProxyEvent,
  tableName: string,
  permission: string
): Promise<APIGatewayProxyResult> {
  const authContext = extractAuthContext(event);
  if (!authContext) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    requirePermission(authContext.role, permission);

    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': tableName,
        },
        Limit: 100,
      })
    );

    await logAudit(
      authContext.userId,
      'LIST',
      tableName,
      undefined,
      'Listed records',
      event.requestContext?.identity?.sourceIp
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items || [],
        count: result.Count || 0,
      }),
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const path = event.path || '';
  const method = event.httpMethod || 'GET';

  try {
    if (path === '/resources' && method === 'GET') {
      return await handleGetResources(event);
    }

    const bulkMatch = path.match(/^\/api\/(\d+)\/bulk$/);
    if (bulkMatch && method === 'POST') {
      const tableIndex = parseInt(bulkMatch[1], 10);
      return await handleBulkImport(event, tableIndex);
    }

    const userMatch = path.match(/^\/api\/users(?:\/(.*?))?$/);
    if (userMatch && method === 'GET' && userMatch[1]) {
      return await handleGetById(event, 'user', 'user:read');
    }
    if (userMatch && method === 'GET' && !userMatch[1]) {
      return await handleList(event, 'user', 'user:read');
    }
    if (userMatch && method === 'POST') {
      return await handleCreate(event, 'user', 'user:create');
    }
    if (userMatch && method === 'PUT' && userMatch[1]) {
      return await handleUpdate(event, 'user', 'user:update');
    }
    if (userMatch && method === 'DELETE' && userMatch[1]) {
      return await handleDelete(event, 'user', 'user:delete');
    }

    const customerMatch = path.match(/^\/api\/customers(?:\/(.*?))?$/);
    if (customerMatch && method === 'GET' && customerMatch[1]) {
      return await handleGetById(event, 'customer', 'customer:read');
    }
    if (customerMatch && method === 'GET' && !customerMatch[1]) {
      return await handleList(event, 'customer', 'customer:read');
    }
    if (customerMatch && method === 'POST') {
      return await handleCreate(event, 'customer', 'customer:create');
    }
    if (customerMatch && method === 'PUT' && customerMatch[1]) {
      return await handleUpdate(event, 'customer', 'customer:update');
    }
    if (customerMatch && method === 'DELETE' && customerMatch[1]) {
      return await handleDelete(event, 'customer', 'customer:delete');
    }

    const dealMatch = path.match(/^\/api\/deals(?:\/(.*?))?$/);
    if (dealMatch && method === 'GET' && dealMatch[1]) {
      return await handleGetById(event, 'deal', 'deal:read');
    }
    if (dealMatch && method === 'GET' && !dealMatch[1]) {
      return await handleList(event, 'deal', 'deal:read');
    }
    if (dealMatch && method === 'POST') {
      return await handleCreate(event, 'deal', 'deal:create');
    }
    if (dealMatch && method === 'PUT' && dealMatch[1]) {
      return await handleUpdate(event, 'deal', 'deal:update');
    }
    if (dealMatch && method === 'DELETE' && dealMatch[1]) {
      return await handleDelete(event, 'deal', 'deal:delete');
    }

    const quoteMatch = path.match(/^\/api\/quotes(?:\/(.*?))?$/);
    if (quoteMatch && method === 'GET' && quoteMatch[1]) {
      return await handleGetById(event, 'quote', 'quote:read');
    }
    if (quoteMatch && method === 'GET' && !quoteMatch[1]) {
      return await handleList(event, 'quote', 'quote:read');
    }
    if (quoteMatch && method === 'POST') {
      return await handleCreate(event, 'quote', 'quote:create');
    }
    if (quoteMatch && method === 'PUT' && quoteMatch[1]) {
      return await handleUpdate(event, 'quote', 'quote:update');
    }
    if (quoteMatch && method === 'DELETE' && quoteMatch[1]) {
      return await handleDelete(event, 'quote', 'quote:delete');
    }

    const orderMatch = path.match(/^\/api\/orders(?:\/(.*?))?$/);
    if (orderMatch && method === 'GET' && orderMatch[1]) {
      return await handleGetById(event, 'order', 'order:read');
    }
    if (orderMatch && method === 'GET' && !orderMatch[1]) {
      return await handleList(event, 'order', 'order:read');
    }
    if (orderMatch && method === 'POST') {
      return await handleCreate(event, 'order', 'order:create');
    }
    if (orderMatch && method === 'PUT' && orderMatch[1]) {
      return await handleUpdate(event, 'order', 'order:update');
    }
    if (orderMatch && method === 'DELETE' && orderMatch[1]) {
      return await handleDelete(event, 'order', 'order:delete');
    }

    const invoiceMatch = path.match(/^\/api\/invoices(?:\/(.*?))?$/);
    if (invoiceMatch && method === 'GET' && invoiceMatch[1]) {
      return await handleGetById(event, 'invoice', 'invoice:read');
    }
    if (invoiceMatch && method === 'GET' && !invoiceMatch[1]) {
      return await handleList(event, 'invoice', 'invoice:read');
    }
    if (invoiceMatch && method === 'POST') {
      return await handleCreate(event, 'invoice', 'invoice:create');
    }
    if (invoiceMatch && method === 'PUT' && invoiceMatch[1]) {
      return await handleUpdate(event, 'invoice', 'invoice:update');
    }
    if (invoiceMatch && method === 'DELETE' && invoiceMatch[1]) {
      return await handleDelete(event, 'invoice', 'invoice:delete');
    }

    const invoiceDetailMatch = path.match(/^\/api\/invoice-details(?:\/(.*?))?$/);
    if (invoiceDetailMatch && method === 'GET' && invoiceDetailMatch[1]) {
      return await handleGetById(event, 'invoiceDetail', 'invoiceDetail:read');
    }
    if (invoiceDetailMatch && method === 'GET' && !invoiceDetailMatch[1]) {
      return await handleList(event, 'invoiceDetail', 'invoiceDetail:read');
    }
    if (invoiceDetailMatch && method === 'POST') {
      return await handleCreate(event, 'invoiceDetail', 'invoiceDetail:create');
    }
    if (invoiceDetailMatch && method === 'PUT' && invoiceDetailMatch[1]) {
      return await handleUpdate(event, 'invoiceDetail', 'invoiceDetail:update');
    }
    if (invoiceDetailMatch && method === 'DELETE' && invoiceDetailMatch[1]) {
      return await handleDelete(event, 'invoiceDetail', 'invoiceDetail:delete');
    }

    const dealActivityMatch = path.match(/^\/api\/deal-activities(?:\/(.*?))?$/);
    if (dealActivityMatch && method === 'GET' && dealActivityMatch[1]) {
      return await handleGetById(event, 'dealActivity', 'dealActivity:read');
    }
    if (dealActivityMatch && method === 'GET' && !dealActivityMatch[1]) {
      return await handleList(event, 'dealActivity', 'dealActivity:read');
    }
    if (dealActivityMatch && method === 'POST') {
      return await handleCreate(event, 'dealActivity', 'dealActivity:create');
    }
    if (dealActivityMatch && method === 'PUT' && dealActivityMatch[1]) {
      return await handleUpdate(event, 'dealActivity', 'dealActivity:update');
    }
    if (dealActivityMatch && method === 'DELETE' && dealActivityMatch[1]) {
      return await handleDelete(event, 'dealActivity', 'dealActivity:delete');
    }

    const dealStatusHistoryMatch = path.match(/^\/api\/deal-status-histories(?:\/(.*?))?$/);
    if (dealStatusHistoryMatch && method === 'GET' && dealStatusHistoryMatch[1]) {
      return await handleGetById(event, 'dealStatusHistory', 'dealStatusHistory:read');
    }
    if (dealStatusHistoryMatch && method === 'GET' && !dealStatusHistoryMatch[1]) {
      return await handleList(event, 'dealStatusHistory', 'dealStatusHistory:read');
    }
    if (dealStatusHistoryMatch && method === 'POST') {
      return await handleCreate(event, 'dealStatusHistory', 'dealStatusHistory:create');
    }
    if (dealStatusHistoryMatch && method === 'DELETE' && dealStatusHistoryMatch[1]) {
      return await handleDelete(event, 'dealStatusHistory', 'dealStatusHistory:delete');
    }

    const issueMatch = path.match(/^\/api\/issues(?:\/(.*?))?$/);
    if (issueMatch && method === 'GET' && issueMatch[1]) {
      return await handleGetById(event, 'issue', 'issue:read');
    }
    if (issueMatch && method === 'GET' && !issueMatch[1]) {
      return await handleList(event, 'issue', 'issue:read');
    }
    if (issueMatch && method === 'POST') {
      return await handleCreate(event, 'issue', 'issue:create');
    }
    if (issueMatch && method === 'PUT' && issueMatch[1]) {
      return await handleUpdate(event, 'issue', 'issue:update');
    }
    if (issueMatch && method === 'DELETE' && issueMatch[1]) {
      return await handleDelete(event, 'issue', 'issue:delete');
    }

    const issueResolutionMatch = path.match(/^\/api\/issue-resolutions(?:\/(.*?))?$/);
    if (issueResolutionMatch && method === 'GET' && issueResolutionMatch[1]) {
      return await handleGetById(event, 'issueResolution', 'issueResolution:read');
    }
    if (issueResolutionMatch && method === 'GET' && !issueResolutionMatch[1]) {
      return await handleList(event, 'issueResolution', 'issueResolution:read');
    }
    if (issueResolutionMatch && method === 'POST') {
      return await handleCreate(event, 'issueResolution', 'issueResolution:create');
    }
    if (issueResolutionMatch && method === 'PUT' && issueResolutionMatch[1]) {
      return await handleUpdate(event, 'issueResolution', 'issueResolution:update');
    }
    if (issueResolutionMatch && method === 'DELETE' && issueResolutionMatch[1]) {
      return await handleDelete(event, 'issueResolution', 'issueResolution:delete');
    }

    const revenueMatch = path.match(/^\/api\/revenues(?:\/(.*?))?$/);
    if (revenueMatch && method === 'GET' && revenueMatch[1]) {
      return await handleGetById(event, 'revenue', 'revenue:read');
    }
    if (revenueMatch && method === 'GET' && !revenueMatch[1]) {
      return await handleList(event, 'revenue', 'revenue:read');
    }
    if (revenueMatch && method === 'POST') {
      return await handleCreate(event, 'revenue', 'revenue:create');
    }
    if (revenueMatch && method === 'PUT' && revenueMatch[1]) {
      return await handleUpdate(event, 'revenue', 'revenue:update');
    }
    if (revenueMatch && method === 'DELETE' && revenueMatch[1]) {
      return await handleDelete(event, 'revenue', 'revenue:delete');
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};