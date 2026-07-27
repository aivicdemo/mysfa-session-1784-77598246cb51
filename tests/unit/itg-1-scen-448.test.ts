import { fetchCustomerNegotiationHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-448
  test('[normal] 商談履歴が時系列（昇順）で並んでいる場合、その順序で返される', () => {
    const customerId = 'CUST-001';
    
    const mockNegotiationRecords = [
      {
        negotiationId: 'NEG-001',
        date: new Date('2024-01-15T10:00:00Z'),
        projectName: 'A社 初期提案',
        amount: 1000000,
      },
      {
        negotiationId: 'NEG-002',
        date: new Date('2024-03-20T14:30:00Z'),
        projectName: 'A社 最終提案',
        amount: 1500000,
      },
      {
        negotiationId: 'NEG-003',
        date: new Date('2024-05-10T09:15:00Z'),
        projectName: 'A社 契約締結',
        amount: 1500000,
      },
    ];

    const result = fetchCustomerNegotiationHistory(customerId, mockNegotiationRecords);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      negotiationId: 'NEG-001',
      date: new Date('2024-01-15T10:00:00Z'),
      projectName: 'A社 初期提案',
      amount: 1000000,
    });
    expect(result[1]).toEqual({
      negotiationId: 'NEG-002',
      date: new Date('2024-03-20T14:30:00Z'),
      projectName: 'A社 最終提案',
      amount: 1500000,
    });
    expect(result[2]).toEqual({
      negotiationId: 'NEG-003',
      date: new Date('2024-05-10T09:15:00Z'),
      projectName: 'A社 契約締結',
      amount: 1500000,
    });
    
    const dates = result.map(record => record.date.getTime());
    expect(dates[0]).toBeLessThan(dates[1]);
    expect(dates[1]).toBeLessThan(dates[2]);
  });
});