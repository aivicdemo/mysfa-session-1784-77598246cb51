import { filterPurchaseHistoryByCurrentMonth } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-388
  test('月初日の購買履歴がフィルタリングされる', () => {
    const customerId = 'CUST-001';
    const customerName = '株式会社テスト';
    const customerCreatedAt = new Date('2024-01-01T00:00:00Z');

    const currentMonth = new Date('2024-04-15T10:00:00Z');
    const monthStart = new Date('2024-04-01T00:00:00Z');
    const monthEnd = new Date('2024-04-30T23:59:59Z');
    const prevMonthEnd = new Date('2024-03-31T23:59:59Z');
    const nextMonthStart = new Date('2024-05-02T00:00:00Z');

    const purchaseHistories = [
      {
        purchaseId: 'PURCH-001',
        customerId,
        amount: 100000,
        purchasedAt: new Date('2024-04-01T00:00:00Z'),
      },
      {
        purchaseId: 'PURCH-002',
        customerId,
        amount: 150000,
        purchasedAt: new Date('2024-04-01T12:00:00Z'),
      },
      {
        purchaseId: 'PURCH-003',
        customerId,
        amount: 200000,
        purchasedAt: new Date('2024-04-01T23:59:59Z'),
      },
      {
        purchaseId: 'PURCH-004',
        customerId,
        amount: 50000,
        purchasedAt: prevMonthEnd,
      },
      {
        purchaseId: 'PURCH-005',
        customerId,
        amount: 75000,
        purchasedAt: nextMonthStart,
      },
    ];

    const customer = {
      customerId,
      customerName,
      createdAt: customerCreatedAt,
    };

    const filteredHistories = filterPurchaseHistoryByCurrentMonth(
      customer,
      purchaseHistories,
      currentMonth
    );

    expect(filteredHistories).toHaveLength(3);
    expect(filteredHistories[0]).toEqual({
      purchaseId: 'PURCH-001',
      customerId,
      amount: 100000,
      purchasedAt: new Date('2024-04-01T00:00:00Z'),
    });
    expect(filteredHistories[1]).toEqual({
      purchaseId: 'PURCH-002',
      customerId,
      amount: 150000,
      purchasedAt: new Date('2024-04-01T12:00:00Z'),
    });
    expect(filteredHistories[2]).toEqual({
      purchaseId: 'PURCH-003',
      customerId,
      amount: 200000,
      purchasedAt: new Date('2024-04-01T23:59:59Z'),
    });
  });
});