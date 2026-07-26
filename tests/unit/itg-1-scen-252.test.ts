import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  validateInvoiceContent,
} from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-252: [normal] 顧客請求内容検証機能 - 顧客ポータルで請求書の金額・明細・税額が期待値と一致する場合に検証完了と判定される
  test('SCEN-252: 請求書の金額・明細・税額がすべて期待値と一致した場合、検証完了と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-12345',
      customerName: '株式会社ABC',
      totalAmount: 110000,
      subtotalAmount: 100000,
      taxAmount: 10000,
      taxRate: 0.1,
      invoiceDate: '2024-04-15',
      dueDate: '2024-05-15',
      lineItems: [
        {
          lineItemId: 'LI-001',
          productName: 'ソフトウェアライセンス',
          quantity: 10,
          unitPrice: 5000,
          lineAmount: 50000,
        },
        {
          lineItemId: 'LI-002',
          productName: '導入支援サービス',
          quantity: 1,
          unitPrice: 50000,
          lineAmount: 50000,
        },
      ],
    };

    const expectedValidation = {
      isValid: true,
      totalAmountMatch: true,
      lineItemsMatch: true,
      taxAmountMatch: true,
      validationStatus: 'completed',
      message: '請求内容の検証が完了しました。すべての項目が期待値と一致しています。',
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(true);
    expect(result.totalAmountMatch).toBe(true);
    expect(result.lineItemsMatch).toBe(true);
    expect(result.taxAmountMatch).toBe(true);
    expect(result.validationStatus).toBe('completed');
    expect(result.totalAmount).toBe(110000);
    expect(result.subtotalAmount).toBe(100000);
    expect(result.taxAmount).toBe(10000);
    expect(result.lineItemCount).toBe(2);
    expect(result.lineItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productName: 'ソフトウェアライセンス',
          quantity: 10,
          unitPrice: 5000,
          lineAmount: 50000,
        }),
        expect.objectContaining({
          productName: '導入支援サービス',
          quantity: 1,
          unitPrice: 50000,
          lineAmount: 50000,
        }),
      ])
    );
    expect(result.calculatedSubtotal).toBe(100000);
    expect(result.calculatedTax).toBe(10000);
    expect(result.calculatedTotal).toBe(110000);
    expect(result.message).toBe(expectedValidation.message);
  });

  test('SCEN-252: 請求書の合計金額が期待値と異なる場合、検証失敗と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-002',
      customerId: 'CUST-12346',
      customerName: '株式会社DEF',
      totalAmount: 115000,
      subtotalAmount: 100000,
      taxAmount: 10000,
      taxRate: 0.1,
      invoiceDate: '2024-04-16',
      dueDate: '2024-05-16',
      lineItems: [
        {
          lineItemId: 'LI-003',
          productName: 'コンサルティングサービス',
          quantity: 5,
          unitPrice: 20000,
          lineAmount: 100000,
        },
      ],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.totalAmountMatch).toBe(false);
    expect(result.validationStatus).toBe('failed');
    expect(result.calculatedTotal).toBe(110000);
    expect(result.totalAmount).toBe(115000);
  });

  test('SCEN-252: 請求書の税額計算が期待値と異なる場合、検証失敗と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-003',
      customerId: 'CUST-12347',
      customerName: '株式会社GHI',
      totalAmount: 112000,
      subtotalAmount: 100000,
      taxAmount: 12000,
      taxRate: 0.1,
      invoiceDate: '2024-04-17',
      dueDate: '2024-05-17',
      lineItems: [
        {
          lineItemId: 'LI-004',
          productName: 'システム開発',
          quantity: 1,
          unitPrice: 100000,
          lineAmount: 100000,
        },
      ],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.taxAmountMatch).toBe(false);
    expect(result.validationStatus).toBe('failed');
    expect(result.calculatedTax).toBe(10000);
    expect(result.taxAmount).toBe(12000);
  });

  test('SCEN-252: 請求書の明細行が期待値と異なる場合、検証失敗と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-004',
      customerId: 'CUST-12348',
      customerName: '株式会社JKL',
      totalAmount: 110000,
      subtotalAmount: 100000,
      taxAmount: 10000,
      taxRate: 0.1,
      invoiceDate: '2024-04-18',
      dueDate: '2024-05-18',
      lineItems: [
        {
          lineItemId: 'LI-005',
          productName: 'サポートサービス',
          quantity: 2,
          unitPrice: 25000,
          lineAmount: 50000,
        },
        {
          lineItemId: 'LI-006',
          productName: 'トレーニング',
          quantity: 1,
          unitPrice: 45000,
          lineAmount: 45000,
        },
      ],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.lineItemsMatch).toBe(false);
    expect(result.validationStatus).toBe('failed');
    expect(result.calculatedSubtotal).toBe(95000);
    expect(result.subtotalAmount).toBe(100000);
  });

  test('SCEN-252: 複数の検証項目が不一致の場合、すべての不一致を記録して失敗と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-005',
      customerId: 'CUST-12349',
      customerName: '株式会社MNO',
      totalAmount: 115000,
      subtotalAmount: 105000,
      taxAmount: 12000,
      taxRate: 0.1,
      invoiceDate: '2024-04-19',
      dueDate: '2024-05-19',
      lineItems: [
        {
          lineItemId: 'LI-007',
          productName: 'クラウドサービス',
          quantity: 3,
          unitPrice: 30000,
          lineAmount: 90000,
        },
      ],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.totalAmountMatch).toBe(false);
    expect(result.lineItemsMatch).toBe(false);
    expect(result.taxAmountMatch).toBe(false);
    expect(result.validationStatus).toBe('failed');
    expect(result.calculatedSubtotal).toBe(90000);
    expect(result.calculatedTax).toBe(9000);
    expect(result.calculatedTotal).toBe(99000);
  });

  test('SCEN-252: 明細行が空の場合、検証失敗と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-006',
      customerId: 'CUST-12350',
      customerName: '株式会社PQR',
      totalAmount: 0,
      subtotalAmount: 0,
      taxAmount: 0,
      taxRate: 0.1,
      invoiceDate: '2024-04-20',
      dueDate: '2024-05-20',
      lineItems: [],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.validationStatus).toBe('failed');
  });

  test('SCEN-252: 請求書データが不正な形式の場合、エラーを返す', () => {
    const invalidInvoiceData = {
      invoiceId: 'INV-2024-007',
      customerId: 'CUST-12351',
      totalAmount: '無効な金額',
      subtotalAmount: 100000,
      taxAmount: 10000,
      lineItems: [
        {
          lineItemId: 'LI-008',
          productName: 'サービス',
          quantity: -1,
          unitPrice: 50000,
          lineAmount: -50000,
        },
      ],
    };

    expect(() => validateInvoiceContent(invalidInvoiceData as any)).toThrow(/金額/);
  });

  test('SCEN-252: 顧客IDが一致しない場合、検証失敗と判定される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-008',
      customerId: 'CUST-99999',
      customerName: '未登録企業',
      totalAmount: 110000,
      subtotalAmount: 100000,
      taxAmount: 10000,
      taxRate: 0.1,
      invoiceDate: '2024-04-21',
      dueDate: '2024-05-21',
      lineItems: [
        {
          lineItemId: 'LI-009',
          productName: 'テストサービス',
          quantity: 1,
          unitPrice: 100000,
          lineAmount: 100000,
        },
      ],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.validationStatus).toBe('failed');
  });

  test('SCEN-252: 複数の明細行で個別金額と合計金額の整合性を検証する', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-009',
      customerId: 'CUST-12352',
      customerName: '株式会社STU',
      totalAmount: 165000,
      subtotalAmount: 150000,
      taxAmount: 15000,
      taxRate: 0.1,
      invoiceDate: '2024-04-22',
      dueDate: '2024-05-22',
      lineItems: [
        {
          lineItemId: 'LI-010',
          productName: 'プロダクトA',
          quantity: 2,
          unitPrice: 30000,
          lineAmount: 60000,
        },
        {
          lineItemId: 'LI-011',
          productName: 'プロダクトB',
          quantity: 3,
          unitPrice: 20000,
          lineAmount: 60000,
        },
        {
          lineItemId: 'LI-012',
          productName: 'プロダクトC',
          quantity: 1,
          unitPrice: 30000,
          lineAmount: 30000,
        },
      ],
    };

    const result = validateInvoiceContent(invoiceData);

    expect(result.isValid).toBe(true);
    expect(result.totalAmountMatch).toBe(true);
    expect(result.lineItemsMatch).toBe(true);
    expect(result.taxAmountMatch).toBe(true);
    expect(result.validationStatus).toBe('completed');
    expect(result.lineItemCount).toBe(3);
    expect(result.calculatedSubtotal).toBe(150000);
    expect(result.calculatedTax).toBe(15000);
    expect(result.calculatedTotal).toBe(165000);
  });
});