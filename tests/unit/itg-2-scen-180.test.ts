import { refreshUserSession } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-180
  test('Amazon Cognito連携 - refreshTokenが成功応答を返した場合、セッション継続時にトークンが更新される', () => {
    // セッション状態の初期化：有効期限が近い古いアクセストークンを保持
    const oldAccessToken = 'old_access_token_abc123';
    const oldTokenExpiration = new Date('2024-01-15T11:25:00Z');
    
    // 新しいトークン情報（成功応答）
    const newAccessToken = 'new_access_token_xyz789';
    const newTokenExpiration = new Date('2024-01-15T12:25:00Z');
    const refreshToken = 'refresh_token_def456';
    
    // IdentityProviderAdapter のスタブを設定
    const mockIdentityProvider = {
      refreshToken: jest.fn().mockResolvedValue({
        accessToken: newAccessToken,
        tokenExpiration: newTokenExpiration,
        sessionStatus: 'active'
      })
    };
    
    // 現在のセッション状態
    const currentSession = {
      accessToken: oldAccessToken,
      tokenExpiration: oldTokenExpiration,
      refreshToken: refreshToken,
      sessionStatus: 'active'
    };
    
    // セッション継続処理（トークン更新メカニズム）を実行
    const updatedSession = refreshUserSession(currentSession, mockIdentityProvider);
    
    // IdentityProviderAdapter の refreshToken 呼び出しを確認
    expect(mockIdentityProvider.refreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockIdentityProvider.refreshToken).toHaveBeenCalledTimes(1);
    
    // アクセストークンが新しい値に置き換わっていることを確認
    expect(updatedSession.accessToken).toBe(newAccessToken);
    expect(updatedSession.accessToken).not.toBe(oldAccessToken);
    
    // 新しいトークンの有効期限が古いトークンより後の時点に設定されていることを確認
    expect(updatedSession.tokenExpiration.getTime()).toBeGreaterThan(oldTokenExpiration.getTime());
    expect(updatedSession.tokenExpiration).toEqual(newTokenExpiration);
    
    // セッション状態が『継続中』のステータスを保持していることを確認
    expect(updatedSession.sessionStatus).toBe('active');
  });
});