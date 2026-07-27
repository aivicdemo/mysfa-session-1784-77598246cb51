import { generateDocumentShareLink } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - ドキュメント共有リンク生成エラーハンドリング', () => {
  test('SCEN-155: Google Drive API連携 - generateShareLinkの応答形式が想定と異なる場合、無効な共有リンクが顧客に提供されない', async () => {
    // 期待値の計算根拠:
    // - 無効な応答形式（数値型、null、undefined、空オブジェクト）が検出される場合
    // - 共有リンク生成は失敗し、エラーメッセージが返される
    // - PDFは内部一時フォルダに保存され、手動ダウンロード可能な状態になる
    // - ステータスは 'manual_download_required' となる

    const mockInvoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-123',
      amount: 150000,
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
    };

    const mockPdfContent = Buffer.from('mock-pdf-content');
    const mockInternalFolderPath = '/temp/documents/INV-2024-001';

    // ケース1: generateShareLink が数値型を返す
    const stubAdapterNumericResponse = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-001',
        storagePath: mockInternalFolderPath,
      }),
      generateShareLink: jest.fn().mockResolvedValue(12345), // 無効: 数値型
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const resultNumeric = await generateDocumentShareLink(
      mockInvoiceData,
      mockPdfContent,
      stubAdapterNumericResponse
    );

    expect(resultNumeric).toEqual({
      success: false,
      errorMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      fallbackStatus: 'manual_download_required',
      internalFolderPath: mockInternalFolderPath,
      documentId: 'DOC-2024-001',
    });

    // ケース2: generateShareLink が null を返す
    const stubAdapterNullResponse = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-002',
        storagePath: mockInternalFolderPath,
      }),
      generateShareLink: jest.fn().mockResolvedValue(null), // 無効: null
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const resultNull = await generateDocumentShareLink(
      mockInvoiceData,
      mockPdfContent,
      stubAdapterNullResponse
    );

    expect(resultNull).toEqual({
      success: false,
      errorMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      fallbackStatus: 'manual_download_required',
      internalFolderPath: mockInternalFolderPath,
      documentId: 'DOC-2024-002',
    });

    // ケース3: generateShareLink が undefined を返す
    const stubAdapterUndefinedResponse = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-003',
        storagePath: mockInternalFolderPath,
      }),
      generateShareLink: jest.fn().mockResolvedValue(undefined), // 無効: undefined
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const resultUndefined = await generateDocumentShareLink(
      mockInvoiceData,
      mockPdfContent,
      stubAdapterUndefinedResponse
    );

    expect(resultUndefined).toEqual({
      success: false,
      errorMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      fallbackStatus: 'manual_download_required',
      internalFolderPath: mockInternalFolderPath,
      documentId: 'DOC-2024-003',
    });

    // ケース4: generateShareLink が空オブジェクトを返す
    const stubAdapterEmptyObjectResponse = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-004',
        storagePath: mockInternalFolderPath,
      }),
      generateShareLink: jest.fn().mockResolvedValue({}), // 無効: 空オブジェクト
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const resultEmptyObject = await generateDocumentShareLink(
      mockInvoiceData,
      mockPdfContent,
      stubAdapterEmptyObjectResponse
    );

    expect(resultEmptyObject).toEqual({
      success: false,
      errorMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      fallbackStatus: 'manual_download_required',
      internalFolderPath: mockInternalFolderPath,
      documentId: 'DOC-2024-004',
    });

    // 検証: uploadDocument が呼び出されていることを確認
    expect(stubAdapterNumericResponse.uploadDocument).toHaveBeenCalledWith(
      mockInvoiceData,
      mockPdfContent
    );
    expect(stubAdapterNullResponse.uploadDocument).toHaveBeenCalledWith(
      mockInvoiceData,
      mockPdfContent
    );
    expect(stubAdapterUndefinedResponse.uploadDocument).toHaveBeenCalledWith(
      mockInvoiceData,
      mockPdfContent
    );
    expect(stubAdapterEmptyObjectResponse.uploadDocument).toHaveBeenCalledWith(
      mockInvoiceData,
      mockPdfContent
    );

    // 検証: generateShareLink が呼び出されていることを確認
    expect(stubAdapterNumericResponse.generateShareLink).toHaveBeenCalled();
    expect(stubAdapterNullResponse.generateShareLink).toHaveBeenCalled();
    expect(stubAdapterUndefinedResponse.generateShareLink).toHaveBeenCalled();
    expect(stubAdapterEmptyObjectResponse.generateShareLink).toHaveBeenCalled();
  });
});