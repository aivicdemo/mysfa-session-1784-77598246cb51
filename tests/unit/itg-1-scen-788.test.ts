import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-788
  test('請求対象データ抽出機能 - 重複する商談成約データが存在するとき、全件が抽出される', () => {
    const duplicate_deal_1 = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-100',
      product_id: 'PROD-50',
      contract_amount: 150000,
      contract_date: '2024-04-15',
      status: 'confirmed',
    };

    const duplicate_deal_2 = {
      deal_id: 'DEAL-002',
      customer_id: 'CUST-100',
      product_id: 'PROD-50',
      contract_amount: 150000,
      contract_date: '2024-04-15',
      status: 'confirmed',
    };

    const test_deals = [duplicate_deal_1, duplicate_deal_2];

    const extraction_condition = {
      status: 'confirmed',
    };

    const result = extractBillingTargetData(test_deals, extraction_condition);

    expect(result).toEqual({
      record_count: 2,
      data: [
        {
          deal_id: 'DEAL-001',
          customer_id: 'CUST-100',
          product_id: 'PROD-50',
          contract_amount: 150000,
          contract_date: '2024-04-15',
          status: 'confirmed',
        },
        {
          deal_id: 'DEAL-002',
          customer_id: 'CUST-100',
          product_id: 'PROD-50',
          contract_amount: 150000,
          contract_date: '2024-04-15',
          status: 'confirmed',
        },
      ],
    });
  });
});