import { detectSalesRevenueDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-256
  test('売上請求ズレ検出機能 - 商談が受注ステータスで請求書が発行済みの場合に売上計上予定日と請求日が一致して照合成功と判定される', () => {
    const dealRecordId = 'DEAL-001';
    const customerId = 'CUST-001';
    const dealAmount = 1000000;
    const dealStatus = '受注';
    const revenueRecognitionDate = new Date('2024-04-15T00:00:00Z');
    const invoiceId = 'INV-001';
    const invoiceStatus = '発行済み';
    const invoiceIssuedDate = new Date('2024-04-15T00:00:00Z');

    const testDealData = {
      dealRecordId: dealRecordId,
      customerId: customerId,
      dealAmount: dealAmount,
      dealStatus: dealStatus,
      revenueRecognitionDate: revenueRecognitionDate,
    };

    const testInvoiceData = {
      invoiceId: invoiceId,
      dealRecordId: dealRecordId,
      customerId: customerId,
      invoiceStatus: invoiceStatus,
      invoiceIssuedDate: invoiceIssuedDate,
      invoiceAmount: dealAmount,
    };

    const result = detectSalesRevenueDiscrepancy(testDealData, testInvoiceData);

    expect(result).toEqual({
      dealRecordId: dealRecordId,
      invoiceId: invoiceId,
      matchStatus: '照合成功',
      dealStatus: dealStatus,
      invoiceStatus: invoiceStatus,
      revenueRecognitionDate: revenueRecognitionDate,
      invoiceIssuedDate: invoiceIssuedDate,
      discrepancyDays: 0,
      isDiscrepancyDetected: false,
      unmatchedInvoiceFlag: false,
      delayedInvoiceFlag: false,
    });

    expect(result.matchStatus).toBe('照合成功');
    expect(result.isDiscrepancyDetected).toBe(false);
    expect(result.discrepancyDays).toBe(0);
    expect(result.unmatchedInvoiceFlag).toBe(false);
    expect(result.delayedInvoiceFlag).toBe(false);
  });
});