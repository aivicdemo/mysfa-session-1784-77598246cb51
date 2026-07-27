import { authenticateUser } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-178
  test('Amazon Cognito連携 - authenticateUserが成功応答を返した場合、ユーザーの認証情報が検証されトークンが発行される', async () => {
    // Arrange
    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn().mockResolvedValue({
        idToken: 'mock-id-token-xyz',
        accessToken: 'mock-access-token-abc',
        refreshToken: 'mock-refresh-token-def',
        expiresIn: 3600,
      }),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const userId = 'user-001';
    const password = 'TestPassword123';

    // Act
    const result = await authenticateUser(
      { userId, password },
      mockIdentityProviderAdapter
    );

    // Assert
    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledTimes(1);
    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledWith({
      userId,
      password,
    });

    expect(result).toEqual({
      idToken: 'mock-id-token-xyz',
      accessToken: 'mock-access-token-abc',
      refreshToken: 'mock-refresh-token-def',
      expiresIn: 3600,
      userId: 'user-001',
      isAuthenticated: true,
    });
  });
});