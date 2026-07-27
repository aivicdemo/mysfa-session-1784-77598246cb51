import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { updateDealStatusAndUnlinkInvoice } from '../../src/logic/it-1784969823049-1-1-1';

// Mock adapter types
interface DocumentStorageAdapter {
  uploadDocument: jest.Mock;
  deleteDocument: jest.Mock;
}

interface DealRecord {
  dealId: string;
  customerId: string;
  amount: number;
  status: string;
  relatedInvoiceId: string | null;
}

interface InvoiceRecord {
  invoiceId: string;
  relatedDealId: string | null;
  amount: number;
  status: string;
}

interface SystemLog {
  action: string;
  dealId: string;
  timestamp: Date;
}

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let mockDocumentStorageAdapter: DocumentStorageAdapter;
  let systemLogs: SystemLog[];

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-12345', url: 'https://drive.example.com/file/doc-12345' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };
    systemLogs = [];
  });

  // SCEN-301
  test('商談ステータスが「受注」から「キャンセル」に変更されたとき、紐付けが解除される', async () => {
    // Setup: テストデータとして顧客A、金額100,000円の商談レコードを作成
    const customerA = {
      customerId: 'CUST-001',
      customerName: '顧客A',
    };

    const dealRecord: DealRecord = {
      dealId: 'DEAL-2024-001',
      customerId: customerA.customerId,
      amount: 100000,
      status: '初期接触',
      relatedInvoiceId: null,
    };

    // Step 1: 商談ステータスを『受注』に変更し、システムに確定させる
    dealRecord.status = '受注';
    
    const invoiceRecord: InvoiceRecord = {
      invoiceId: 'INV-2024-001',
      relatedDealId: dealRecord.dealId,
      amount: 100000,
      status: '未請求',
    };

    // Step 2: DocumentStorageAdapter.uploadDocument をモック化し、請求書PDFのアップロード成功を模擬
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce({
      documentId: 'doc-inv-001',
      url: 'https://drive.example.com/file/doc-inv-001',
    });

    // 紐付けが確立された状態
    dealRecord.relatedInvoiceId = invoiceRecord.invoiceId;
    invoiceRecord.relatedDealId = dealRecord.dealId;

    // Step 3: 商談ステータスを『キャンセル』に変更
    const unlinkResult = await updateDealStatusAndUnlinkInvoice(
      dealRecord,
      invoiceRecord,
      'キャンセル',
      mockDocumentStorageAdapter,
      (log: SystemLog) => systemLogs.push(log)
    );

    // Step 4: 紐付け解除処理が実行されたことをシステムログで確認
    expect(systemLogs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: 'deal_invoice_unlink_initiated',
          dealId: 'DEAL-2024-001',
        }),
      ])
    );

    // Step 5: 商談レコードの『関連請求書ID』フィールドが null にクリアされていることを確認
    expect(dealRecord.relatedInvoiceId).toBeNull();

    // Step 6: 請求データレコードの『関連商談ID』フィールドが null にクリアされていることを確認
    expect(invoiceRecord.relatedDealId).toBeNull();

    // Step 7: 請求データのステータスが『キャンセル』に更新されていることを確認
    expect(invoiceRecord.status).toBe('キャンセル');

    // Step 8: DocumentStorageAdapter.deleteDocument が呼び出され、Google Drive上の請求書PDFが削除対象マークされていることを確認
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledWith('doc-inv-001');
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledTimes(1);

    // Expected result: 商談ステータスが『受注』から『キャンセル』に変更されると、紐付く請求データとの関連付けが完全に解除される
    // (1) 商談レコード上の『関連請求書ID』が null になった
    expect(dealRecord.relatedInvoiceId).toBeNull();

    // (2) 請求データレコード上の『関連商談ID』が null になった
    expect(invoiceRecord.relatedDealId).toBeNull();

    // (3) 請求データのステータスが『キャンセル』に更新された
    expect(invoiceRecord.status).toBe('キャンセル');

    // (4) Google Drive に保存された請求書PDFが削除対象として DocumentStorageAdapter.deleteDocument に指示された
    expect(mockDocumentStorageAdapter.deleteDocument).toHaveBeenCalledWith('doc-inv-001');

    // 両レコード間に相互参照は残らない
    expect(dealRecord.relatedInvoiceId).toBeNull();
    expect(invoiceRecord.relatedDealId).toBeNull();

    // 操作結果が成功を示していることを確認
    expect(unlinkResult).toEqual({
      success: true,
      dealId: 'DEAL-2024-001',
      invoiceId: 'INV-2024-001',
      newDealStatus: 'キャンセル',
      newInvoiceStatus: 'キャンセル',
      documentDeleted: true,
    });
  });
});