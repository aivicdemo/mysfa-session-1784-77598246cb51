import { generateInvoiceFromDealLineItems } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-175
  test('複数の請求明細行が統一フォーマットの請求書に正しく反映される', () => {
    const dealLineItems = [
      {
        productName: 'ソフトウェアライセンス',
        quantity: 5,
        unitPrice: 10000,
        taxRate: 0.1,
      },
      {
        productName: 'サポートサービス',
        quantity: 12,
        unitPrice: 5000,
        taxRate: 0.1,
      },
      {
        productName: 'カスタマイズ開発',
        quantity: 1,
        unitPrice: 500000,
        taxRate: 0.1,
      },
    ];

    const customerInfo = {
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      address: '東京都渋谷区テスト1-1-1',
      contactPerson: '山田太郎',
      email: 'yamada@test-company.jp',
    };

    const dealInfo = {
      dealId: 'DEAL-20240415-001',
      dealAmount: 610000,
      dealStatus: '受注',
      invoiceDate: '2024-04-15',
    };

    const result = generateInvoiceFromDealLineItems(
      dealLineItems,
      customerInfo,
      dealInfo
    );

    // 明細行の行数検証
    expect(result.lineItems.length).toBe(3);

    // 各明細行の商品情報検証
    expect(result.lineItems[0]).toEqual({
      productName: 'ソフトウェアライセンス',
      quantity: 5,
      unitPrice: 10000,
      amount: 50000,
      tax: 5000,
    });

    expect(result.lineItems[1]).toEqual({
      productName: 'サポートサービス',
      quantity: 12,
      unitPrice: 5000,
      amount: 60000,
      tax: 6000,
    });

    expect(result.lineItems[2]).toEqual({
      productName: 'カスタマイズ開発',
      quantity: 1,
      unitPrice: 500000,
      amount: 500000,
      tax: 50000,
    });

    // 小計検証 (50000 + 60000 + 500000)
    expect(result.subtotal).toBe(610000);

    // 消費税検証 (5000 + 6000 + 50000)
    expect(result.totalTax).toBe(61000);

    // 合計金額検証 (610000 + 61000)
    expect(result.total).toBe(671000);

    // 顧客情報検証
    expect(result.customerInfo).toEqual(customerInfo);

    // 請求書ヘッダ情報検証
    expect(result.invoiceNumber).toBe('DEAL-20240415-001');
    expect(result.invoiceDate).toBe('2024-04-15');

    // フォーマット検証
    expect(result.format).toBe('unified');

    // レイアウト一貫性検証
    result.lineItems.forEach((item) => {
      expect(item.productName).toBeDefined();
      expect(typeof item.productName).toBe('string');
      expect(item.quantity).toBeDefined();
      expect(typeof item.quantity).toBe('number');
      expect(item.unitPrice).toBeDefined();
      expect(typeof item.unitPrice).toBe('number');
      expect(item.amount).toBeDefined();
      expect(typeof item.amount).toBe('number');
      expect(item.tax).toBeDefined();
      expect(typeof item.tax).toBe('number');
    });

    // 金額計算の正確性（各行の金額 = 数量 × 単価）
    expect(result.lineItems[0].amount).toBe(5 * 10000);
    expect(result.lineItems[1].amount).toBe(12 * 5000);
    expect(result.lineItems[2].amount).toBe(1 * 500000);

    // 税額計算の正確性（各行の税額 = 金額 × 税率）
    expect(result.lineItems[0].tax).toBe(50000 * 0.1);
    expect(result.lineItems[1].tax).toBe(60000 * 0.1);
    expect(result.lineItems[2].tax).toBe(500000 * 0.1);

    // 請求書ステータス確認
    expect(result.status).toBe('generated');

    // 出力フォーマット検証
    expect(result.outputFormat).toBe('pdf');
  });
});