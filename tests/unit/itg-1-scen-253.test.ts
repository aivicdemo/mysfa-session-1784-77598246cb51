import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-253
  test('帳票内容検証機能 - 見積明細の商品名が空の場合、警告を表示する', () => {
    const quoteData = {
      header: {
        customerName: 'テスト太郎',
        quoteDate: '2024-01-15',
      },
      lines: [
        {
          lineNumber: 1,
          productName: '',
          quantity: 1,
          unitPrice: 10000,
        },
      ],
    };

    const result = validateQuoteContent(quoteData);

    expect(result.status).toBe('警告あり');
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('見積明細の商品名が空です'),
      ])
    );
    expect(result.warnings[0]).toMatch(/明細行1/);
    expect(result.canProceed).toBe(false);
  });
});