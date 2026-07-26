import { validateDocumentContent } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 帳票内容検証機能', () => {
  // SCEN-066
  test('帳票の金額合計が明細行の合計と一致した場合、検証結果『OK』が返却される', () => {
    const documentData = {
      documentId: 'DOC-2024-001',
      totalAmount: 110000,
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 1,
          unitPrice: 50000,
          amount: 50000,
        },
        {
          itemId: 'ITEM-002',
          description: '商品B',
          quantity: 2,
          unitPrice: 30000,
          amount: 60000,
        },
      ],
      issueDate: '2024-01-15',
      customerId: 'CUST-12345',
    };

    const result = validateDocumentContent(documentData);

    expect(result.validationStatus).toBe('OK');
    expect(result.lineItemCount).toBe(2);
    expect(result.lineItemTotalAmount).toBe(110000);
    expect(result.documentTotalAmount).toBe(110000);
    expect(result.isAmountMatched).toBe(true);
    expect(result.hasWarnings).toBe(false);
    expect(result.hasErrors).toBe(false);
  });
});