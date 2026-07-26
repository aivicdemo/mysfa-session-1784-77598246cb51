import { generateQuotation, generatePurchaseOrder, generateInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 見積・注文・請求書の自動生成機能', () => {
  // SCEN-090
  test('商談レコードの複数明細行が生成帳票に正確に反映されること', () => {
    // 商談レコード作成: 複数明細行（3行以上）を含む
    const dealRecord = {
      dealId: 'DEAL-2024-001',
      customerId: 'CUST-A001',
      customerName: '株式会社テスト販売',
      dealAmount: 1650000,
      dealStatus: '成約',
      lineItems: [
        {
          lineNumber: 1,
          productName: 'ソフトウェアライセンス',
          quantity: 100,
          unitPrice: 5000,
          subtotal: 500000
        },
        {
          lineNumber: 2,
          productName: 'サポートサービス',
          quantity: 50,
          unitPrice: 8000,
          subtotal: 400000
        },
        {
          lineNumber: 3,
          productName: 'カスタマイズ費用',
          quantity: 25,
          unitPrice: 4000,
          subtotal: 100000
        },
        {
          lineNumber: 4,
          productName: 'トレーニング',
          quantity: 1,
          unitPrice: 650000,
          subtotal: 650000
        }
      ],
      taxAmount: 165000,
      totalAmount: 1650000,
      generatedAt: new Date('2024-01-15T09:00:00Z')
    };

    // 見積書自動生成
    const quotation = generateQuotation(dealRecord);

    // 見積書の明細行検証
    expect(quotation.documentType).toBe('見積書');
    expect(quotation.dealId).toBe('DEAL-2024-001');
    expect(quotation.customerId).toBe('CUST-A001');
    expect(quotation.customerName).toBe('株式会社テスト販売');
    expect(quotation.lineItems).toHaveLength(4);
    
    // 各明細行の正確性確認
    expect(quotation.lineItems[0]).toEqual({
      lineNumber: 1,
      productName: 'ソフトウェアライセンス',
      quantity: 100,
      unitPrice: 5000,
      subtotal: 500000
    });
    expect(quotation.lineItems[1]).toEqual({
      lineNumber: 2,
      productName: 'サポートサービス',
      quantity: 50,
      unitPrice: 8000,
      subtotal: 400000
    });
    expect(quotation.lineItems[2]).toEqual({
      lineNumber: 3,
      productName: 'カスタマイズ費用',
      quantity: 25,
      unitPrice: 4000,
      subtotal: 100000
    });
    expect(quotation.lineItems[3]).toEqual({
      lineNumber: 4,
      productName: 'トレーニング',
      quantity: 1,
      unitPrice: 650000,
      subtotal: 650000
    });

    // 合計金額の一致確認
    expect(quotation.taxAmount).toBe(165000);
    expect(quotation.totalAmount).toBe(1650000);

    // 注文書自動生成
    const purchaseOrder = generatePurchaseOrder(dealRecord);

    // 注文書の明細行検証
    expect(purchaseOrder.documentType).toBe('注文書');
    expect(purchaseOrder.dealId).toBe('DEAL-2024-001');
    expect(purchaseOrder.lineItems).toHaveLength(4);
    
    // 各明細行の正確性確認
    expect(purchaseOrder.lineItems[0]).toEqual({
      lineNumber: 1,
      productName: 'ソフトウェアライセンス',
      quantity: 100,
      unitPrice: 5000,
      subtotal: 500000
    });
    expect(purchaseOrder.lineItems[1]).toEqual({
      lineNumber: 2,
      productName: 'サポートサービス',
      quantity: 50,
      unitPrice: 8000,
      subtotal: 400000
    });
    expect(purchaseOrder.lineItems[2]).toEqual({
      lineNumber: 3,
      productName: 'カスタマイズ費用',
      quantity: 25,
      unitPrice: 4000,
      subtotal: 100000
    });
    expect(purchaseOrder.lineItems[3]).toEqual({
      lineNumber: 4,
      productName: 'トレーニング',
      quantity: 1,
      unitPrice: 650000,
      subtotal: 650000
    });

    // 合計金額の一致確認
    expect(purchaseOrder.taxAmount).toBe(165000);
    expect(purchaseOrder.totalAmount).toBe(1650000);

    // 請求書自動生成
    const invoice = generateInvoice(dealRecord);

    // 請求書の明細行検証
    expect(invoice.documentType).toBe('請求書');
    expect(invoice.dealId).toBe('DEAL-2024-001');
    expect(invoice.customerId).toBe('CUST-A001');
    expect(invoice.lineItems).toHaveLength(4);
    
    // 各明細行の正確性確認
    expect(invoice.lineItems[0]).toEqual({
      lineNumber: 1,
      productName: 'ソフトウェアライセンス',
      quantity: 100,
      unitPrice: 5000,
      subtotal: 500000
    });
    expect(invoice.lineItems[1]).toEqual({
      lineNumber: 2,
      productName: 'サポートサービス',
      quantity: 50,
      unitPrice: 8000,
      subtotal: 400000
    });
    expect(invoice.lineItems[2]).toEqual({
      lineNumber: 3,
      productName: 'カスタマイズ費用',
      quantity: 25,
      unitPrice: 4000,
      subtotal: 100000
    });
    expect(invoice.lineItems[3]).toEqual({
      lineNumber: 4,
      productName: 'トレーニング',
      quantity: 1,
      unitPrice: 650000,
      subtotal: 650000
    });

    // 合計金額の一致確認
    expect(invoice.taxAmount).toBe(165000);
    expect(invoice.totalAmount).toBe(1650000);

    // 帳票間での整合性確認
    expect(quotation.totalAmount).toBe(purchaseOrder.totalAmount);
    expect(purchaseOrder.totalAmount).toBe(invoice.totalAmount);
    expect(quotation.totalAmount).toBe(invoice.totalAmount);
    expect(quotation.totalAmount).toBe(1650000);

    // 明細行数の一致確認
    expect(quotation.lineItems.length).toBe(purchaseOrder.lineItems.length);
    expect(purchaseOrder.lineItems.length).toBe(invoice.lineItems.length);
    expect(quotation.lineItems.length).toBe(4);

    // 各帳票の明細行内容が完全に一致していることを確認
    for (let i = 0; i < quotation.lineItems.length; i++) {
      expect(quotation.lineItems[i]).toEqual(purchaseOrder.lineItems[i]);
      expect(purchaseOrder.lineItems[i]).toEqual(invoice.lineItems[i]);
    }
  });
});