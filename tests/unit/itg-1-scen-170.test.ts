import { detectDelayedInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-170
  test('請求予定日を超過した案件を『遅延案件』として正しく検出できる', () => {
    const today = new Date('2024-04-15T00:00:00Z');
    const now = today.getTime();

    const overdue30 = new Date('2024-03-16T00:00:00Z').getTime();
    const overdue60 = new Date('2024-02-15T00:00:00Z').getTime();
    const overdue90 = new Date('2024-01-16T00:00:00Z').getTime();
    const future7 = new Date('2024-04-22T00:00:00Z').getTime();
    const future30 = new Date('2024-05-15T00:00:00Z').getTime();

    const testDeals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A',
        status: 'CLOSED',
        invoiceIssued: false,
        invoiceDueDate: overdue30,
        amount: 100000,
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-B',
        status: 'CLOSED',
        invoiceIssued: false,
        invoiceDueDate: overdue60,
        amount: 200000,
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-C',
        status: 'CLOSED',
        invoiceIssued: false,
        invoiceDueDate: overdue90,
        amount: 150000,
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-D',
        status: 'CLOSED',
        invoiceIssued: false,
        invoiceDueDate: future7,
        amount: 120000,
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-E',
        status: 'CLOSED',
        invoiceIssued: false,
        invoiceDueDate: future30,
        amount: 180000,
      },
    ];

    const result = detectDelayedInvoices({
      deals: testDeals,
      referenceDate: now,
    });

    expect(result.delayedInvoices).toHaveLength(3);

    const delayedIds = result.delayedInvoices.map((inv) => inv.dealId);
    expect(delayedIds).toContain('DEAL-001');
    expect(delayedIds).toContain('DEAL-002');
    expect(delayedIds).toContain('DEAL-003');

    const delayedDeal001 = result.delayedInvoices.find(
      (inv) => inv.dealId === 'DEAL-001'
    );
    expect(delayedDeal001).toBeDefined();
    expect(delayedDeal001?.label).toBe('遅延案件');
    expect(delayedDeal001?.isDelayed).toBe(true);
    expect(delayedDeal001?.daysOverdue).toBe(30);

    const delayedDeal002 = result.delayedInvoices.find(
      (inv) => inv.dealId === 'DEAL-002'
    );
    expect(delayedDeal002).toBeDefined();
    expect(delayedDeal002?.label).toBe('遅延案件');
    expect(delayedDeal002?.isDelayed).toBe(true);
    expect(delayedDeal002?.daysOverdue).toBe(60);

    const delayedDeal003 = result.delayedInvoices.find(
      (inv) => inv.dealId === 'DEAL-003'
    );
    expect(delayedDeal003).toBeDefined();
    expect(delayedDeal003?.label).toBe('遅延案件');
    expect(delayedDeal003?.isDelayed).toBe(true);
    expect(delayedDeal003?.daysOverdue).toBe(90);

    const futureIds = result.futureInvoices.map((inv) => inv.dealId);
    expect(futureIds).not.toContain('DEAL-001');
    expect(futureIds).not.toContain('DEAL-002');
    expect(futureIds).not.toContain('DEAL-003');
    expect(futureIds).toContain('DEAL-004');
    expect(futureIds).toContain('DEAL-005');

    const futureDeal004 = result.futureInvoices.find(
      (inv) => inv.dealId === 'DEAL-004'
    );
    expect(futureDeal004).toBeDefined();
    expect(futureDeal004?.isDelayed).toBe(false);
    expect(futureDeal004?.daysOverdue).toBe(0);

    const futureDeal005 = result.futureInvoices.find(
      (inv) => inv.dealId === 'DEAL-005'
    );
    expect(futureDeal005).toBeDefined();
    expect(futureDeal005?.isDelayed).toBe(false);
    expect(futureDeal005?.daysOverdue).toBe(0);

    expect(result.totalDelayedCount).toBe(3);
    expect(result.totalFutureCount).toBe(2);
    expect(result.delayedInvoices.every((inv) => inv.label === '遅延案件')).toBe(
      true
    );
  });
});