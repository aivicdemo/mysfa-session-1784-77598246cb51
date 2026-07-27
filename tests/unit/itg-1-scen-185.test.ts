import { aggregateDealsByCustomerAndStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-185
  test('顧客別商談進捗集計機能 - 提案中ステータスの商談が複数件のとき、合計金額が正確に集計される', () => {
    const customerId = 'CUST-001';
    const dealProposingStatus = '提案中';

    const deals = [
      {
        deal_id: 'DEAL-101',
        customer_id: customerId,
        status: dealProposingStatus,
        amount: 500000,
      },
      {
        deal_id: 'DEAL-102',
        customer_id: customerId,
        status: dealProposingStatus,
        amount: 750000,
      },
      {
        deal_id: 'DEAL-103',
        customer_id: customerId,
        status: dealProposingStatus,
        amount: 1200000,
      },
    ];

    const result = aggregateDealsByCustomerAndStatus(deals, customerId, dealProposingStatus);

    expect(result.total_amount).toBe(2450000);
    expect(result.deal_count).toBe(3);
    expect(result.customer_id).toBe(customerId);
    expect(result.status).toBe(dealProposingStatus);
  });
});