import { validateDocumentLines } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-151
  test('帳票の明細行数が1000行以上の場合、検証結果が警告と判定される', () => {
    const lineCount = 1000;
    const totalAmount = 1000000;
    const documentData = {
      customerId: 'CUST001',
      customerName: '顧客A',
      invoiceAmount: totalAmount,
      lineCount: lineCount,
      lines: Array.from({ length: lineCount }, (_, index) => ({
        lineNumber: index + 1,
        productName: `Product_${index + 1}`,
        quantity: 1,
        unitPrice: 1000,
        lineAmount: 1000,
      })),
      invoiceDate: '2024-01-15',
    };

    const result = validateDocumentLines(documentData);

    expect(result.status).toBe('warning');
    expect(result.lineCount).toBe(1000);
    expect(result.message).toMatch(/明細行数/);
    expect(result.isProcessable).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w: string) => w.includes('1000'))).toBe(true);
  });
});