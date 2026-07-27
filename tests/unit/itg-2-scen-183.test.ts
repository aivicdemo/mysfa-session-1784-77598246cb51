import { authenticateUser } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-183
  test('[error] Amazon Cognito連携 - authenticateUserが失敗した場合、ポータルへのアクセスが制限される', async () => {
    const email = 'customer@example.com';
    const password = 'validPassword123';

    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn().mockRejectedValue(
        new Error('Authentication service temporarily unavailable')
      ),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    try {
      await authenticateUser(
        email,
        password,
        mockIdentityProviderAdapter
      );
      fail('Expected authenticateUser to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/Authentication service/);
    }

    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledWith(
      email,
      password
    );
    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledTimes(1);
  });
});