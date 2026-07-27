import { reconcileDealAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-640: 照合結果を2回実行しても同じ結果が返される', () => {
    // テストデータ準備: 商談・請求書データセット
    const dealAndInvoiceData = {
      deals: [
        {
          dealId: 'DEAL-001',
          dealStatus: 'CLOSED_WON',
          dealAmount: 500000,
          expectedInvoicingDate: new Date('2024-01-15').toISOString(),
        },
        {
          dealId: 'DEAL-002',
          dealStatus: 'CLOSED_WON',
          dealAmount: 300000,
          expectedInvoicingDate: new Date('2024-01-10').toISOString(),
        },
        {
          dealId: 'DEAL-003',
          dealStatus: 'CLOSED_WON',
          dealAmount: 200000,
          expectedInvoicingDate: new Date('2024-01-20').toISOString(),
        },
      ],
      invoices: [
        {
          invoiceId: 'INV-001',
          dealId: 'DEAL-001',
          invoiceAmount: 500000,
          invoicedDate: new Date('2024-01-15').toISOString(),
          invoiceStatus: 'ISSUED',
        },
        // DEAL-002: 未請求（ズレあり）
        {
          invoiceId: 'INV-003',
          dealId: 'DEAL-003',
          invoiceAmount: 200000,
          invoicedDate: new Date('2024-02-05').toISOString(), // 期待日より遅延（ズレあり）
          invoiceStatus: 'ISSUED',
        },
      ],
    };

    // 1回目の照合実行
    const firstReconciliationResult = reconcileDealAndInvoiceStatus(dealAndInvoiceData);

    // 1回目の結果を記録
    const firstDiscrepancyCount = firstReconciliationResult.discrepancyCount;
    const firstDiscrepancies = JSON.parse(JSON.stringify(firstReconciliationResult.discrepancies));
    const firstDiscrepancyClassifications = JSON.parse(
      JSON.stringify(firstReconciliationResult.discrepancyClassifications)
    );

    // 2回目の照合実行（同じデータで再度実行）
    const secondReconciliationResult = reconcileDealAndInvoiceStatus(dealAndInvoiceData);

    // 2回目の結果を記録
    const secondDiscrepancyCount = secondReconciliationResult.discrepancyCount;
    const secondDiscrepancies = secondReconciliationResult.discrepancies;
    const secondDiscrepancyClassifications = secondReconciliationResult.discrepancyClassifications;

    // 期待結果: ズレ件数が2件（DEAL-002未請求、DEAL-003遅延）
    expect(firstDiscrepancyCount).toBe(2);
    expect(secondDiscrepancyCount).toBe(2);

    // ズレ件数が同一
    expect(firstDiscrepancyCount).toBe(secondDiscrepancyCount);

    // ズレの対象商談IDが同一
    const firstDealIds = firstDiscrepancies
      .map((d: { dealId: string }) => d.dealId)
      .sort();
    const secondDealIds = secondDiscrepancies
      .map((d: { dealId: string }) => d.dealId)
      .sort();
    expect(firstDealIds).toEqual(secondDealIds);

    // ズレの詳細内容が同一
    const firstDetails = firstDiscrepancies
      .map((d: { dealId: string; discrepancyType: string; detail: string }) => ({
        dealId: d.dealId,
        type: d.discrepancyType,
        detail: d.detail,
      }))
      .sort((a: { dealId: string }, b: { dealId: string }) => a.dealId.localeCompare(b.dealId));
    const secondDetails = secondDiscrepancies
      .map((d: { dealId: string; discrepancyType: string; detail: string }) => ({
        dealId: d.dealId,
        type: d.discrepancyType,
        detail: d.detail,
      }))
      .sort((a: { dealId: string }, b: { dealId: string }) => a.dealId.localeCompare(b.dealId));
    expect(firstDetails).toEqual(secondDetails);

    // ズレの分類が同一
    const firstClassifications = firstDiscrepancyClassifications.sort();
    const secondClassifications = secondDiscrepancyClassifications.sort();
    expect(firstClassifications).toEqual(secondClassifications);

    // 検証: DEAL-002は未請求としてズレとして検出
    const deal002Discrepancy = firstDiscrepancies.find((d: { dealId: string }) => d.dealId === 'DEAL-002');
    expect(deal002Discrepancy).toBeDefined();
    expect(deal002Discrepancy.discrepancyType).toBe('UNINVOICED');

    // 検証: DEAL-003は遅延としてズレとして検出
    const deal003Discrepancy = firstDiscrepancies.find((d: { dealId: string }) => d.dealId === 'DEAL-003');
    expect(deal003Discrepancy).toBeDefined();
    expect(deal003Discrepancy.discrepancyType).toBe('DELAYED');

    // 検証: DEAL-001は正常（ズレなし）
    const deal001Discrepancy = firstDiscrepancies.find((d: { dealId: string }) => d.dealId === 'DEAL-001');
    expect(deal001Discrepancy).toBeUndefined();
  });
});