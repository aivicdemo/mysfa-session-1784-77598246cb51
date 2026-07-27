import { fetchPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-376: 対象期間の開始日より前の購買履歴は除外される', () => {
    const customer_id = 'CUST-001';
    const period_start = new Date('2024-01-01T00:00:00Z');
    const period_end = new Date('2024-12-31T23:59:59Z');

    const mock_purchase_history = [
      {
        purchase_id: 'PUR-001',
        customer_id: customer_id,
        purchase_date: new Date('2023-12-15T00:00:00Z'),
        amount: 50000,
      },
      {
        purchase_id: 'PUR-002',
        customer_id: customer_id,
        purchase_date: new Date('2024-01-05T00:00:00Z'),
        amount: 75000,
      },
      {
        purchase_id: 'PUR-003',
        customer_id: customer_id,
        purchase_date: new Date('2024-06-20T00:00:00Z'),
        amount: 120000,
      },
      {
        purchase_id: 'PUR-004',
        customer_id: customer_id,
        purchase_date: new Date('2025-02-10T00:00:00Z'),
        amount: 60000,
      },
    ];

    const result = fetchPurchaseHistory(
      customer_id,
      period_start,
      period_end,
      mock_purchase_history
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      purchase_id: 'PUR-002',
      customer_id: customer_id,
      purchase_date: new Date('2024-01-05T00:00:00Z'),
      amount: 75000,
    });
    expect(result[1]).toEqual({
      purchase_id: 'PUR-003',
      customer_id: customer_id,
      purchase_date: new Date('2024-06-20T00:00:00Z'),
      amount: 120000,
    });
  });
});