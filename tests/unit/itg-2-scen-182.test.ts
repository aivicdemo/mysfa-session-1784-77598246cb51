import { describe, test, expect, beforeEach } from '@jest/globals';
import { authenticateUserWithErrorHandling } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-182
  test('Amazon Cognito連携 - authenticateUserが失敗した場合、利用者に認証サービス一時利用不可メッセージが表示される', () => {
    const userId = 'customer_user_001';
    const password = 'ValidPassword123!';

    const mockIdentityProviderAdapter = {
      authenticateUser: jest.fn().mockRejectedValueOnce(
        new Error('ServiceUnavailableException')
      ),
      validateToken: jest.fn(),
      refreshToken: jest.fn(),
      revokeSession: jest.fn(),
    };

    const result = authenticateUserWithErrorHandling(
      userId,
      password,
      mockIdentityProviderAdapter
    );

    expect(result).toEqual({
      success: false,
      token: null,
      message: '認証サービスが一時的に利用できません。しばらく経ってからもう一度お試しください',
      accessGranted: false,
    });
    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledWith(
      userId,
      password
    );
    expect(mockIdentityProviderAdapter.authenticateUser).toHaveBeenCalledTimes(1);
  });
});