import { validatePortalAccess } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-184
  test('validateTokenが失敗した場合、利用者に認証サービスが利用できないメッセージが表示される', () => {
    const mockIdentityProviderAdapter = {
      validateToken: jest.fn().mockRejectedValueOnce(
        new Error('Service unavailable')
      ),
    };

    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_token_payload.signature';

    const result = validatePortalAccess(validToken, mockIdentityProviderAdapter);

    expect(result).toEqual({
      isAccessGranted: false,
      errorMessage: '認証サービスが一時的に利用できません。しばらく経ってからもう一度お試しください',
      redirectTo: 'LOGIN',
    });
    expect(mockIdentityProviderAdapter.validateToken).toHaveBeenCalledWith(validToken);
  });
});