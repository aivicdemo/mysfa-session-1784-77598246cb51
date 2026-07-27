import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-342
  test('月次決算レポート生成機能 - 請求書紐付けステータスが1件のレコード存在するとき、請求金額として集計される', () => {
    const targetMonth = '2024-04';
    const invoicedRecord = {
      salesId: 'SALES-001',
      customerId: 'CUST-A001',
      dealAmount: 100000,
      invoiceAttachmentStatus: '紐付け済み',
      invoiceAmount: 100000,
      invoiceIssuedDate: '2024-04-15',
      dealStatus: '受注',
    };

    const salesRecords = [invoicedRecord];

    const generatedReport = generateMonthlySettlementReport(
      targetMonth,
      salesRecords
    );

    expect(generatedReport.targetMonth).toBe('2024-04');
    expect(generatedReport.totalInvoiceAmount).toBe(100000);
    expect(generatedReport.recordCount).toBe(1);
    expect(generatedReport.invoicedRecords).toHaveLength(1);
    expect(generatedReport.invoicedRecords[0]).toEqual({
      salesId: 'SALES-001',
      customerId: 'CUST-A001',
      dealAmount: 100000,
      invoiceAttachmentStatus: '紐付け済み',
      invoiceAmount: 100000,
      invoiceIssuedDate: '2024-04-15',
      dealStatus: '受注',
    });
  });
});