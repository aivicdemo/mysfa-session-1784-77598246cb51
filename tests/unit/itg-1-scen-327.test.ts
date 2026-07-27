import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-327
  test('月次決算レポート生成時に複数商談の合計金額が指定された丸めルールに従って正確に丸められる', () => {
    // Arrange: テスト環境の初期化と複数商談レコードの準備
    const dealA = {
      id: 'deal-001',
      customerId: 'customer-001',
      amount: 1000.125,
      status: 'closed_won',
      invoiceDate: new Date('2024-04-15T10:30:00Z'),
    };

    const dealB = {
      id: 'deal-002',
      customerId: 'customer-002',
      amount: 2000.234,
      status: 'closed_won',
      invoiceDate: new Date('2024-04-18T14:15:00Z'),
    };

    const dealC = {
      id: 'deal-003',
      customerId: 'customer-003',
      amount: 3000.456,
      status: 'closed_won',
      invoiceDate: new Date('2024-04-22T09:45:00Z'),
    };

    const deals = [dealA, dealB, dealC];
    const reportMonth = '2024-04';

    // Act & Assert: 丸めルール「四捨五入」を適用
    const reportRoundHalf = generateMonthlySettlementReport(
      deals,
      reportMonth,
      'round_half_up'
    );
    // 1000.125 + 2000.234 + 3000.456 = 6000.815 → 四捨五入で 6000.82
    expect(reportRoundHalf.totalAmount).toBe(6000.82);
    expect(reportRoundHalf.roundingRule).toBe('round_half_up');
    expect(reportRoundHalf.dealCount).toBe(3);

    // Act & Assert: 丸めルール「切り上げ」を適用
    const reportRoundUp = generateMonthlySettlementReport(
      deals,
      reportMonth,
      'round_up'
    );
    // 1000.13 + 2000.24 + 3000.46 = 6000.83
    expect(reportRoundUp.totalAmount).toBe(6000.83);
    expect(reportRoundUp.roundingRule).toBe('round_up');

    // Act & Assert: 丸めルール「切り下げ」を適用
    const reportRoundDown = generateMonthlySettlementReport(
      deals,
      reportMonth,
      'round_down'
    );
    // 1000.12 + 2000.23 + 3000.45 = 6000.80
    expect(reportRoundDown.totalAmount).toBe(6000.80);
    expect(reportRoundDown.roundingRule).toBe('round_down');

    // Verify: 各ルール適用時のレポートデータが正確に反映されている
    expect(reportRoundHalf.month).toBe('2024-04');
    expect(reportRoundHalf.deals).toHaveLength(3);
    expect(reportRoundHalf.deals[0].amount).toBe(dealA.amount);
    expect(reportRoundHalf.deals[1].amount).toBe(dealB.amount);
    expect(reportRoundHalf.deals[2].amount).toBe(dealC.amount);

    expect(reportRoundUp.month).toBe('2024-04');
    expect(reportRoundUp.deals).toHaveLength(3);

    expect(reportRoundDown.month).toBe('2024-04');
    expect(reportRoundDown.deals).toHaveLength(3);

    // Verify: 異なる丸めルールでの結果が期待値と一致
    expect(reportRoundHalf.totalAmount).not.toBe(reportRoundUp.totalAmount);
    expect(reportRoundUp.totalAmount).not.toBe(reportRoundDown.totalAmount);
  });
});