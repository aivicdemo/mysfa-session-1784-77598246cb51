import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as it_1_1 from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  it('SCEN-1013: GMO Payment Gateway連携 - generatePaymentLinkが失敗した場合、指数バックオフで最大3回の再試行が実行される', async () => {
    // スタブ: PaymentGatewayAdapter
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // 失敗レスポンスの設定：初回と3回の再試行で合計4回失敗
    mockPaymentGatewayAdapter.generatePaymentLink.mockRejectedValue(
      new Error('NetworkError')
    );

    // タイマースパイ：setTimeout呼び出しをインターセプト
    const timerCalls: Array<{ delay: number; timestamp: number }> = [];
    const originalSetTimeout = global.setTimeout;
    let startTime: number;

    const mockSetTimeout = jest.fn((callback: () => void, delay: number) => {
      timerCalls.push({ delay, timestamp: Date.now() - startTime });
      originalSetTimeout(callback, delay);
      return 0 as unknown as NodeJS.Timeout;
    });

    global.setTimeout = mockSetTimeout as any;

    try {
      startTime = Date.now();

      // テスト対象の呼び出し
      const testPayload = {
        invoiceId: 'INV-2024-001',
        amount: 100000,
      };

      // generatePaymentLinkMockWithRetry関数を呼び出す
      // （外部サービス連携の再試行ロジックを含む関数）
      let finalError: Error | null = null;
      try {
        await it_1_1.generatePaymentLinkWithRetry(
          testPayload,
          mockPaymentGatewayAdapter
        );
      } catch (err) {
        finalError = err as Error;
      }

      // 検証1: generatePaymentLinkが合計4回呼び出されたことを確認（初回1回+再試行3回）
      expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(
        4
      );

      // 検証2: setTimeout が3回呼び出されたことを確認（再試行3回のみ遅延設定）
      expect(mockSetTimeout).toHaveBeenCalledTimes(3);

      // 検証3: 再試行間隔が指数バックオフ（1秒→2秒→4秒）で正確であることを確認
      const delays = mockSetTimeout.mock.calls.map((call) => call[1]);
      expect(delays).toEqual([1000, 2000, 4000]);

      // 検証4: 最終的なエラーがスローされていることを確認
      expect(finalError).not.toBeNull();
      expect(finalError?.message).toMatch(/NetworkError|Payment/i);

      // 検証5: 各再試行呼び出し時のペイロードが一致していることを確認
      mockPaymentGatewayAdapter.generatePaymentLink.mock.calls.forEach(
        (call) => {
          expect(call[0]).toEqual(testPayload);
        }
      );
    } finally {
      global.setTimeout = originalSetTimeout;
    }
  });
});