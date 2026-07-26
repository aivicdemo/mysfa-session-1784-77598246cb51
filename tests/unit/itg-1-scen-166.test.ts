import { generateQuotationOrderInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-166
  test('商談ステータス『成約』時に顧客情報・金額・明細が統一フォーマットで見積・注文・請求書に正確に反映される', () => {
    const dealData = {
      dealId: 'DEAL-20240415-001',
      dealStatus: '成約',
      customerId: 'CUST-12345',
      customerName: '株式会社テスト商事',
      customerAddress: '東京都千代田区丸の内1-1-1',
      customerPhone: '03-1234-5678',
      customerEmail: 'contact@test-shokai.jp',
      dealAmount: 550000,
      taxRate: 0.1,
      items: [
        {
          itemId: 'ITEM-001',
          itemName: 'クラウドERP導入支援',
          quantity: 1,
          unitPrice: 300000,
          subtotal: 300000,
        },
        {
          itemId: 'ITEM-002',
          itemName: 'データ移行サービス',
          quantity: 1,
          unitPrice: 200000,
          subtotal: 200000,
        },
      ],
    };

    const result = generateQuotationOrderInvoice(dealData);

    // 顧客情報の一致確認（3種類の書類で同じ）
    expect(result.quotation.customerName).toBe('株式会社テスト商事');
    expect(result.order.customerName).toBe('株式会社テスト商事');
    expect(result.invoice.customerName).toBe('株式会社テスト商事');

    expect(result.quotation.customerAddress).toBe('東京都千代田区丸の内1-1-1');
    expect(result.order.customerAddress).toBe('東京都千代田区丸の内1-1-1');
    expect(result.invoice.customerAddress).toBe('東京都千代田区丸の内1-1-1');

    expect(result.quotation.customerPhone).toBe('03-1234-5678');
    expect(result.order.customerPhone).toBe('03-1234-5678');
    expect(result.invoice.customerPhone).toBe('03-1234-5678');

    expect(result.quotation.customerEmail).toBe('contact@test-shokai.jp');
    expect(result.order.customerEmail).toBe('contact@test-shokai.jp');
    expect(result.invoice.customerEmail).toBe('contact@test-shokai.jp');

    // 金額計算確認（小計）
    const expectedSubtotal = 500000;
    expect(result.quotation.subtotal).toBe(expectedSubtotal);
    expect(result.order.subtotal).toBe(expectedSubtotal);
    expect(result.invoice.subtotal).toBe(expectedSubtotal);

    // 金額計算確認（税金）
    const expectedTax = 50000;
    expect(result.quotation.tax).toBe(expectedTax);
    expect(result.order.tax).toBe(expectedTax);
    expect(result.invoice.tax).toBe(expectedTax);

    // 金額計算確認（合計）
    const expectedTotal = 550000;
    expect(result.quotation.total).toBe(expectedTotal);
    expect(result.order.total).toBe(expectedTotal);
    expect(result.invoice.total).toBe(expectedTotal);

    // 商品明細の一致確認（品名）
    expect(result.quotation.items[0].itemName).toBe('クラウドERP導入支援');
    expect(result.order.items[0].itemName).toBe('クラウドERP導入支援');
    expect(result.invoice.items[0].itemName).toBe('クラウドERP導入支援');

    expect(result.quotation.items[1].itemName).toBe('データ移行サービス');
    expect(result.order.items[1].itemName).toBe('データ移行サービス');
    expect(result.invoice.items[1].itemName).toBe('データ移行サービス');

    // 商品明細の一致確認（数量）
    expect(result.quotation.items[0].quantity).toBe(1);
    expect(result.order.items[0].quantity).toBe(1);
    expect(result.invoice.items[0].quantity).toBe(1);

    expect(result.quotation.items[1].quantity).toBe(1);
    expect(result.order.items[1].quantity).toBe(1);
    expect(result.invoice.items[1].quantity).toBe(1);

    // 商品明細の一致確認（単価）
    expect(result.quotation.items[0].unitPrice).toBe(300000);
    expect(result.order.items[0].unitPrice).toBe(300000);
    expect(result.invoice.items[0].unitPrice).toBe(300000);

    expect(result.quotation.items[1].unitPrice).toBe(200000);
    expect(result.order.items[1].unitPrice).toBe(200000);
    expect(result.invoice.items[1].unitPrice).toBe(200000);

    // 商品明細の一致確認（小計）
    expect(result.quotation.items[0].subtotal).toBe(300000);
    expect(result.order.items[0].subtotal).toBe(300000);
    expect(result.invoice.items[0].subtotal).toBe(300000);

    expect(result.quotation.items[1].subtotal).toBe(200000);
    expect(result.order.items[1].subtotal).toBe(200000);
    expect(result.invoice.items[1].subtotal).toBe(200000);

    // 明細行数の一致確認
    expect(result.quotation.items.length).toBe(2);
    expect(result.order.items.length).toBe(2);
    expect(result.invoice.items.length).toBe(2);

    // 書類タイプの確認
    expect(result.quotation.documentType).toBe('見積書');
    expect(result.order.documentType).toBe('注文書');
    expect(result.invoice.documentType).toBe('請求書');

    // dealId の一致確認
    expect(result.quotation.dealId).toBe('DEAL-20240415-001');
    expect(result.order.dealId).toBe('DEAL-20240415-001');
    expect(result.invoice.dealId).toBe('DEAL-20240415-001');
  });
});