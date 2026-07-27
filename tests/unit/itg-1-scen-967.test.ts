import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-967
  test('売上実績と請求書の照合データが逆順で提供される場合、順序に関わらず照合結果が一致する', () => {
    const salesData = [
      {
        salesId: 'S001',
        customerId: 'CUST001',
        amount: 1000000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
      {
        salesId: 'S002',
        customerId: 'CUST002',
        amount: 500000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
      {
        salesId: 'S003',
        customerId: 'CUST003',
        amount: 300000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
    ];

    const invoicesDataReversed = [
      {
        invoiceId: 'I003',
        customerId: 'CUST003',
        amount: 300000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
      {
        invoiceId: 'I002',
        customerId: 'CUST002',
        amount: 500000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
      {
        invoiceId: 'I001',
        customerId: 'CUST001',
        amount: 1000000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
    ];

    const reconciliationResult = reconcileSalesAndInvoices(
      salesData,
      invoicesDataReversed
    );

    expect(reconciliationResult.status).toBe('完全一致');
    expect(reconciliationResult.matchedCount).toBe(3);
    expect(reconciliationResult.totalCount).toBe(3);

    const expectedMatchings = [
      {
        salesId: 'S001',
        invoiceId: 'I001',
        customerId: 'CUST001',
        amount: 1000000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
      {
        salesId: 'S002',
        invoiceId: 'I002',
        customerId: 'CUST002',
        amount: 500000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
      {
        salesId: 'S003',
        invoiceId: 'I003',
        customerId: 'CUST003',
        amount: 300000,
        invoicingPeriodStart: '2024-04-01',
        invoicingPeriodEnd: '2024-04-30',
      },
    ];

    expect(reconciliationResult.matchings).toEqual(expectedMatchings);
    expect(reconciliationResult.unmatchedSales).toEqual([]);
    expect(reconciliationResult.unmatchedInvoices).toEqual([]);
  });
});