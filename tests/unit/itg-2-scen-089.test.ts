import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  generateQuotationOrderInvoice,
} from '../../src/logic/it-1784969823049-2-1-2';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-089
  test('商談ステータス「成約」で顧客情報・金額・明細が完全な場合、見積・注文・請求書が統一フォーマットで自動生成される', () => {
    const dealData = {
      dealId: 'DEAL-20240115-001',
      dealStatus: '成約',
      customerName: '株式会社サンプル',
      customerAddress: '東京都渋谷区1-2-3',
      customerPhoneNumber: '03-1234-5678',
      customerEmail: 'contact@sample.jp',
      dealAmount: 1500000,
      taxAmount: 150000,
      totalAmount: 1650000,
      lineItems: [
        {
          itemId: 'ITEM-001',
          productName: 'ソフトウェアライセンス',
          description: '年間ライセンス',
          quantity: 10,
          unitPrice: 100000,
          lineTotal: 1000000,
        },
        {
          itemId: 'ITEM-002',
          productName: 'サポートサービス',
          description: '12ヶ月サポート',
          quantity: 1,
          unitPrice: 500000,
          lineTotal: 500000,
        },
      ],
    };

    const result = generateQuotationOrderInvoice(dealData);

    expect(result).toBeDefined();
    expect(result.quotation).toBeDefined();
    expect(result.order).toBeDefined();
    expect(result.invoice).toBeDefined();

    // 見積書の検証
    expect(result.quotation.documentType).toBe('見積書');
    expect(result.quotation.dealId).toBe('DEAL-20240115-001');
    expect(result.quotation.customerName).toBe('株式会社サンプル');
    expect(result.quotation.customerAddress).toBe('東京都渋谷区1-2-3');
    expect(result.quotation.customerPhoneNumber).toBe('03-1234-5678');
    expect(result.quotation.customerEmail).toBe('contact@sample.jp');
    expect(result.quotation.subtotalAmount).toBe(1500000);
    expect(result.quotation.taxAmount).toBe(150000);
    expect(result.quotation.totalAmount).toBe(1650000);
    expect(result.quotation.lineItemCount).toBe(2);
    expect(result.quotation.lineItems).toHaveLength(2);
    expect(result.quotation.lineItems[0].productName).toBe('ソフトウェアライセンス');
    expect(result.quotation.lineItems[0].quantity).toBe(10);
    expect(result.quotation.lineItems[0].unitPrice).toBe(100000);
    expect(result.quotation.lineItems[0].lineTotal).toBe(1000000);
    expect(result.quotation.lineItems[1].productName).toBe('サポートサービス');
    expect(result.quotation.lineItems[1].quantity).toBe(1);
    expect(result.quotation.lineItems[1].unitPrice).toBe(500000);
    expect(result.quotation.lineItems[1].lineTotal).toBe(500000);
    expect(result.quotation.format).toBe('統一フォーマット');
    expect(result.quotation.header).toBeDefined();
    expect(result.quotation.footer).toBeDefined();

    // 注文書の検証
    expect(result.order.documentType).toBe('注文書');
    expect(result.order.dealId).toBe('DEAL-20240115-001');
    expect(result.order.customerName).toBe('株式会社サンプル');
    expect(result.order.customerAddress).toBe('東京都渋谷区1-2-3');
    expect(result.order.customerPhoneNumber).toBe('03-1234-5678');
    expect(result.order.customerEmail).toBe('contact@sample.jp');
    expect(result.order.subtotalAmount).toBe(1500000);
    expect(result.order.taxAmount).toBe(150000);
    expect(result.order.totalAmount).toBe(1650000);
    expect(result.order.lineItemCount).toBe(2);
    expect(result.order.lineItems).toHaveLength(2);
    expect(result.order.lineItems[0].productName).toBe('ソフトウェアライセンス');
    expect(result.order.lineItems[0].quantity).toBe(10);
    expect(result.order.lineItems[0].unitPrice).toBe(100000);
    expect(result.order.lineItems[0].lineTotal).toBe(1000000);
    expect(result.order.lineItems[1].productName).toBe('サポートサービス');
    expect(result.order.lineItems[1].quantity).toBe(1);
    expect(result.order.lineItems[1].unitPrice).toBe(500000);
    expect(result.order.lineItems[1].lineTotal).toBe(500000);
    expect(result.order.format).toBe('統一フォーマット');
    expect(result.order.header).toBeDefined();
    expect(result.order.footer).toBeDefined();

    // 請求書の検証
    expect(result.invoice.documentType).toBe('請求書');
    expect(result.invoice.dealId).toBe('DEAL-20240115-001');
    expect(result.invoice.customerName).toBe('株式会社サンプル');
    expect(result.invoice.customerAddress).toBe('東京都渋谷区1-2-3');
    expect(result.invoice.customerPhoneNumber).toBe('03-1234-5678');
    expect(result.invoice.customerEmail).toBe('contact@sample.jp');
    expect(result.invoice.subtotalAmount).toBe(1500000);
    expect(result.invoice.taxAmount).toBe(150000);
    expect(result.invoice.totalAmount).toBe(1650000);
    expect(result.invoice.lineItemCount).toBe(2);
    expect(result.invoice.lineItems).toHaveLength(2);
    expect(result.invoice.lineItems[0].productName).toBe('ソフトウェアライセンス');
    expect(result.invoice.lineItems[0].quantity).toBe(10);
    expect(result.invoice.lineItems[0].unitPrice).toBe(100000);
    expect(result.invoice.lineItems[0].lineTotal).toBe(1000000);
    expect(result.invoice.lineItems[1].productName).toBe('サポートサービス');
    expect(result.invoice.lineItems[1].quantity).toBe(1);
    expect(result.invoice.lineItems[1].unitPrice).toBe(500000);
    expect(result.invoice.lineItems[1].lineTotal).toBe(500000);
    expect(result.invoice.format).toBe('統一フォーマット');
    expect(result.invoice.header).toBeDefined();
    expect(result.invoice.footer).toBeDefined();

    // 3つのドキュメント間のフォーマット統一性確認
    expect(result.quotation.format).toBe(result.order.format);
    expect(result.order.format).toBe(result.invoice.format);
    expect(result.quotation.header).toEqual(result.order.header);
    expect(result.order.header).toEqual(result.invoice.header);
    expect(result.quotation.footer).toEqual(result.order.footer);
    expect(result.order.footer).toEqual(result.invoice.footer);

    // 3つのドキュメント間のデータ一致確認
    expect(result.quotation.customerName).toBe(result.order.customerName);
    expect(result.order.customerName).toBe(result.invoice.customerName);
    expect(result.quotation.totalAmount).toBe(result.order.totalAmount);
    expect(result.order.totalAmount).toBe(result.invoice.totalAmount);
    expect(result.quotation.lineItems).toEqual(result.order.lineItems);
    expect(result.order.lineItems).toEqual(result.invoice.lineItems);
  });
});