import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-346
  test('月次決算レポート生成機能 - 請求書ステータスが『支払済』のとき、請求金額として集計される', () => {
    const invoices = [
      {
        invoiceId: 'INV-001',
        customerName: 'テスト顧客A',
        invoiceAmount: 100000,
        invoiceDate: new Date('2024-01-15T00:00:00Z'),
        status: '支払済'
      },
      {
        invoiceId: 'INV-002',
        customerName: 'テスト顧客B',
        invoiceAmount: 50000,
        invoiceDate: new Date('2024-01-20T00:00:00Z'),
        status: '未払'
      },
      {
        invoiceId: 'INV-003',
        customerName: 'テスト顧客C',
        invoiceAmount: 30000,
        invoiceDate: new Date('2024-01-25T00:00:00Z'),
        status: '支払済'
      }
    ];

    const reportMonth = new Date('2024-01-01T00:00:00Z');

    const report = generateMonthlySettlementReport(invoices, reportMonth);

    expect(report.totalInvoiceAmount).toBe(130000);
    expect(report.statusBreakdown).toEqual({
      '支払済': 130000,
      '未払': 50000
    });
    expect(report.invoiceCount).toEqual({
      '支払済': 2,
      '未払': 1
    });
  });
});