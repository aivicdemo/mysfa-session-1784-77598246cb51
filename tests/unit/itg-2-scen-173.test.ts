import { generatePaymentLinkWithRetry } from '../../src/logic/it-1784969823049-2-1-2';

describe('GMO Payment Gateway連携 - generatePaymentLink失敗時の指数バックオフ再試行', () => {
  // SCEN-173: [error] GMO Payment Gateway連携 - generatePaymentLinkが失敗した場合、最大3回の指数バックオフ再試行が実行される
  test('generatePaymentLinkが失敗した場合、指数バックオフで1秒→2秒→4秒の間隔で最大3回の再試行が実行され、フォールバック処理へ遷移すること', async () => {
    const invoiceId = 'INV-20240115-001';
    const amount = 150000;
    const customerId = 'CUST-12345';

    const callTimestamps: number[] = [];
    let callCount = 0;

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(async () => {
        callTimestamps.push(Date.now());
        callCount++;
        throw new Error('Payment gateway temporary failure');
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const result = await generatePaymentLinkWithRetry(
      invoiceId,
      amount,
      customerId,
      mockPaymentGatewayAdapter
    );

    // 初回呼び出し + 再試行3回 = 合計4回の呼び出しを検証
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(4);

    // 呼び出し間隔の検証
    const firstToSecondInterval = callTimestamps[1] - callTimestamps[0];
    const secondToThirdInterval = callTimestamps[2] - callTimestamps[1];
    const thirdToFourthInterval = callTimestamps[3] - callTimestamps[2];

    // 第1回から第2回の間隔: 1秒 (1000ms ± 100ms の許容誤差)
    expect(firstToSecondInterval).toBeGreaterThanOrEqual(900);
    expect(firstToSecondInterval).toBeLessThanOrEqual(1100);

    // 第2回から第3回の間隔: 2秒 (2000ms ± 100ms の許容誤差)
    expect(secondToThirdInterval).toBeGreaterThanOrEqual(1900);
    expect(secondToThirdInterval).toBeLessThanOrEqual(2100);

    // 第3回から第4回の間隔: 4秒 (4000ms ± 100ms の許容誤差)
    expect(thirdToFourthInterval).toBeGreaterThanOrEqual(3900);
    expect(thirdToFourthInterval).toBeLessThanOrEqual(4100);

    // フォールバック処理: 銀行振込先情報のみが返却されること
    expect(result).toEqual({
      status: 'fallback_bank_transfer',
      invoiceId,
      message: '支払いリンクの生成に失敗しました。銀行振込でお支払いください',
      bankTransferInfo: {
        bankName: expect.any(String),
        accountNumber: expect.any(String),
        branchCode: expect.any(String),
      },
    });

    // 各呼び出しに正しい引数が渡されたことを検証
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      invoiceId,
      amount,
      customerId
    );
  });
});