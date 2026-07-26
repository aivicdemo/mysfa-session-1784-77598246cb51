import { validateDocumentDetails } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-150
  test('帳票の明細行数が0行の場合、検証結果がエラーと判定される', () => {
    const documentData = {
      documentId: 'DOC-20240415-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      totalAmount: 100000,
      lineItems: [],
      documentType: 'invoice',
      issueDate: '2024-04-15',
    };

    const result = validateDocumentDetails(documentData);

    expect(result.status).toBe('NG');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/明細行が存在しません/);
    expect(result.lineItemCount).toBe(0);
    expect(result.validationDetails).toEqual(
      expect.objectContaining({
        hasLineItems: false,
        amountValidation: expect.any(Boolean),
      })
    );
  });
});