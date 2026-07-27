import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-255
  test('帳票内容検証機能 - 見積明細の数量が空の場合、警告を表示する', () => {
    const quoteData = {
      quoteId: 'QT-2024-001',
      customerId: 'CUST-101',
      customerName: '株式会社テスト',
      dealId: 'DEAL-2024-001',
      dealAmount: 500000,
      quoteLines: [
        {
          lineNumber: 1,
          productName: 'ソフトウェアライセンス',
          unitPrice: 100000,
          quantity: 5,
          lineTotal: 500000,
        },
      ],
      createdAt: new Date('2024-04-15T09:00:00Z'),
      updatedAt: new Date('2024-04-15T09:00:00Z'),
    };

    const quoteDataWithEmptyQuantity = {
      ...quoteData,
      quoteLines: [
        {
          lineNumber: 1,
          productName: 'ソフトウェアライセンス',
          unitPrice: 100000,
          quantity: null,
          lineTotal: 0,
        },
        {
          lineNumber: 2,
          productName: 'サポートサービス',
          unitPrice: 50000,
          quantity: 2,
          lineTotal: 100000,
        },
      ],
    };

    expect(() => validateQuoteContent(quoteDataWithEmptyQuantity)).toThrow(/数量/);
  });
});