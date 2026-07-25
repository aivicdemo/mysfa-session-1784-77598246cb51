import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  DynamoDBClient,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import {
  extractAuthContext,
  checkPermission,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from './rbac';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.MAIN_TABLE || 'SalesManagementDB';

const TABLE_INDICES: Record<number, string> = {
  0: 'users',
  1: 'customers',
  2: 'deals',
  3: 'quotes',
  4: 'orders',
  5: 'invoices',
  6: 'invoice_details',
  7: 'deal_activities',
  8: 'deal_status_history',
  9: 'issues',
  10: 'issue_resolutions',
  11: 'sales_results',
  12: 'audit_logs',
};

interface AuditLogEntry {
  pk: string;
  sk: string;
  userId: string;
  operationType: string;
  targetTable: string;
  targetRecordId?: string;
  operationDetails: string;
  ipAddress?: string;
  timestamp: number;
}

async function createAuditLog(
  userId: string,
  operationType: string,
  targetTable: string,
  targetRecordId: string | undefined,
  operationDetails: string,
  ipAddress: string | undefined
): Promise<void> {
  const timestamp = Date.now();
  const auditLog: AuditLogEntry = {
    pk: 'AUDIT',
    sk: `${timestamp}#${randomUUID()}`,
    userId,
    operationType,
    targetTable,
    targetRecordId,
    operationDetails,
    ipAddress,
    timestamp,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: auditLog,
    })
  );
}

function getIpAddress(event: APIGatewayProxyEvent): string | undefined {
  return (
    event.requestContext?.identity?.sourceIp ||
    event.headers?.['X-Forwarded-For']?.split(',')[0] ||
    undefined
  );
}

function createResponse(
  statusCode: number,
  body: Record<string, unknown> | string
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

async function handleGetResources(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const authContext = extractAuthContext(event);
    checkPermission(authContext.role, 'GET_RESOURCES');

    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 100,
      })
    );

    return createResponse(200, {
      success: true,
      data: result.Items || [],
      count: result.Count || 0,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return createResponse(403, { error: error.message });
    }
    return createResponse(500, { error: 'Internal server error' });
  }
}

async function handleBulkImport(
  event: APIGatewayProxyEvent,
  tableIndex: number
): Promise<APIGatewayProxyResult> {
  try {
    const authContext = extractAuthContext(event);
    const tableName = TABLE_INDICES[tableIndex];

    if (!tableName) {
      return createResponse(400, { error: 'Invalid table index' });
    }

    const permission = `POST_BULK_${tableName.toUpperCase()}`;
    checkPermission(authContext.role, permission);

    const body = JSON.parse(event.body || '{}');
    const items = Array.isArray(body.items) ? body.items : [];

    if (items.length === 0) {
      return createResponse(400, { error: 'No items provided' });
    }

    const now = Date.now();
    const processedItems = items.map((item: Record<string, unknown>) => ({
      ...item,
      pk: tableName,
      sk: item.id || randomUUID(),
      id: item.id || randomUUID(),
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || now,
      createdBy: item.createdBy || authContext.userId,
      updatedBy: item.updatedBy || authContext.userId,
    }));

    const chunks: Record<string, unknown>[][] = [];
    for (let i = 0; i < processedItems.length; i += 25) {
      chunks.push(processedItems.slice(i, i + 25));
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const chunk of chunks) {
      const writeRequests = chunk.map((item) => ({
        PutRequest: {
          Item: item,
        },
      }));

      const params: BatchWriteItemCommandInput = {
        RequestItems: {
          [TABLE_NAME]: writeRequests,
        },
      };

      try {
        await client.send(new BatchWriteItemCommand(params));
        imported += chunk.length;
      } catch (error) {
        failed += chunk.length;
        errors.push(`Batch write failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await createAuditLog(
      authContext.userId,
      'BULK_IMPORT',
      tableName,
      undefined,
      `Imported ${imported} items to ${tableName}`,
      getIpAddress(event)
    );

    return createResponse(200, {
      success: true,
      imported,
      failed,
      errors,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return createResponse(403, { error: error.message });
    }
    if (error instanceof ValidationError) {
      return createResponse(400, { error: error.message });
    }
    return createResponse(500, { error: 'Internal server error' });
  }
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const path = event.path || '';
  const method = event.httpMethod || 'GET';

  try {
    if (method === 'GET' && path === '/resources') {
      return await handleGetResources(event);
    }

    const bulkMatch = path.match(/^\/api\/(\d+)\/bulk$/);
    if (method === 'POST' && bulkMatch) {
      const tableIndex = parseInt(bulkMatch[1], 10);
      return await handleBulkImport(event, tableIndex);
    }

    return createResponse(404, { error: 'Endpoint not found' });
  } catch (error) {
    console.error('Unhandled error:', error);
    return createResponse(500, { error: 'Internal server error' });
  }
}