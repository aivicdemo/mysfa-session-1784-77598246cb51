import { authenticateUser } from '../../src/logic/it-1784969823049-2-1-3';

const mockIdentityProviderAdapter = () => ({
  authenticateUser: jest.fn(),
  validateToken: jest.fn(),
  refreshToken: jest.fn(),
  revokeSession: jest.fn(),
});

const mockLoginUserRepository = () => ({
  findByEmail: jest.fn(),
  verifyPassword: jest.fn(),
});

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-187
  test('Amazon Cognito連携の認証失敗時に基本的なパスワード検証による代替認証では多要素認証が省略される', async () => {
    const identityProviderAdapter = mockIdentityProviderAdapter();
    const loginUserRepository = mockLoginUserRepository();

    const userEmail = 'customer@example.com';
    const userPassword = 'ValidPassword123!';
    const userId = 'user-001';

    // IdentityProviderAdapterの認証が失敗する設定
    const cognitoError = new Error('Connection timeout');
    identityProviderAdapter.authenticateUser.mockRejectedValueOnce(cognitoError);
    identityProviderAdapter.authenticateUser.mockRejectedValueOnce(cognitoError);
    identityProviderAdapter.authenticateUser.mockRejectedValueOnce(cognitoError);

    // 3回の再試行後、内部ログインユーザーテーブルでの検証に成功する設定
    loginUserRepository.findByEmail.mockResolvedValueOnce({
      id: userId,
      email: userEmail,
      passwordHash: 'hashed_password_value',
      mfaEnabled: true,
      mfaStatus: 'pending',
    });

    loginUserRepository.verifyPassword.mockResolvedValueOnce(true);

    const accessToken = 'access_token_fallback_basic_auth_001';

    const result = await authenticateUser(
      {
        email: userEmail,
        password: userPassword,
      },
      {
        identityProviderAdapter,
        loginUserRepository,
      }
    );

    // IdentityProviderAdapterの自動再試行が実行されたことを確認（3回の失敗を想定）
    expect(identityProviderAdapter.authenticateUser).toHaveBeenCalledTimes(3);

    // 内部ログインユーザーテーブルでの検証が実行されたことを確認
    expect(loginUserRepository.findByEmail).toHaveBeenCalledWith(userEmail);
    expect(loginUserRepository.verifyPassword).toHaveBeenCalledWith(
      userPassword,
      'hashed_password_value'
    );

    // 基本的なパスワード検証が成功し、アクセストークンが発行されたことを確認
    expect(result).toEqual({
      accessToken,
      userId,
      email: userEmail,
      authenticated: true,
      mfaRequired: false,
      fallbackAuthUsed: true,
    });

    // 多要素認証（MFA）が初期化・検証されていないことを確認
    expect(result.mfaRequired).toBe(false);
  });
});