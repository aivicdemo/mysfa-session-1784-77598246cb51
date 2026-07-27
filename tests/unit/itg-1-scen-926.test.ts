import { detectDelayedInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-926: 売上実績・請求データ照合機能 - 売上計上予定日が請求日より1日前の場合、遅延案件として検出される', () => {
    const salesPerformanceRecord = {
      salesPerformanceId: 'SR-001',
      customerId: 'CUST-A',
      salesAmount: 100000,
      expectedBookingDate: new Date('2024-01-15T00:00:00Z'),
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      customerId: 'CUST-A',
      invoiceAmount: 100000,
      invoiceDate: new Date('2024-01-16T00:00:00Z'),
    };

    const result = detectDelayedInvoices([salesPerformanceRecord], [invoiceRecord]);

    expect(result.delayedInvoices).toHaveLength(1);
    expect(result.delayedInvoices[0]).toEqual({
      salesPerformanceId: 'SR-001',
      invoiceId: 'INV-001',
      delayDays: 1,
      expectedBookingDate: new Date('2024-01-15T00:00:00Z'),
      invoiceDate: new Date('2024-01-16T00:00:00Z'),
      status: '遅延',
      isDelayed: true,
    });
    expect(result.delayedInvoices[0].isDelayed).toBe(true);
  });
});