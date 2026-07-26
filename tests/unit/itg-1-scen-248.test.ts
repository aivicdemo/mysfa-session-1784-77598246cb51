import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-248
  test('請求書承認検証機能 - 経理担当者が承認時に請求書の金額・顧客情報・明細がすべて正確に検証される', () => {
    const invoiceData = {
      invoiceId: 'INV-20240415-001',
      invoiceStatus: 'pending_approval',
      customerCode: 'CUST-12345',
      customerName: '株式会社テスト商社',
      customerAddress: '東京都渋谷区1-2-3',
      invoiceDate: '2024-04-15',
      dueDate: '2024-05-15',
      subtotal: 100000,
      taxRate: 0.1,
      taxAmount: 10000,
      totalAmount: 110000,
      invoiceLines: [
        {
          lineId: 'LINE-001',
          itemName: 'ソフトウェアライセンス',
          quantity: 10,
          unitPrice: 5000,
          lineAmount: 50000
        },
        {
          lineId: 'LINE-002',
          itemName: 'サポートサービス',
          quantity: 20,
          unitPrice: 2500,
          lineAmount: 50000
        }
      ],
      createdAt: '2024-04-14T09:00:00Z',
      approvedAt: null,
      approverUserId: 'USER-FINANCE-001'
    };

    const result = validateInvoiceForApproval(invoiceData);

    expect(result.isValid).toBe(true);
    expect(result.validationDetails.customerCodeMatches).toBe(true);
    expect(result.validationDetails.customerNameMatches).toBe(true);
    expect(result.validationDetails.customerAddressMatches).toBe(true);
    expect(result.validationDetails.subtotalCorrect).toBe(true);
    expect(result.validationDetails.subtotalValue).toBe(100000);
    expect(result.validationDetails.taxAmountCorrect).toBe(true);
    expect(result.validationDetails.taxAmountValue).toBe(10000);
    expect(result.validationDetails.totalAmountCorrect).toBe(true);
    expect(result.validationDetails.totalAmountValue).toBe(110000);
    expect(result.validationDetails.lineCountCorrect).toBe(true);
    expect(result.validationDetails.lineCount).toBe(2);
    expect(result.validationDetails.lineItemsValid).toBe(true);
    expect(result.validationDetails.lineDetails).toHaveLength(2);
    
    expect(result.validationDetails.lineDetails[0]).toEqual({
      lineId: 'LINE-001',
      itemNamePresent: true,
      quantityValid: true,
      quantityValue: 10,
      unitPriceValid: true,
      unitPriceValue: 5000,
      lineAmountCorrect: true,
      lineAmountValue: 50000
    });
    
    expect(result.validationDetails.lineDetails[1]).toEqual({
      lineId: 'LINE-002',
      itemNamePresent: true,
      quantityValid: true,
      quantityValue: 20,
      unitPriceValid: true,
      unitPriceValue: 2500,
      lineAmountCorrect: true,
      lineAmountValue: 50000
    });

    expect(result.validationDetails.lineSubtotalMatchesHeader).toBe(true);
    expect(result.validationDetails.calculatedLineSubtotal).toBe(100000);
    expect(result.validationDetails.taxCalculationCorrect).toBe(true);
    expect(result.validationDetails.taxCalculationFormula).toBe('100000 * 0.1 = 10000');
    expect(result.validationDetails.totalCalculationCorrect).toBe(true);
    expect(result.validationDetails.totalCalculationFormula).toBe('100000 + 10000 = 110000');
    expect(result.approvalStatus).toBe('approved');
    expect(result.approvalMessage).toBe('請求書が承認されました。');
    expect(result.approvedAt).not.toBeNull();
    expect(typeof result.approvedAt).toBe('string');
  });
});