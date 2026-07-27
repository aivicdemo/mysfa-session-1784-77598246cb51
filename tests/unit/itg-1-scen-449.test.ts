import { fetchDealHistoryForCustomer } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-449
  test('商談履歴が逆時系列（降順）で並んでいる場合、その順序で返される', () => {
    const customer_id = 'CUST-001';
    const deal_histories = [
      {
        deal_id: 'DEAL-001',
        customer_id: customer_id,
        deal_date: new Date('2024-01-15T00:00:00Z'),
        deal_name: 'Deal A',
        amount: 100000,
        status: 'proposal',
      },
      {
        deal_id: 'DEAL-002',
        customer_id: customer_id,
        deal_date: new Date('2024-01-10T00:00:00Z'),
        deal_name: 'Deal B',
        amount: 50000,
        status: 'proposal',
      },
      {
        deal_id: 'DEAL-003',
        customer_id: customer_id,
        deal_date: new Date('2024-01-20T00:00:00Z'),
        deal_name: 'Deal C',
        amount: 150000,
        status: 'won',
      },
      {
        deal_id: 'DEAL-004',
        customer_id: customer_id,
        deal_date: new Date('2024-01-05T00:00:00Z'),
        deal_name: 'Deal D',
        amount: 25000,
        status: 'initial',
      },
      {
        deal_id: 'DEAL-005',
        customer_id: customer_id,
        deal_date: new Date('2024-01-18T00:00:00Z'),
        deal_name: 'Deal E',
        amount: 120000,
        status: 'negotiation',
      },
    ];

    const result = fetchDealHistoryForCustomer(customer_id, deal_histories);

    expect(result).toEqual([
      {
        deal_id: 'DEAL-003',
        customer_id: customer_id,
        deal_date: new Date('2024-01-20T00:00:00Z'),
        deal_name: 'Deal C',
        amount: 150000,
        status: 'won',
      },
      {
        deal_id: 'DEAL-005',
        customer_id: customer_id,
        deal_date: new Date('2024-01-18T00:00:00Z'),
        deal_name: 'Deal E',
        amount: 120000,
        status: 'negotiation',
      },
      {
        deal_id: 'DEAL-001',
        customer_id: customer_id,
        deal_date: new Date('2024-01-15T00:00:00Z'),
        deal_name: 'Deal A',
        amount: 100000,
        status: 'proposal',
      },
      {
        deal_id: 'DEAL-002',
        customer_id: customer_id,
        deal_date: new Date('2024-01-10T00:00:00Z'),
        deal_name: 'Deal B',
        amount: 50000,
        status: 'proposal',
      },
      {
        deal_id: 'DEAL-004',
        customer_id: customer_id,
        deal_date: new Date('2024-01-05T00:00:00Z'),
        deal_name: 'Deal D',
        amount: 25000,
        status: 'initial',
      },
    ]);
  });
});