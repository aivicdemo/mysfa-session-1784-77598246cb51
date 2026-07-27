import { verifyDealInvoiceLinkage } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-283
  test('商談レコードの顧客IDが請求書の顧客IDと完全に一致するとき、顧客紐付けが正常に成立する', () => {
    // Arrange: テスト用の商談レコードを作成
    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      status: '提案中',
      amount: 100000,
    };

    // Arrange: テスト用の請求書レコードを作成
    const invoiceRecord = {
      invoiceId: 'INV-001',
      customerId: 'CUST-001',
      invoiceStatus: '未発行',
      invoiceAmount: 100000,
    };

    // Arrange: DocumentStorageAdapterをモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        url: 'https://storage.example.com/documents/DOC-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://storage.example.com/share/SHARE-001',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Act: 商談レコードの詳細画面で請求データ紐付け機能を実行
    const result = verifyDealInvoiceLinkage(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter
    );

    // Assert: 紐付け結果を確認
    expect(result.linkageStatus).toBe('紐付け成功');
    expect(result.customerId).toBe('CUST-001');
    expect(result.invoiceStatus).toBe('未発行');
    expect(result.invoiceAmount).toBe(100000);
    expect(result.dealAmount).toBe(100000);
    expect(result.visualization).toEqual({
      customerId: 'CUST-001',
      invoiceStatus: '未発行',
      invoiceAmount: 100000,
      message: '顧客ID: CUST-001 / 請求書ステータス: 未発行 / 請求金額: 100000円',
    });
  });
});