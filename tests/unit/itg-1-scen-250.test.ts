import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-250
  test('帳票内容検証機能 - 見積明細が0行（明細なし）の場合、警告を表示する', () => {
    const quoteData = {
      customerId: 'CUST001',
      customerName: '株式会社サンプル',
      quoteDate: new Date('2024-01-15T11:00:00Z'),
      quoteNumber: 'QT20240115001',
      lines: [],
      totalAmount: 0,
    };

    const result = validateQuoteContent(quoteData);

    expect(result.isValid).toBe(false);
    expect(result.warnings).toContain(/見積明細が入力されていません/);
    expect(result.canGenerate).toBe(false);
  });
});