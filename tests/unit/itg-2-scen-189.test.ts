import { authenticateUser } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-189
  test('Amazon Cognito連携 - authenticateUserの応答形式が想定と異なる場合、不正なトークンが業務結果として通されない', async () => {
    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn(),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const malformedResponse = {
      invalidTokenField: 'not_a_valid_token',
      userId: 'user-123',
    };

    mockIdentityProviderAdapter.authenticateUser.mockResolvedValueOnce(
      malformedResponse
    );

    const userCredentials = {
      email: 'customer@example.com',
      password: 'SecurePassword123!',
    };

    const result = await authenticateUser(
      userCredentials,
      mockIdentityProviderAdapter
    );

    expect(result.isValid).toBe(false);
    expect(result.isAuthenticated).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.errorMessage).toMatch(/認証サービス/);
  });
});