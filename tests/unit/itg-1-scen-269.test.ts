import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-269
  test('帳票内容検証機能 - 見積書に紐付く請求明細が0行の場合、警告を表示する', () => {
    const quoteId = 'QUOTE-001';
    const customerName = 'テスト顧客A';
    const amount = 100000;
    const invoiceLineCount = 0;

    const quote = {
      quoteId,
      customerName,
      amount,
      status: 'draft',
    };

    const invoiceLines = [];

    const result = validateQuoteContent(quote, invoiceLines);

    expect(result.isValid).toBe(false);
    expect(result.warningMessage).toMatch(/見積書に紐付く請求明細が登録されていません/);
    expect(result.status).toBe('警告状態');
    expect(result.canProceedToInvoiceGeneration).toBe(false);
  });
});