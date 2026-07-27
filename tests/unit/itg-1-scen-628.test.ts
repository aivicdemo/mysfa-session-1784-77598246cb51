import { verifyDealStatusAndInvoiceAlignment } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-628: 商談ステータスが「受注」で請求書がまだ発行されていないとき、発行待機状態と判定される', () => {
    const dealId = 'DEAL-001';
    const dealName = 'テスト商談001';
    const customerName = 'テスト顧客A';
    const dealAmount = 100000;
    const dealStatus = '受注';
    const invoiceIssuedDate = null;

    const mockDocumentStorageAdapter = {
      getInvoiceByDealId: jest.fn().mockReturnValue(null),
    };

    const dealRecord = {
      dealId,
      dealName,
      customerName,
      dealAmount,
      dealStatus,
      invoiceIssuedDate,
    };

    const result = verifyDealStatusAndInvoiceAlignment(
      dealRecord,
      mockDocumentStorageAdapter
    );

    expect(result.dealId).toBe('DEAL-001');
    expect(result.dealStatus).toBe('受注');
    expect(result.invoiceStatus).toBe('発行待機中');
    expect(result.alignmentResult).toBe('受注済みだが請求書未発行');
    expect(result.complianceLog).toContain('商談ID：DEAL-001');
    expect(result.complianceLog).toContain('ステータス照合結果：受注済みだが請求書未発行');
    expect(result.complianceLog).toContain('判定ステータス：発行待機中');
    expect(mockDocumentStorageAdapter.getInvoiceByDealId).toHaveBeenCalledWith('DEAL-001');
  });
});