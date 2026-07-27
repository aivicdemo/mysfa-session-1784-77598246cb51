import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-201
  test('顧客別商談進捗集計機能 - 同一顧客に同じステータスの商談が複数件あるとき、件数と合計金額が正確に集計される', () => {
    const customer_name = 'A株式会社';
    const deals = [
      {
        customer_name: customer_name,
        status: '商談中',
        amount: 1000000,
      },
      {
        customer_name: customer_name,
        status: '商談中',
        amount: 1500000,
      },
      {
        customer_name: customer_name,
        status: '商談中',
        amount: 2000000,
      },
      {
        customer_name: customer_name,
        status: '提案済み',
        amount: 800000,
      },
      {
        customer_name: customer_name,
        status: '提案済み',
        amount: 1200000,
      },
    ];

    const result = aggregateDealProgressByCustomer(deals, customer_name);

    const in_negotiation = result.find((item) => item.status === '商談中');
    expect(in_negotiation).toBeDefined();
    expect(in_negotiation!.count).toBe(3);
    expect(in_negotiation!.total_amount).toBe(4500000);

    const proposal_submitted = result.find((item) => item.status === '提案済み');
    expect(proposal_submitted).toBeDefined();
    expect(proposal_submitted!.count).toBe(2);
    expect(proposal_submitted!.total_amount).toBe(2000000);
  });
});