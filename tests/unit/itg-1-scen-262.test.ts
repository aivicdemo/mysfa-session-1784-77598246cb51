import { validateDocumentContents } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成 - 帳票内容検証機能', () => {
  // SCEN-262
  test('同じ入力データで2回検証を実行した場合、同じ結果が返される', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        url: 'https://example.com/doc-12345',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const testInputData = {
      customerName: '山田太郎',
      productName: '基本ライセンス',
      quantity: 5,
      unitPrice: 10000,
    };

    const firstResult = validateDocumentContents(
      testInputData,
      mockDocumentStorageAdapter
    );

    mockDocumentStorageAdapter.uploadDocument.mockClear();
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({
      documentId: 'doc-12345',
      url: 'https://example.com/doc-12345',
    });

    const secondResult = validateDocumentContents(
      testInputData,
      mockDocumentStorageAdapter
    );

    expect(firstResult.validationStatus).toBe('OK');
    expect(firstResult.validationStatus).toBe(secondResult.validationStatus);

    expect(firstResult.errorMessage).toBe('なし');
    expect(firstResult.errorMessage).toBe(secondResult.errorMessage);

    expect(firstResult.generatedDocumentId).toBe('doc-12345');
    expect(firstResult.generatedDocumentId).toBe(
      secondResult.generatedDocumentId
    );

    expect(firstResult.validationStatus).toEqual(secondResult.validationStatus);
    expect(firstResult.errorMessage).toEqual(secondResult.errorMessage);
    expect(firstResult.generatedDocumentId).toEqual(
      secondResult.generatedDocumentId
    );
  });
});