import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-765: [edge] 請求対象データ抽出機能 - ステータス条件がちょうど一致するとき、該当データが抽出される
  test('ステータス「請求待ち」で抽出すると、該当する3件のみが返される', () => {
    const testDataSet = [
      {
        id: 'deal-001',
        customerId: 'cust-A',
        customerName: '顧客A',
        status: '請求待ち',
        amount: 100000,
      },
      {
        id: 'deal-002',
        customerId: 'cust-B',
        customerName: '顧客B',
        status: '請求待ち',
        amount: 200000,
      },
      {
        id: 'deal-003',
        customerId: 'cust-C',
        customerName: '顧客C',
        status: '請求待ち',
        amount: 150000,
      },
      {
        id: 'deal-004',
        customerId: 'cust-D',
        customerName: '顧客D',
        status: '請求済み',
        amount: 120000,
      },
      {
        id: 'deal-005',
        customerId: 'cust-E',
        customerName: '顧客E',
        status: '請求済み',
        amount: 180000,
      },
      {
        id: 'deal-006',
        customerId: 'cust-F',
        customerName: '顧客F',
        status: '下書き',
        amount: 90000,
      },
      {
        id: 'deal-007',
        customerId: 'cust-G',
        customerName: '顧客G',
        status: '下書き',
        amount: 110000,
      },
      {
        id: 'deal-008',
        customerId: 'cust-H',
        customerName: '顧客H',
        status: 'キャンセル',
        amount: 70000,
      },
    ];

    const extractionCondition = {
      status: '請求待ち',
    };

    const result = extractBillingTargetData(testDataSet, extractionCondition);

    expect(result).toHaveLength(3);

    expect(result.every((record) => record.status === '請求待ち')).toBe(true);

    const extractedIds = new Set(result.map((r) => r.id));
    expect(extractedIds.has('deal-001')).toBe(true);
    expect(extractedIds.has('deal-002')).toBe(true);
    expect(extractedIds.has('deal-003')).toBe(true);

    expect(result.every((record) => record.status !== '請求済み')).toBe(true);
    expect(result.every((record) => record.status !== '下書き')).toBe(true);
    expect(result.every((record) => record.status !== 'キャンセル')).toBe(true);
  });
});