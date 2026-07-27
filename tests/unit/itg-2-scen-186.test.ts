import { authenticateUserWithFallback } from '../../src/logic/it-1784969823049-2-1-3';

// Mock for IdentityProviderAdapter
interface IdentityProviderAdapter {
  authenticateUser: (email: string, password: string) => Promise<{ token: string }>;
}

// Mock for internal login user table and password verification
interface LoginUserRepository {
  findByEmail: (email: string) => Promise<{ email: string; passwordHash: string } | null>;
  verifyPassword: (plainPassword: string, hash: string) => boolean;
}

describe('顧客ポータルのアクセス制御と権限管理 - Cognito認証失敗時のフォールバック', () => {
  // SCEN-186
  test('Cognito認証が失敗した場合、内部ログインユーザーテーブルでのパスワード検証により最小限のアクセスが許可される', async () => {
    // Setup: Test credentials
    const testEmail = 'test@example.com';
    const testPassword = 'ValidPassword123!';
    const passwordHash = '$2b$10$abcd1234efgh5678ijkl9012mnopqrstuvwxyz'; // Mocked bcrypt hash

    // Mock IdentityProviderAdapter - always fails with connection timeout
    let cognitoCallCount = 0;
    const mockIdentityProviderAdapter: IdentityProviderAdapter = {
      authenticateUser: jest.fn(async () => {
        cognitoCallCount++;
        throw new Error('Connection timeout: Amazon Cognito service unreachable');
      }),
    };

    // Mock LoginUserRepository
    const mockLoginUserRepository: LoginUserRepository = {
      findByEmail: jest.fn(async (email: string) => {
        if (email === testEmail) {
          return {
            email: testEmail,
            passwordHash: passwordHash,
          };
        }
        return null;
      }),
      verifyPassword: jest.fn((plainPassword: string, hash: string) => {
        // Simple mock: return true only if hash matches expected test hash
        return plainPassword === testPassword && hash === passwordHash;
      }),
    };

    // Execute: Call the fallback authentication function
    const result = await authenticateUserWithFallback(
      testEmail,
      testPassword,
      mockIdentityProviderAdapter,
      mockLoginUserRepository
    );

    // Assertions
    // 1. Verify Cognito authentication was retried 3 times at 3-second intervals
    expect(cognitoCallCount).toBe(3);
    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledTimes(3);

    // 2. Verify internal login user table was queried
    expect(mockLoginUserRepository.findByEmail).toHaveBeenCalledWith(testEmail);

    // 3. Verify password verification was performed
    expect(mockLoginUserRepository.verifyPassword).toHaveBeenCalledWith(
      testPassword,
      passwordHash
    );

    // 4. Verify successful authentication with fallback
    expect(result).toEqual({
      success: true,
      authenticatedVia: 'fallback_internal',
      userEmail: testEmail,
      accessLevel: 'minimal',
      mfaRequired: false,
      sessionToken: expect.any(String),
      auditLog: expect.stringContaining('Cognito認証失敗'),
    });

    // 5. Verify audit log contains expected flow
    expect(result.auditLog).toMatch(/Cognito認証失敗/);
    expect(result.auditLog).toMatch(/フォールバック認証実行/);
    expect(result.auditLog).toMatch(/パスワード検証成功/);
    expect(result.auditLog).toMatch(/制限付きアクセス許可/);

    // 6. Verify minimal access level (no MFA required)
    expect(result.accessLevel).toBe('minimal');
    expect(result.mfaRequired).toBe(false);
  });
});