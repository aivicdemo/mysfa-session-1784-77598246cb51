import { validateInvoiceAmount } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-101
  test('請求書の金額が顧客期待値と5%以上ズレている場合、異常フラグが立てられ営業に通知される', () => {
    const customerId = 'CUST-001';
    const invoiceId = 'INV-20240115-001';
    const expectedAmount = 10000;
    const actualAmount = 10600;
    const tolerancePercentage = 5;

    const result = validateInvoiceAmount({
      customerId,
      invoiceId,
      expectedAmount,
      actualAmount,
      tolerancePercentage,
    });

    // 期待値から5%以上ズレているかを計算: (10600 - 10000) / 10000 * 100 = 6%
    const deviationPercentage = ((actualAmount - expectedAmount) / expectedAmount) * 100;

    // 異常フラグが立てられていることを確認
    expect(result.anomalyFlagSet).toBe(true);

    // ズレの割合を確認（6%）
    expect(result.deviationPercentage).toBe(6);

    // 営業チームへの通知が送信されたことを確認
    expect(result.notificationSent).toBe(true);

    // 通知内容に必要な情報がすべて含まれていることを確認
    expect(result.notification).toEqual({
      customerId: 'CUST-001',
      invoiceId: 'INV-20240115-001',
      expectedAmount: 10000,
      actualAmount: 10600,
      deviationPercentage: 6,
      message: 'Invoice amount deviation detected',
      severity: 'warning',
    });

    // 通知が営業チームに送信されたことを確認
    expect(result.notificationLog).toBeDefined();
    expect(result.notificationLog.recipientTeam).toBe('sales');
    expect(result.notificationLog.timestamp).toBeDefined();
  });
});