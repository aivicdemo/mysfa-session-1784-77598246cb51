import { reconcileDealStatusWithInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-633
  test('対象商談が複数件のとき、全件の照合結果が返される', () => {
    const testDeals = [
      {
        dealId: 'DEAL-001',
        dealName: '商談A',
        status: '受注済',
        invoiceIssuanceStatus: '発行済',
        amount: 100000,
        expectedBillingDate: new Date('2024-01-15T00:00:00Z'),
        actualBillingDate: new Date('2024-01-15T00:00:00Z'),
      },
      {
        dealId: 'DEAL-002',
        dealName: '商談B',
        status: '受注済',
        invoiceIssuanceStatus: '未発行',
        amount: 200000,
        expectedBillingDate: new Date('2024-01-20T00:00:00Z'),
        actualBillingDate: null,
      },
      {
        dealId: 'DEAL-003',
        dealName: '商談C',
        status: '提案中',
        invoiceIssuanceStatus: '発行済',
        amount: 150000,
        expectedBillingDate: new Date('2024-02-10T00:00:00Z'),
        actualBillingDate: new Date('2024-01-25T00:00:00Z'),
      },
      {
        dealId: 'DEAL-004',
        dealName: '商談D',
        status: '受注済',
        invoiceIssuanceStatus: '発行済',
        amount: 300000,
        expectedBillingDate: new Date('2024-01-30T00:00:00Z'),
        actualBillingDate: new Date('2024-01-30T00:00:00Z'),
      },
    ];

    const result = reconcileDealStatusWithInvoiceStatus(testDeals);

    expect(result.totalCount).toBe(4);
    expect(result.matchCount).toBe(2);
    expect(result.discrepancyCount).toBe(2);

    const resultsByDealId = new Map(result.reconciliationDetails.map((d) => [d.dealId, d]));

    const dealAResult = resultsByDealId.get('DEAL-001');
    expect(dealAResult?.dealName).toBe('商談A');
    expect(dealAResult?.hasDiscrepancy).toBe(false);
    expect(dealAResult?.discrepancyReason).toBeUndefined();

    const dealBResult = resultsByDealId.get('DEAL-002');
    expect(dealBResult?.dealName).toBe('商談B');
    expect(dealBResult?.hasDiscrepancy).toBe(true);
    expect(dealBResult?.discrepancyReason).toBe('受注済であるにもかかわらず請求書が未発行');

    const dealCResult = resultsByDealId.get('DEAL-003');
    expect(dealCResult?.dealName).toBe('商談C');
    expect(dealCResult?.hasDiscrepancy).toBe(true);
    expect(dealCResult?.discrepancyReason).toBe('提案中のステータスであるにもかかわらず請求書が発行済');

    const dealDResult = resultsByDealId.get('DEAL-004');
    expect(dealDResult?.dealName).toBe('商談D');
    expect(dealDResult?.hasDiscrepancy).toBe(false);
    expect(dealDResult?.discrepancyReason).toBeUndefined();

    expect(result.summary).toBe('対象4件中、整合2件、ズレ検出2件');
  });
});