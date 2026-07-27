import { verifyInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-626: 商談ステータスが受注で請求書発行日が商談クローズ日より30日遅いとき、30日のズレが検出される', () => {
    const dealId = 'DEAL-626';
    const dealStatus = '受注';
    const closeDate = new Date('2024-01-15');
    const invoiceId = 'INV-626';
    const invoiceIssuedDate = new Date('2024-02-14');

    const testData = {
      deal: {
        id: dealId,
        status: dealStatus,
        closeDate: closeDate,
      },
      invoice: {
        id: invoiceId,
        dealId: dealId,
        issuedDate: invoiceIssuedDate,
      },
    };

    const result = verifyInvoiceDiscrepancy(testData.deal, testData.invoice);

    expect(result.discrepancyDays).toBe(30);
    expect(result.discrepancyType).toBe('請求書発行遅延');
    expect(result.dealStatus).toBe('受注');
    expect(result.closeDate).toEqual(new Date('2024-01-15'));
    expect(result.invoiceIssuedDate).toEqual(new Date('2024-02-14'));
    expect(result.detectionStatus).toBe('ズレあり');
  });
});