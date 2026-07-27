import { generateDocumentShareLink } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能 - Google Drive API連携エッジケース', () => {
  // SCEN-1001
  test('generateShareLink が予期しない応答形式を返した場合、不正なリンク情報が利用されない', async () => {
    const mockDocumentId = 'doc-12345';
    const mockPdfContent = Buffer.from('mock pdf content');
    const mockTimestamp = new Date('2024-01-15T11:00:00Z');

    // generateShareLink が必須フィールド欠落（shareLink なし）の不正な応答を返すスタブ
    const mockDocumentStorageAdapterWithInvalidResponse = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: mockDocumentId,
        uploadUrl: 'https://drive.google.com/file/d/doc-12345',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        // 不正：必須フィールド shareLink が欠落
        expiresAt: new Date('2024-01-15T12:00:00Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue(undefined),
    };

    const mockSystemLogService = {
      logError: jest.fn(),
      logInfo: jest.fn(),
    };

    const mockFallbackStorageService = {
      saveTempPdf: jest.fn().mockResolvedValue({
        tempFolderId: 'temp-folder-001',
        tempFilePath: '/system/temp/doc-12345.pdf',
      }),
    };

    const result = await generateDocumentShareLink(
      {
        documentId: mockDocumentId,
        pdfContent: mockPdfContent,
        customerId: 'cust-001',
        documentType: 'invoice',
        generatedAt: mockTimestamp,
      },
      mockDocumentStorageAdapterWithInvalidResponse,
      mockSystemLogService,
      mockFallbackStorageService
    );

    // 不正な応答を検出し、エラー結果を返す
    expect(result.success).toBe(false);
    expect(result.errorMessage).toMatch(/文書の保存に失敗しました/);

    // 不正なリンク情報がデータベースに保存されていない
    expect(result.shareLink).toBeUndefined();

    // 代替動作としてシステム内部の一時フォルダに PDF が保存される
    expect(mockFallbackStorageService.saveTempPdf).toHaveBeenCalledWith(
      mockPdfContent,
      mockDocumentId
    );

    // 管理画面から手動ダウンロード可能な状態になっている
    expect(result.tempFilePath).toBe('/system/temp/doc-12345.pdf');
    expect(result.tempFolderId).toBe('temp-folder-001');

    // システムログに不正応答の詳細とエラー発生時刻が記録される
    expect(mockSystemLogService.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringMatching(/予期しない応答形式|必須フィールド欠落/),
        documentId: mockDocumentId,
        timestamp: mockTimestamp,
        invalidResponse: expect.objectContaining({
          expiresAt: expect.any(String),
        }),
      })
    );

    // uploadDocument は呼び出された（PDF のアップロードは成功している）
    expect(mockDocumentStorageAdapterWithInvalidResponse.uploadDocument).toHaveBeenCalledWith(
      mockPdfContent,
      expect.objectContaining({
        customerId: 'cust-001',
        documentType: 'invoice',
      })
    );

    // generateShareLink は呼び出された（共有リンク生成を試みた）
    expect(mockDocumentStorageAdapterWithInvalidResponse.generateShareLink).toHaveBeenCalledWith(
      mockDocumentId
    );
  });
});