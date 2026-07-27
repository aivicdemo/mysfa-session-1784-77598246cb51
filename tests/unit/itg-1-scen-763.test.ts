import { extractInvoiceTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-763: 請求対象データ抽出機能 - 抽出条件に合致する商談成約データが1件のとき、該当レコードを返す', () => {
    // Arrange: モックデータソースの準備
    const matching_deal = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST001',
      contract_date: '2024-01-15',
      status: '成約済み',
      amount: 500000,
      product: '製品A',
    };

    const non_matching_deals = [
      {
        deal_id: 'DEAL-002',
        customer_id: 'CUST002',
        contract_date: '2024-01-15',
        status: '成約済み',
        amount: 300000,
        product: '製品B',
      },
      {
        deal_id: 'DEAL-003',
        customer_id: 'CUST001',
        contract_date: '2024-01-20',
        status: '成約済み',
        amount: 250000,
        product: '製品C',
      },
      {
        deal_id: 'DEAL-004',
        customer_id: 'CUST001',
        contract_date: '2024-01-15',
        status: '提案中',
        amount: 150000,
        product: '製品D',
      },
    ];

    const all_deals = [matching_deal, ...non_matching_deals];

    const extraction_criteria = {
      customer_id: 'CUST001',
      contract_date: '2024-01-15',
      status: '成約済み',
    };

    // Act: 抽出機能を実行
    const result = extractInvoiceTargetData(all_deals, extraction_criteria);

    // Assert: 返却されたレコード集合を検証
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      deal_id: 'DEAL-001',
      customer_id: 'CUST001',
      contract_date: '2024-01-15',
      status: '成約済み',
      amount: 500000,
      product: '製品A',
    });
  });
});