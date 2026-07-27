import { validateInvoiceLineAmountWithRounding } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-837
  test('請求対象データ妥当性検証機能 - 請求明細の数量×単価の計算結果に端数が出るとき、指定の丸め方法で処理し金額検証を続行する', () => {
    const roundingMethod = 'banker'; // 銀行丸め（四捨五入）
    const quantity = 3;
    const unitPrice = 100.33;
    const expectedCalculatedAmount = 301; // 3 × 100.33 = 300.99 → 銀行丸め → 301

    const invoiceLineItem = {
      invoiceLineId: 'IL-001',
      itemId: 'ITEM-ABC',
      quantity: quantity,
      unitPrice: unitPrice,
      taxClassification: '10%',
      customerId: 'CUST-XYZ',
      calculatedAmount: 0,
    };

    const mockStorageAdapter = {
      saveCalculatedAmount: jest.fn().mockResolvedValue({
        success: true,
        savedAmount: expectedCalculatedAmount,
      }),
    };

    const result = validateInvoiceLineAmountWithRounding(
      invoiceLineItem,
      roundingMethod,
      mockStorageAdapter
    );

    expect(result.calculatedAmount).toBe(expectedCalculatedAmount);
    expect(result.roundingApplied).toBe(true);
    expect(result.originalAmount).toBe(300.99);
    expect(result.validationStatus).toBe('success');
    expect(result.otherFieldsValidated).toEqual(
      expect.objectContaining({
        itemIdValid: true,
        taxClassificationValid: true,
        customerIdValid: true,
      })
    );
    expect(mockStorageAdapter.saveCalculatedAmount).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceLineId: 'IL-001',
        calculatedAmount: expectedCalculatedAmount,
      })
    );
  });
});