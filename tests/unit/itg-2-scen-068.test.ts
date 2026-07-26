import { validateDocumentContent } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 帳票内容検証機能', () => {
  // SCEN-068
  test('明細行数が0件の場合、検証結果『警告』が返却される', () => {
    const documentData = {
      documentId: 'DOC-20240115-001',
      customerName: 'テスト顧客',
      totalAmount: 0,
      lineItems: [],
      lineItemCount: 0,
      issueDate: '2024-01-15',
    };

    const result = validateDocumentContent(documentData);

    expect(result.status).toBe('warning');
    expect(result.lineItemCount).toBe(0);
    expect(result.message).toMatch(/明細行/);
    expect(result.isValid).toBe(false);
  });
});