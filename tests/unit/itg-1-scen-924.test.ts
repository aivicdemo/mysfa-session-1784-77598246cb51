import { reconcileSalesWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-924
  test('対象の売上実績が複数件の場合、すべての件について照合結果が返される', async () => {
    const salesRecords = [
      {
        salesId: 'SR001',
        customerId: 'CUST001',
        amount: 100000,
        date: new Date('2024-04-10T09:00:00Z'),
      },
      {
        salesId: 'SR002',
        customerId: 'CUST001',
        amount: 150000,
        date: new Date('2024-04-15T10:30:00Z'),
      },
      {
        salesId: 'SR003',
        customerId: 'CUST001',
        amount: 200000,
        date: new Date('2024-04-20T14:15:00Z'),
      },
    ];

    const invoiceRecords = [
      {
        invoiceId: 'INV001',
        customerId: 'CUST001',
        amount: 100000,
        linkedSalesId: 'SR001',
        issuedDate: new Date('2024-04-10T15:00:00Z'),
      },
      {
        invoiceId: 'INV002',
        customerId: 'CUST001',
        amount: 150000,
        linkedSalesId: 'SR002',
        issuedDate: new Date('2024-04-15T16:00:00Z'),
      },
      {
        invoiceId: 'INV003',
        customerId: 'CUST001',
        amount: 200000,
        linkedSalesId: 'SR003',
        issuedDate: new Date('2024-04-20T16:30:00Z'),
      },
    ];

    const result = await reconcileSalesWithInvoices({
      salesIds: ['SR001', 'SR002', 'SR003'],
      salesRecords,
      invoiceRecords,
    });

    expect(result.reconciliationResults).toHaveLength(3);

    expect(result.reconciliationResults[0]).toEqual({
      salesId: 'SR001',
      invoiceId: 'INV001',
      status: 'matched',
      salesAmount: 100000,
      invoiceAmount: 100000,
      amountDifference: 0,
    });

    expect(result.reconciliationResults[1]).toEqual({
      salesId: 'SR002',
      invoiceId: 'INV002',
      status: 'matched',
      salesAmount: 150000,
      invoiceAmount: 150000,
      amountDifference: 0,
    });

    expect(result.reconciliationResults[2]).toEqual({
      salesId: 'SR003',
      invoiceId: 'INV003',
      status: 'matched',
      salesAmount: 200000,
      invoiceAmount: 200000,
      amountDifference: 0,
    });
  });
});