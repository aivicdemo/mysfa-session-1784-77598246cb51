import { validateInvoiceAmount } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-102
  test('請求書の金額が顧客期待値と1%以下のズレの場合、許容範囲内として検証完了と判定される', () => {
    const customerExpectedAmount = 100000;
    const systemCalculatedAmount = 100500;
    const toleranceThreshold = 0.01;

    const result = validateInvoiceAmount({
      customerExpectedAmount,
      systemCalculatedAmount,
      toleranceThreshold,
    });

    const deviationRate = Math.abs(systemCalculatedAmount - customerExpectedAmount) / customerExpectedAmount;

    expect(result.isValid).toBe(true);
    expect(result.status).toBe('VERIFICATION_COMPLETE');
    expect(result.message).toBe('請求内容は許容範囲内です');
    expect(result.deviationRate).toBe(0.005);
    expect(result.systemAmount).toBe(100500);
    expect(result.expectedAmount).toBe(100000);
    expect(deviationRate <= toleranceThreshold).toBe(true);
  });
});