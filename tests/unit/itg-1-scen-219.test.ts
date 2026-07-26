import { generateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-219
  test('必須項目（顧客情報・金額）が不足している場合、エラーが検出されて請求書生成が中止される', () => {
    // ケース1: 顧客名が空欄の場合
    const dealWithoutCustomerName = {
      customerId: 'CUST001',
      customerName: '',
      dealAmount: 100000,
      dealStatus: '受注',
      dealDetails: [
        {
          productId: 'PROD001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000
        }
      ]
    };

    expect(() => generateInvoice(dealWithoutCustomerName)).toThrow(/顧客名/);

    // ケース2: 顧客IDが空欄の場合
    const dealWithoutCustomerId = {
      customerId: '',
      customerName: '株式会社テスト',
      dealAmount: 100000,
      dealStatus: '受注',
      dealDetails: [
        {
          productId: 'PROD001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000
        }
      ]
    };

    expect(() => generateInvoice(dealWithoutCustomerId)).toThrow(/顧客ID/);

    // ケース3: 金額が0円の場合
    const dealWithZeroAmount = {
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      dealAmount: 0,
      dealStatus: '受注',
      dealDetails: [
        {
          productId: 'PROD001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 0
        }
      ]
    };

    expect(() => generateInvoice(dealWithZeroAmount)).toThrow(/金額/);

    // ケース4: 金額フィールドが未定義の場合
    const dealWithoutAmount = {
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      dealAmount: undefined,
      dealStatus: '受注',
      dealDetails: [
        {
          productId: 'PROD001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000
        }
      ]
    } as any;

    expect(() => generateInvoice(dealWithoutAmount)).toThrow(/金額/);

    // ケース5: 明細が空配列の場合
    const dealWithoutDetails = {
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      dealAmount: 100000,
      dealStatus: '受注',
      dealDetails: []
    };

    expect(() => generateInvoice(dealWithoutDetails)).toThrow(/明細/);

    // ケース6: 複数の必須項目が不足している場合
    const dealWithMultipleMissingFields = {
      customerId: '',
      customerName: '',
      dealAmount: 0,
      dealStatus: '受注',
      dealDetails: []
    };

    expect(() => generateInvoice(dealWithMultipleMissingFields)).toThrow(/顧客/);

    // ケース7: ステータスが受注ではない場合
    const dealWithInvalidStatus = {
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      dealAmount: 100000,
      dealStatus: '失注',
      dealDetails: [
        {
          productId: 'PROD001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000
        }
      ]
    };

    expect(() => generateInvoice(dealWithInvalidStatus)).toThrow(/ステータス/);

    // ケース8: 正常な入力の場合は成功
    const validDeal = {
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      dealAmount: 150000,
      dealStatus: '受注',
      dealDetails: [
        {
          productId: 'PROD001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 100000
        },
        {
          productId: 'PROD002',
          productName: 'サービスB',
          quantity: 1,
          unitPrice: 50000
        }
      ]
    };

    const result = generateInvoice(validDeal);

    expect(result).toEqual(
      expect.objectContaining({
        invoiceNumber: expect.any(String),
        customerId: 'CUST001',
        customerName: '株式会社テスト',
        invoiceAmount: 150000,
        invoiceStatus: '発行済み',
        createdAt: expect.any(String)
      })
    );
    expect(result.invoiceNumber).toMatch(/^INV-/);
    expect(result.invoiceDetails).toHaveLength(2);
    expect(result.invoiceDetails[0]).toEqual(
      expect.objectContaining({
        productId: 'PROD001',
        productName: 'サービスA',
        quantity: 1,
        unitPrice: 100000,
        lineAmount: 100000
      })
    );
    expect(result.invoiceDetails[1]).toEqual(
      expect.objectContaining({
        productId: 'PROD002',
        productName: 'サービスB',
        quantity: 1,
        unitPrice: 50000,
        lineAmount: 50000
      })
    );
  });
});