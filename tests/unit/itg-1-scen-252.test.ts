import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-252
  test('帳票内容検証機能 - 見積明細が複数行の場合、すべての行が検証される', () => {
    const quoteData = {
      customerId: 'CUST001',
      customerName: 'テスト太郎',
      quoteId: 'QUOTE20240115001',
      items: [
        {
          lineNumber: 1,
          productName: '商品A',
          quantity: 1,
          unitPrice: 1000,
          calculatedAmount: 1000,
          taxRate: 0.1,
          taxAmount: 100,
          subtotal: 1100,
        },
        {
          lineNumber: 2,
          productName: '商品B',
          quantity: 2,
          unitPrice: 2000,
          calculatedAmount: 4000,
          taxRate: 0.1,
          taxAmount: 400,
          subtotal: 4400,
        },
        {
          lineNumber: 3,
          productName: '商品C',
          quantity: 3,
          unitPrice: 3000,
          calculatedAmount: 9000,
          taxRate: 0.1,
          taxAmount: 900,
          subtotal: 9900,
        },
      ],
      totalGrossAmount: 15400,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'FILE20240115001',
        fileName: 'quote_QUOTE20240115001.pdf',
        url: 'https://storage.example.com/quote_QUOTE20240115001.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const result = validateQuoteContent(quoteData, mockDocumentStorageAdapter);

    expect(result.validationStatus).toBe('全行検証成功');
    expect(result.itemValidations).toHaveLength(3);
    expect(result.itemValidations[0]).toEqual({
      lineNumber: 1,
      productName: '商品A',
      calculatedAmount: 1000,
      taxAmount: 100,
      subtotal: 1100,
      lineValidationPassed: true,
    });
    expect(result.itemValidations[1]).toEqual({
      lineNumber: 2,
      productName: '商品B',
      calculatedAmount: 4000,
      taxAmount: 400,
      subtotal: 4400,
      lineValidationPassed: true,
    });
    expect(result.itemValidations[2]).toEqual({
      lineNumber: 3,
      productName: '商品C',
      calculatedAmount: 9000,
      taxAmount: 900,
      subtotal: 9900,
      lineValidationPassed: true,
    });
    expect(result.totalAmount).toBe(15400);
    expect(result.allLinesValidated).toBe(true);
  });
});