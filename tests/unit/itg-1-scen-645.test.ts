import { determineUnrecordedSalesStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-645
  test('売上実績が存在しないとき、売上未計上状態と判定される', () => {
    const invoiceId = 'INV-20240115-001';
    const customerId = 'CUST-001';
    const invoiceAmount = 100000;
    const invoiceDate = new Date('2024-01-15T00:00:00Z');

    const invoiceRecord = {
      invoiceId: invoiceId,
      customerId: customerId,
      invoiceAmount: invoiceAmount,
      invoiceDate: invoiceDate,
      invoiceStatus: 'issued',
    };

    const salesRecords: typeof invoiceRecord[] = [];

    const result = determineUnrecordedSalesStatus(invoiceRecord, salesRecords);

    expect(result.isUnrecorded).toBe(true);
    expect(result.status).toBe('未計上');
    expect(result.unrecordedAmount).toBe(100000);
  });
});