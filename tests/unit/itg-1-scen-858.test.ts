import { verifyInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-858
  test('請求書承認検証機能 - 顧客の企業名が請求書に正確に反映される', () => {
    const customerData = {
      customer_id: 'CUST_001',
      company_name: '株式会社テスト商事',
      address: '東京都渋谷区',
      contact_person: '田中太郎',
      email: 'contact@test-company.jp'
    };

    const invoiceData = {
      invoice_id: 'INV_20240115_001',
      customer_id: customerData.customer_id,
      amount: 150000,
      invoice_date: '2024-01-15',
      due_date: '2024-02-15',
      items: [
        {
          item_id: 'ITEM_001',
          item_name: 'コンサルティングサービス',
          quantity: 1,
          unit_price: 150000
        }
      ]
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC_20240115_001',
        file_path: '/storage/invoices/INV_20240115_001.pdf'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_url: 'https://drive.example.com/share/token_abc123',
        expiration_date: '2024-02-15'
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true })
    };

    return verifyInvoiceApproval(
      customerData,
      invoiceData,
      mockDocumentStorageAdapter
    ).then((result) => {
      expect(result.approval_status).toBe('approved');
      expect(result.company_name).toBe('株式会社テスト商事');
      expect(result.invoice_id).toBe('INV_20240115_001');
      expect(result.customer_id).toBe('CUST_001');
      expect(result.amount).toBe(150000);
      expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

      const uploadCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0];
      expect(uploadCall).toBeDefined();
      const uploadedDocument = uploadCall[0];
      expect(uploadedDocument.company_name).toBe('株式会社テスト商事');
      expect(uploadedDocument.invoice_id).toBe('INV_20240115_001');
    });
  });
});