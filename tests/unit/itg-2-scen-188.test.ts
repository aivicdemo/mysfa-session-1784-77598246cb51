import { authenticateUser } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-188
  test('[error] Amazon Cognito連携 - 認証リクエストが失敗した場合、3秒待機後に最大3回まで自動再試行が実行される', async () => {
    jest.useFakeTimers();

    const mockIdentityProvider = {
      authenticateUser: jest.fn(),
    };

    const networkTimeoutError = new Error('Network timeout');

    const validToken = {
      accessToken: 'valid_access_token_abc123',
      tokenType: 'Bearer',
      expiresIn: 3600,
    };

    // 初回～3回目の呼び出しで失敗、4回目で成功
    mockIdentityProvider.authenticateUser
      .mockRejectedValueOnce(networkTimeoutError)
      .mockRejectedValueOnce(networkTimeoutError)
      .mockRejectedValueOnce(networkTimeoutError)
      .mockResolvedValueOnce(validToken);

    const authPromise = authenticateUser(
      { username: 'customer@example.com', password: 'secure_password' },
      mockIdentityProvider,
    );

    // 初回の呼び出しが発生
    await jest.advanceTimersByTimeAsync(0);
    expect(mockIdentityProvider.authenticateUser).toHaveBeenCalledTimes(1);

    // 3秒の待機時間を進める → 2回目の再試行が実行
    await jest.advanceTimersByTimeAsync(3000);
    expect(mockIdentityProvider.authenticateUser).toHaveBeenCalledTimes(2);

    // 次の3秒の待機時間を進める → 3回目の再試行が実行
    await jest.advanceTimersByTimeAsync(3000);
    expect(mockIdentityProvider.authenticateUser).toHaveBeenCalledTimes(3);

    // さらに3秒の待機時間を進める → 4回目の再試行が実行（最後の再試行）
    await jest.advanceTimersByTimeAsync(3000);
    expect(mockIdentityProvider.authenticateUser).toHaveBeenCalledTimes(4);

    // 認証リクエストの完了を待機
    const result = await authPromise;

    // 合計呼び出し回数は4回（初回1回 + 自動再試行3回）
    expect(mockIdentityProvider.authenticateUser).toHaveBeenCalledTimes(4);

    // 4回目で返された有効な認証トークンが呼び出し元に返される
    expect(result).toEqual({
      accessToken: 'valid_access_token_abc123',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    // 再試行の総経過時間は約9秒（3秒×3回）
    expect(jest.getTimerCount()).toBe(0);

    jest.useRealTimers();
  });
});