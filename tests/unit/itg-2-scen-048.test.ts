import { validateInvoiceAmount } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-048
  test('請求書の金額が不正な場合、検証エラーが発生し差戻し指示が実行される', () => {
    // 正常な請求書データ
    const validInvoice = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-12345',
      totalAmount: 150000,
      lineItems: [
        { itemId: 'ITEM-001', description: '商品A', unitPrice: 100000, quantity: 1, amount: 100000 },
        { itemId: 'ITEM-002', description: '商品B', unitPrice: 50000, quantity: 1, amount: 50000 }
      ],
      issueDate: '2024-01-15T09:00:00Z',
      dueDate: '2024-02-15T23:59:59Z',
      status: 'pending_approval'
    };

    // ケース1: 負数の金額 - 検証エラーが発生する
    const negativeAmountInvoice = {
      ...validInvoice,
      invoiceId: 'INV-2024-002',
      totalAmount: -150000
    };
    expect(() => validateInvoiceAmount(negativeAmountInvoice)).toThrow(/金額/);

    // ケース2: 過度に大きい値（1000万を超える）- 検証エラーが発生する
    const excessiveAmountInvoice = {
      ...validInvoice,
      invoiceId: 'INV-2024-003',
      totalAmount: 100000000
    };
    expect(() => validateInvoiceAmount(excessiveAmountInvoice)).toThrow(/金額/);

    // ケース3: 非数値型 - 検証エラーが発生する
    const invalidTypeInvoice = {
      ...validInvoice,
      invoiceId: 'INV-2024-004',
      totalAmount: 'invalid' as any
    };
    expect(() => validateInvoiceAmount(invalidTypeInvoice)).toThrow(/金額/);

    // ケース4: ゼロ金額 - 検証エラーが発生する
    const zeroAmountInvoice = {
      ...validInvoice,
      invoiceId: 'INV-2024-005',
      totalAmount: 0
    };
    expect(() => validateInvoiceAmount(zeroAmountInvoice)).toThrow(/金額/);

    // ケース5: 正常な金額 - 検証成功、検証結果オブジェクトを返す
    const validationResult = validateInvoiceAmount(validInvoice);
    expect(validationResult).toEqual({
      isValid: true,
      invoiceId: 'INV-2024-001',
      totalAmount: 150000,
      errorMessage: null,
      canReject: false,
      rejectStatus: null,
      timestamp: expect.any(String)
    });

    // ケース6: 明細合計と請求金額が不一致 - 検証エラーが発生する
    const mismatchedAmountInvoice = {
      ...validInvoice,
      invoiceId: 'INV-2024-006',
      totalAmount: 200000,
      lineItems: [
        { itemId: 'ITEM-001', description: '商品A', unitPrice: 100000, quantity: 1, amount: 100000 },
        { itemId: 'ITEM-002', description: '商品B', unitPrice: 50000, quantity: 1, amount: 50000 }
      ]
    };
    expect(() => validateInvoiceAmount(mismatchedAmountInvoice)).toThrow(/金額/);

    // ケース7: 小数第三位以上の金額 - 検証エラーが発生する
    const invalidDecimalInvoice = {
      ...validInvoice,
      invoiceId: 'INV-2024-007',
      totalAmount: 150000.123
    };
    expect(() => validateInvoiceAmount(invalidDecimalInvoice)).toThrow(/金額/);

    // ケース8: 正常な金額で差戻し可能状態になることを確認
    const validInvoiceForReject = {
      ...validInvoice,
      invoiceId: 'INV-2024-008',
      totalAmount: 300000,
      status: 'pending_approval'
    };
    const resultForReject = validateInvoiceAmount(validInvoiceForReject);
    expect(resultForReject.isValid).toBe(true);
    expect(resultForReject.canReject).toBe(false);
  });
});