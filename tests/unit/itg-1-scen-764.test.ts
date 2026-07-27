import { extractDealDataForBilling } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-764
  test('請求対象データ抽出機能 - 抽出条件に合致する商談成約データが複数件のとき、全レコードを返す', () => {
    const extraction_condition = {
      status: '成約済み',
      contract_month: '2024-01',
    };

    const mock_deal_records = [
      {
        deal_id: 'DL001',
        customer_name: '顧客A',
        amount: 100000,
        contract_date: '2024-01-15',
        status: '成約済み',
      },
      {
        deal_id: 'DL002',
        customer_name: '顧客B',
        amount: 250000,
        contract_date: '2024-01-16',
        status: '成約済み',
      },
      {
        deal_id: 'DL003',
        customer_name: '顧客C',
        amount: 150000,
        contract_date: '2024-01-17',
        status: '成約済み',
      },
    ];

    const result = extractDealDataForBilling(extraction_condition, mock_deal_records);

    expect(result).toHaveLength(3);

    expect(result[0]).toEqual({
      deal_id: 'DL001',
      customer_name: '顧客A',
      amount: 100000,
      contract_date: '2024-01-15',
      status: '成約済み',
    });

    expect(result[1]).toEqual({
      deal_id: 'DL002',
      customer_name: '顧客B',
      amount: 250000,
      contract_date: '2024-01-16',
      status: '成約済み',
    });

    expect(result[2]).toEqual({
      deal_id: 'DL003',
      customer_name: '顧客C',
      amount: 150000,
      contract_date: '2024-01-17',
      status: '成約済み',
    });
  });
});