import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generateAndStoreInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  let documentStorageAdapterStub: any;
  let fileSystemStub: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // DocumentStorageAdapterのuploadDocumentをスタブ化し、3回すべて失敗するように設定
    documentStorageAdapterStub = {
      uploadDocument: jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Authentication failed'))
        .mockRejectedValueOnce(new Error('Storage service unavailable')),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // ファイルシステムのスタブ（一時フォルダへの書き込みをモック）
    fileSystemStub = {
      writeFileSync: jest.fn(),
      existsSync: jest.fn().mockReturnValue(true),
    };
  });

  // SCEN-601
  test('DocumentStorageAdapterのuploadDocumentが失敗した場合、生成PDFをシステム内部の一時フォルダに保存する', async () => {
    // 有効な請求書データを準備
    const invoiceData = {
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      invoiceDate: '2024-01-15',
      amount: 150000,
      taxAmount: 15000,
      totalAmount: 165000,
      items: [
        {
          description: 'コンサルティング',
          quantity: 1,
          unitPrice: 150000,
        },
      ],
    };

    // 期待されるPDFファイル名パターン
    const expectedFileNamePattern = /^invoice_CUST-001_\d{14}\.pdf$/;
    const expectedTempFolderPath = '/tmp/invoices/pending/';

    // 請求書自動生成機能を実行
    const result = await generateAndStoreInvoice(
      invoiceData,
      documentStorageAdapterStub,
      fileSystemStub
    );

    // uploadDocumentが3回呼び出されたことを確認（指数バックオフで1秒→2秒→4秒）
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(3);

    // すべての再試行が失敗した後、ローカル保存へのフォールバックが実行されたことを確認
    expect(fileSystemStub.writeFileSync).toHaveBeenCalled();

    // ローカル保存の呼び出し引数を検証
    const writeFileCall = fileSystemStub.writeFileSync.mock.calls[0];
    expect(writeFileCall[0]).toMatch(
      new RegExp(`^${expectedTempFolderPath}${expectedFileNamePattern.source}$`)
    );
    expect(typeof writeFileCall[1]).toBe('string'); // PDFバイナリデータ

    // 結果オブジェクトを検証
    expect(result.status).toBe('ローカル保存完了');
    expect(result.filePath).toMatch(
      new RegExp(`^${expectedTempFolderPath}${expectedFileNamePattern.source}$`)
    );
    expect(result.errorMessage).toBe(
      '文書の保存に失敗しました。システム管理者に連絡してください'
    );

    // ファイルサイズが妥当であることを確認（PDFは一般的に数KB～数10KB）
    const pdfData = writeFileCall[1];
    expect(pdfData.length).toBeGreaterThan(1000);
    expect(pdfData.length).toBeLessThan(500000);

    // UIに表示するべきエラーメッセージが設定されていることを確認
    expect(result.userFacingMessage).toBe(
      '文書の保存に失敗しました。システム管理者に連絡してください'
    );
  });
});