import { revokeSession } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-181
  test('Amazon Cognito連携 - revokeSessionが成功応答を返した場合、ログアウト時にセッションが無効化される', async () => {
    // セッションストレージとローカルストレージのモック
    const mockSessionStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();

    const mockLocalStorage = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();

    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      writable: true,
    });

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // IdentityProviderAdapterのスタブ化
    const assumedRevokeSessionResponse = {
      success: true,
      revokedAt: '2024-01-15T10:30:00Z',
    };

    const identityProviderAdapterStub = {
      revokeSession: jest.fn().mockResolvedValue(assumedRevokeSessionResponse),
    };

    // セッショントークンの初期化
    const validSessionToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjdXN0b21lci0xMjMiLCJpc3MiOiJjb2duaXRvIiwiZXhwIjoxNzA1Mzc3NDAwfQ.mock_signature';
    const refreshToken = 'refresh_token_mock_value';

    mockSessionStorage.setItem('authToken', validSessionToken);
    mockLocalStorage.setItem('refreshToken', refreshToken);

    // ユーザーの認証状態を確認（ログイン状態）
    expect(mockSessionStorage.getItem('authToken')).toBe(validSessionToken);
    expect(mockLocalStorage.getItem('refreshToken')).toBe(refreshToken);

    // ログアウト処理を実行
    const logoutResult = await revokeSession(
      {
        sessionToken: validSessionToken,
        refreshToken: refreshToken,
      },
      identityProviderAdapterStub
    );

    // IdentityProviderAdapterのrevokeSessionメソッドが呼び出されたことを確認
    expect(identityProviderAdapterStub.revokeSession).toHaveBeenCalledWith({
      sessionToken: validSessionToken,
      refreshToken: refreshToken,
    });
    expect(identityProviderAdapterStub.revokeSession).toHaveBeenCalledTimes(1);

    // ブラウザのセッションストレージからトークンが削除されたことを確認
    expect(mockSessionStorage.getItem('authToken')).toBeNull();

    // ブラウザのローカルストレージからリフレッシュトークンが削除されたことを確認
    expect(mockLocalStorage.getItem('refreshToken')).toBeNull();

    // ユーザーの認証状態が「未認証」に遷移したことを確認
    expect(logoutResult.isAuthenticated).toBe(false);
    expect(logoutResult.sessionToken).toBeUndefined();

    // ログアウト後、ポータルの保護されたページへのアクセスを試みるとエラーが返される
    const protectedPageAccessResult = await revokeSession(
      {
        sessionToken: null,
        refreshToken: null,
      },
      identityProviderAdapterStub
    );

    // 認証エラー（401相当）またはアクセス拒否が発生することを確認
    expect(protectedPageAccessResult.statusCode).toBe(401);
    expect(protectedPageAccessResult.error).toMatch(/認証/);
  });
});