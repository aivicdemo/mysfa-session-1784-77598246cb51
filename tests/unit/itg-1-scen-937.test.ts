import {
  reconcileSalesAndInvoiceData,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能', () => {
  // SCEN-937
  test('同一の請求書に紐付く複数の売上実績が存在する場合、すべてについて照合結果が返される', () => {
    const invoiceId = 'INV-001';
    const customerId = 'CUST-A';
    const invoiceAmount = 175000;
    const invoiceIssuedDate = new Date('2024-01-30T00:00:00Z');

    const salesRecords = [
      {
        salesRecordId: 'SR-001',
        invoiceId: invoiceId,
        customerId: customerId,
        amount: 100000,
        recordedDate: new Date('2024-01-15T00:00:00Z'),
      },
      {
        salesRecordId: 'SR-002',
        invoiceId: invoiceId,
        customerId: customerId,
        amount: 50000,
        recordedDate: new Date('2024-01-20T00:00:00Z'),
      },
      {
        salesRecordId: 'SR-003',
        invoiceId: invoiceId,
        customerId: customerId,
        amount: 25000,
        recordedDate: new Date('2024-01-25T00:00:00Z'),
      },
    ];

    const invoiceRecord = {
      invoiceId: invoiceId,
      customerId: customerId,
      amount: invoiceAmount,
      issuedDate: invoiceIssuedDate,
      status: 'issued',
    };

    const result = reconcileSalesAndInvoiceData(
      invoiceRecord,
      salesRecords
    );

    expect(result.reconciliationItems).toHaveLength(3);

    expect(result.reconciliationItems[0]).toEqual({
      salesRecordId: 'SR-001',
      linkedAmount: 100000,
      reconciliationStatus: 'reconciled',
    });

    expect(result.reconciliationItems[1]).toEqual({
      salesRecordId: 'SR-002',
      linkedAmount: 50000,
      reconciliationStatus: 'reconciled',
    });

    expect(result.reconciliationItems[2]).toEqual({
      salesRecordId: 'SR-003',
      linkedAmount: 25000,
      reconciliationStatus: 'reconciled',
    });

    expect(result.totalReconciliationAmount).toBe(175000);
    expect(result.isReconciliationComplete).toBe(true);
  });
});