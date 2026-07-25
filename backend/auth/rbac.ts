import { APIGatewayProxyEvent } from 'aws-lambda';

export type Role = 'admin' | 'operator' | 'viewer';

export interface AuthContext {
  userId: string;
  role: Role;
  loginId: string;
}

export const ROLE_PERMISSIONS: Record<Role, Set<string>> = {
  admin: new Set([
    'GET_RESOURCES',
    'POST_BULK_USERS',
    'POST_BULK_CUSTOMERS',
    'POST_BULK_DEALS',
    'POST_BULK_QUOTES',
    'POST_BULK_ORDERS',
    'POST_BULK_INVOICES',
    'POST_BULK_INVOICE_DETAILS',
    'POST_BULK_DEAL_ACTIVITIES',
    'POST_BULK_DEAL_STATUS_HISTORY',
    'POST_BULK_ISSUES',
    'POST_BULK_ISSUE_RESOLUTIONS',
    'POST_BULK_SALES_RESULTS',
    'POST_BULK_AUDIT_LOGS',
  ]),
  operator: new Set([
    'GET_RESOURCES',
    'POST_BULK_USERS',
    'POST_BULK_CUSTOMERS',
    'POST_BULK_DEALS',
    'POST_BULK_QUOTES',
    'POST_BULK_ORDERS',
    'POST_BULK_INVOICES',
    'POST_BULK_INVOICE_DETAILS',
    'POST_BULK_DEAL_ACTIVITIES',
    'POST_BULK_DEAL_STATUS_HISTORY',
    'POST_BULK_ISSUES',
    'POST_BULK_ISSUE_RESOLUTIONS',
    'POST_BULK_SALES_RESULTS',
  ]),
  viewer: new Set(['GET_RESOURCES']),
};

export function extractAuthContext(event: APIGatewayProxyEvent): AuthContext {
  const authHeader = event.headers?.Authorization || event.headers?.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return {
      userId: decoded.userId || 'unknown',
      role: (decoded.role || 'viewer') as Role,
      loginId: decoded.loginId || 'unknown',
    };
  } catch {
    return {
      userId: 'unknown',
      role: 'viewer',
      loginId: 'unknown',
    };
  }
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function checkPermission(role: Role, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Permission denied: ${permission}`);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}