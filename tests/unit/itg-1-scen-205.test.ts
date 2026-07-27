import { aggregateCustomerDealProgress } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-205: [edge] 顧客別商談進捗集計機能 - 小数点以下の金額が含まれるとき、端数が正確に処理される
  test('小数点以下の金額を含む複数の商談について、顧客別合計金額・全体合計金額が円単位で正確に四捨五入されて集計され、画面表示時に小数点第2位までの通貨形式で正確に表示される', () => {
    // テスト用の商談データ（小数点以下の金額を含む）
    const dealData = [
      {
        dealId: 'deal_001',
        customerId: 'customer_A',
        customerName: '顧客A',
        amount: 15234.567,
        status: '提案中',
      },
      {
        dealId: 'deal_002',
        customerId: 'customer_A',
        customerName: '顧客A',
        amount: 8765.432,
        status: '交渉中',
      },
      {
        dealId: 'deal_003',
        customerId: 'customer_B',
        customerName: '顧客B',
        amount: 22100.891,
        status: '受注',
      },
    ];

    // 集計機能を実行
    const result = aggregateCustomerDealProgress(dealData);

    // 顧客Aの合計金額を検証
    const customerATotal = result.customerTotals.find((c) => c.customerId === 'customer_A');
    expect(customerATotal).toBeDefined();
    expect(customerATotal!.totalAmount).toBe(24000.00); // 15234.567 + 8765.432 = 24000.00（四捨五入）

    // 顧客Bの合計金額を検証
    const customerBTotal = result.customerTotals.find((c) => c.customerId === 'customer_B');
    expect(customerBTotal).toBeDefined();
    expect(customerBTotal!.totalAmount).toBe(22100.90); // 22100.891 = 22100.90（四捨五入）

    // 全体合計金額を検証
    expect(result.grandTotal).toBe(46100.90); // 24000.00 + 22100.90 = 46100.90

    // 画面表示用フォーマット（小数点第2位までの通貨形式）を検証
    expect(customerATotal!.displayAmount).toBe('¥24,000.00');
    expect(customerBTotal!.displayAmount).toBe('¥22,100.90');
    expect(result.displayGrandTotal).toBe('¥46,100.90');
  });
});