import { reconcileDealWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-752
  test('商談ステータスが「提案中」で請求書が0件の場合、照合は成功する', async () => {
    const dealId = 'DEAL-001';
    const customerId = 'CUST-001';
    const dealStatus = '提案中';
    const invoiceCount = 0;

    const result = await reconcileDealWithInvoices({
      dealId: dealId,
      customerId: customerId,
      dealStatus: dealStatus,
      invoiceCount: invoiceCount,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('商談ステータス：提案中、請求書件数：0件。照合は成功しました');
    expect(result.dealId).toBe('DEAL-001');
    expect(result.reconciliationLogRecorded).toBe(true);
  });
});