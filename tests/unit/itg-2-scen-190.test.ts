import { validatePortalAccess } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-190
  test('[edge] Amazon Cognito連携 - validateTokenの応答形式が想定と異なる場合、無効なトークンでのアクセスが許可されない', () => {
    const malformedTokenMetadata = {
      // 期待されるトークンメタデータフィールドが欠落した不正な形式
      sub: 'user-123',
      // 通常必要な exp, iat フィールドが欠落
    };

    const mockIdentityProvider = {
      authenticateUser: jest.fn(),
      validateToken: jest.fn().mockReturnValue({
        isValid: true,
        metadata: malformedTokenMetadata,
        // 期待される expiresAt, issuedAt フィールドがない
      }),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const mockAuditLogger = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const inputToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.signature';
    const attemptTimestamp = new Date('2024-02-15T10:30:00Z');

    const result = validatePortalAccess(
      inputToken,
      mockIdentityProvider,
      mockAuditLogger,
      attemptTimestamp
    );

    expect(result.accessGranted).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.reason).toMatch(/トークン/);
    expect(mockAuditLogger.logUserAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'authentication_failure',
        tokenValidationStatus: 'malformed_response',
        timestamp: attemptTimestamp,
      })
    );
    expect(mockIdentityProvider.validateToken).toHaveBeenCalledWith(inputToken);
  });
});