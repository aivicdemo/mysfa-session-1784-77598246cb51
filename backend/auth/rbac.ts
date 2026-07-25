import { APIGatewayProxyEvent } from 'aws-lambda';

export type Role = 'admin' | 'operator' | 'viewer';

export interface AuthContext {
  userId: string;
  role: Role;
  loginId: string;
}

export const ROLE_PERMISSIONS: Record<Role, Set<string>> = {
  admin: new Set([
    'user:create',
    'user:read',
    'user:update',
    'user:delete',
    'customer:create',
    'customer:read',
    'customer:update',
    'customer:delete',
    'deal:create',
    'deal:read',
    'deal:update',
    'deal:delete',
    'quote:create',
    'quote:read',
    'quote:update',
    'quote:delete',
    'order:create',
    'order:read',
    'order:update',
    'order:delete',
    'invoice:create',
    'invoice:read',
    'invoice:update',
    'invoice:delete',
    'invoiceDetail:create',
    'invoiceDetail:read',
    'invoiceDetail:update',
    'invoiceDetail:delete',
    'dealActivity:create',
    'dealActivity:read',
    'dealActivity:update',
    'dealActivity:delete',
    'dealStatusHistory:create',
    'dealStatusHistory:read',
    'dealStatusHistory:delete',
    'issue:create',
    'issue:read',
    'issue:update',
    'issue:delete',
    'issueResolution:create',
    'issueResolution:read',
    'issueResolution:update',
    'issueResolution:delete',
    'revenue:create',
    'revenue:read',
    'revenue:update',
    'revenue:delete',
    'auditLog:read',
    'bulk:import',
  ]),
  operator: new Set([
    'user:read',
    'customer:create',
    'customer:read',
    'customer:update',
    'deal:create',
    'deal:read',
    'deal:update',
    'quote:create',
    'quote:read',
    'quote:update',
    'order:create',
    'order:read',
    'order:update',
    'invoice:create',
    'invoice:read',
    'invoice:update',
    'invoiceDetail:create',
    'invoiceDetail:read',
    'invoiceDetail:update',
    'dealActivity:create',
    'dealActivity:read',
    'dealActivity:update',
    'dealStatusHistory:create',
    'dealStatusHistory:read',
    'issue:create',
    'issue:read',
    'issue:update',
    'issueResolution:create',
    'issueResolution:read',
    'issueResolution:update',
    'revenue:create',
    'revenue:read',
    'revenue:update',
    'auditLog:read',
    'bulk:import',
  ]),
  viewer: new Set([
    'user:read',
    'customer:read',
    'deal:read',
    'quote:read',
    'order:read',
    'invoice:read',
    'invoiceDetail:read',
    'dealActivity:read',
    'dealStatusHistory:read',
    'issue:read',
    'issueResolution:read',
    'revenue:read',
    'auditLog:read',
  ]),
};

export function extractAuthContext(event: APIGatewayProxyEvent): AuthContext | null {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) return null;

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return {
      userId: decoded.userId,
      role: decoded.role as Role,
      loginId: decoded.loginId,
    };
  } catch {
    return null;
  }
}

export function hasPermission(role: Role, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function requirePermission(role: Role, permission: string): void {
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

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
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