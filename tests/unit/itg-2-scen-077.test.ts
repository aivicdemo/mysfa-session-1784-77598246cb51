import { extractAndReflectDocumentData } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 帳票データ抽出・反映機能', () => {
  // SCEN-077
  test('商談レコードの顧客情報・金額・明細が統一フォーマットの帳票に正確に反映される', () => {
    const dealRecord = {
      dealId: 'DEAL-2024-001',
      dealStatus: '成約',
      dealAmount: 500000,
      dealTax: 50000,
      dealFee: 10000,
      dealTotal: 560000,
      customerId: 'CUST-001',
      customerName: '株式会社テスト商社',
      customerAddress: '東京都渋谷区道玄坂1-2-3',
      customerPhone: '03-XXXX-XXXX',
      customerEmail: 'contact@test-company.jp',
      lineItems: [
        {
          itemId: 'ITEM-001',
          productName: 'システム開発サービス',
          quantity: 1,
          unitPrice: 400000,
          subtotal: 400000,
        },
        {
          itemId: 'ITEM-002',
          productName: 'サポート費用',
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
      createdAt: '2024-01-15T09:00:00Z',
      documentFormat: 'standardFormat',
    };

    const result = extractAndReflectDocumentData(dealRecord);

    expect(result).toEqual(
      expect.objectContaining({
        documentId: expect.any(String),
        dealId: 'DEAL-2024-001',
        customerInfo: {
          name: '株式会社テスト商社',
          address: '東京都渋谷区道玄坂1-2-3',
          phone: '03-XXXX-XXXX',
          email: 'contact@test-company.jp',
        },
        amountBreakdown: {
          subtotal: 500000,
          tax: 50000,
          fee: 10000,
          total: 560000,
        },
        lineItems: [
          {
            productName: 'システム開発サービス',
            quantity: 1,
            unitPrice: 400000,
            subtotal: 400000,
          },
          {
            productName: 'サポート費用',
            quantity: 1,
            unitPrice: 100000,
            subtotal: 100000,
          },
        ],
        format: {
          layout: 'standardLayout',
          alignment: 'centered',
          fontSize: 10,
          fontFamily: 'Arial',
        },
        pdfGenerated: true,
        generatedAt: expect.any(String),
        status: 'completed',
      })
    );

    expect(result.customerInfo.name).toBe('株式会社テスト商社');
    expect(result.customerInfo.address).toBe('東京都渋谷区道玄坂1-2-3');
    expect(result.customerInfo.phone).toBe('03-XXXX-XXXX');
    expect(result.customerInfo.email).toBe('contact@test-company.jp');

    expect(result.amountBreakdown.subtotal).toBe(500000);
    expect(result.amountBreakdown.tax).toBe(50000);
    expect(result.amountBreakdown.fee).toBe(10000);
    expect(result.amountBreakdown.total).toBe(560000);

    expect(result.lineItems).toHaveLength(2);
    expect(result.lineItems[0].productName).toBe('システム開発サービス');
    expect(result.lineItems[0].quantity).toBe(1);
    expect(result.lineItems[0].unitPrice).toBe(400000);
    expect(result.lineItems[0].subtotal).toBe(400000);
    expect(result.lineItems[1].productName).toBe('サポート費用');
    expect(result.lineItems[1].quantity).toBe(1);
    expect(result.lineItems[1].unitPrice).toBe(100000);
    expect(result.lineItems[1].subtotal).toBe(100000);

    expect(result.format.layout).toBe('standardLayout');
    expect(result.format.alignment).toBe('centered');
    expect(result.format.fontSize).toBe(10);
    expect(result.format.fontFamily).toBe('Arial');

    expect(result.pdfGenerated).toBe(true);
    expect(result.status).toBe('completed');
  });
});