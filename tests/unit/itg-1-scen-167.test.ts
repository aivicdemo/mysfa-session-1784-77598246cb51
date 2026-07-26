import { generateQuotationOrderInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-167
  test('商談レコードの必須フィールド（顧客情報・金額）が不足している場合、自動生成エラーが発生する', () => {
    const dealRecordMissingCustomer = {
      dealId: 'DEAL-001',
      dealName: '大型プロジェクト案件',
      customerId: '',
      customerName: '',
      amount: 500000,
      currency: 'JPY',
      lineItems: [
        { itemId: 'ITEM-001', description: 'コンサルティングサービス', quantity: 10, unitPrice: 50000 }
      ],
      status: 'closed_won',
      dealDate: '2024-04-15T10:30:00Z'
    };

    expect(() => generateQuotationOrderInvoice(dealRecordMissingCustomer)).toThrow(/顧客情報/);
  });

  test('商談レコードの必須フィールド（金額）が不足している場合、自動生成エラーが発生する', () => {
    const dealRecordMissingAmount = {
      dealId: 'DEAL-002',
      dealName: '営業支援システム導入',
      customerId: 'CUST-0001',
      customerName: '株式会社ABC',
      amount: 0,
      currency: 'JPY',
      lineItems: [
        { itemId: 'ITEM-002', description: 'システム導入費', quantity: 1, unitPrice: 0 }
      ],
      status: 'closed_won',
      dealDate: '2024-04-15T11:45:00Z'
    };

    expect(() => generateQuotationOrderInvoice(dealRecordMissingAmount)).toThrow(/金額/);
  });

  test('商談レコードの必須フィールド（顧客情報と金額）がともに不足している場合、顧客情報エラーを優先して発生させる', () => {
    const dealRecordMissingBoth = {
      dealId: 'DEAL-003',
      dealName: '新規営業案件',
      customerId: '',
      customerName: '',
      amount: 0,
      currency: 'JPY',
      lineItems: [],
      status: 'closed_won',
      dealDate: '2024-04-15T12:00:00Z'
    };

    expect(() => generateQuotationOrderInvoice(dealRecordMissingBoth)).toThrow(/顧客情報/);
  });

  test('商談レコードに顧客情報・金額・明細がすべて揃っている場合、見積・注文・請求書が統一フォーマットで正常生成される', () => {
    const validDealRecord = {
      dealId: 'DEAL-004',
      dealName: 'クラウドサービス契約',
      customerId: 'CUST-0002',
      customerName: '株式会社XYZ',
      amount: 1500000,
      currency: 'JPY',
      lineItems: [
        { itemId: 'ITEM-003', description: 'クラウドプラットフォーム年間ライセンス', quantity: 50, unitPrice: 30000 }
      ],
      status: 'closed_won',
      dealDate: '2024-04-15T13:20:00Z'
    };

    const result = generateQuotationOrderInvoice(validDealRecord);

    expect(result).toHaveProperty('quotation');
    expect(result).toHaveProperty('order');
    expect(result).toHaveProperty('invoice');
    expect(result.quotation).toHaveProperty('quotationNumber');
    expect(result.order).toHaveProperty('orderNumber');
    expect(result.invoice).toHaveProperty('invoiceNumber');
    expect(result.quotation.amount).toBe(1500000);
    expect(result.order.amount).toBe(1500000);
    expect(result.invoice.amount).toBe(1500000);
    expect(result.quotation.customerId).toBe('CUST-0002');
    expect(result.order.customerId).toBe('CUST-0002');
    expect(result.invoice.customerId).toBe('CUST-0002');
  });

  test('商談レコードの顧客IDは存在するが顧客名が空の場合、エラーが発生する', () => {
    const dealRecordMissingCustomerName = {
      dealId: 'DEAL-005',
      dealName: 'パートナー連携案件',
      customerId: 'CUST-0003',
      customerName: '',
      amount: 750000,
      currency: 'JPY',
      lineItems: [
        { itemId: 'ITEM-004', description: 'インテグレーション開発', quantity: 1, unitPrice: 750000 }
      ],
      status: 'closed_won',
      dealDate: '2024-04-15T14:00:00Z'
    };

    expect(() => generateQuotationOrderInvoice(dealRecordMissingCustomerName)).toThrow(/顧客情報/);
  });

  test('商談レコードの金額がnullの場合、エラーが発生する', () => {
    const dealRecordNullAmount = {
      dealId: 'DEAL-006',
      dealName: '案件名',
      customerId: 'CUST-0004',
      customerName: '株式会社DEF',
      amount: null,
      currency: 'JPY',
      lineItems: [
        { itemId: 'ITEM-005', description: 'サービス', quantity: 1, unitPrice: 100000 }
      ],
      status: 'closed_won',
      dealDate: '2024-04-15T15:30:00Z'
    };

    expect(() => generateQuotationOrderInvoice(dealRecordNullAmount)).toThrow(/金額/);
  });

  test('商談レコードが正常で、生成された帳票の金額合計と明細が一致する', () => {
    const dealRecordWithMultipleItems = {
      dealId: 'DEAL-007',
      dealName: '複合案件',
      customerId: 'CUST-0005',
      customerName: '株式会社GHI',
      amount: 2000000,
      currency: 'JPY',
      lineItems: [
        { itemId: 'ITEM-006', description: 'コンサルティング', quantity: 20, unitPrice: 50000 },
        { itemId: 'ITEM-007', description: 'システム構築', quantity: 1, unitPrice: 1000000 }
      ],
      status: 'closed_won',
      dealDate: '2024-04-15T16:00:00Z'
    };

    const result = generateQuotationOrderInvoice(dealRecordWithMultipleItems);

    expect(result.quotation.lineItems.length).toBe(2);
    expect(result.order.lineItems.length).toBe(2);
    expect(result.invoice.lineItems.length).toBe(2);
    const expectedTotal = (20 * 50000) + (1 * 1000000);
    expect(result.quotation.amount).toBe(expectedTotal);
    expect(result.order.amount).toBe(expectedTotal);
    expect(result.invoice.amount).toBe(expectedTotal);
  });
});