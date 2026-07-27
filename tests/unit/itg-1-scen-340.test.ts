import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-340
  test('月次決算レポート生成機能 - 商談売上金額が空のレコードが含まれるときエラーが発生する', () => {
    const targetMonth = new Date('2024-04-01T00:00:00Z');
    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        amount: 500000,
        status: 'won',
        invoiceDate: new Date('2024-04-15T00:00:00Z'),
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        amount: null,
        status: 'won',
        invoiceDate: new Date('2024-04-20T00:00:00Z'),
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        amount: 300000,
        status: 'won',
        invoiceDate: new Date('2024-04-25T00:00:00Z'),
      },
    ];

    expect(() => {
      generateMonthlyRevenueReport({
        deals,
        targetMonth,
      });
    }).toThrow(/商談売上金額が空です.*DEAL-002/);
  });
});