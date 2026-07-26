import { describe, test, expect } from '@jest/globals';
import {
  generateEstimate,
  generateOrder,
  generateInvoice,
  validateInvoiceFormat,
} from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-217
  test('生成された請求書が統一フォーマットで正しくフォーマットされている', () => {
    // ========== 前提: 営業管理システムにログイン済みで、商談データが準備されている状態 ==========
    const dealData = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      customer_postal_code: '100-0001',
      customer_address: '東京都千代田区丸の内1-1-1',
      customer_phone: '03-XXXX-XXXX',
      deal_amount: 550000,
      deal_status: '成約',
      line_items: [
        {
          item_id: 'ITEM-001',
          product_name: 'ソフトウェアライセンス',
          quantity: 10,
          unit_price: 50000,
          tax_rate: 0.1,
        },
      ],
      deal_date: '2024-04-15',
      estimated_invoice_date: '2024-04-20',
    };

    // ========== 手順1: 見積書を新規作成 ==========
    const estimate = generateEstimate({
      deal_id: dealData.deal_id,
      customer_name: dealData.customer_name,
      customer_postal_code: dealData.customer_postal_code,
      customer_address: dealData.customer_address,
      line_items: dealData.line_items,
      estimate_date: '2024-04-15',
    });

    expect(estimate).toEqual({
      document_type: '見積書',
      estimate_number: expect.stringMatching(/^EST-\d{8}-\d{4}$/),
      estimate_date: '2024-04-15',
      customer_name: '株式会社テスト',
      customer_postal_code: '100-0001',
      customer_address: '東京都千代田区丸の内1-1-1',
      subtotal: 500000,
      tax_amount: 50000,
      total_amount: 550000,
      line_items: [
        {
          product_name: 'ソフトウェアライセンス',
          quantity: 10,
          unit_price: 50000,
          line_amount: 500000,
          tax_rate: 0.1,
        },
      ],
      header: {
        company_name: expect.any(String),
        company_address: expect.any(String),
        company_phone: expect.any(String),
      },
      footer: {
        payment_terms: expect.any(String),
        notes: expect.any(String),
      },
      format_version: '1.0',
    });

    // ========== 手順2: 見積書から注文書を自動生成 ==========
    const order = generateOrder({
      estimate_number: estimate.estimate_number,
      deal_id: dealData.deal_id,
      customer_name: dealData.customer_name,
      order_date: '2024-04-16',
    });

    expect(order).toEqual({
      document_type: '注文書',
      order_number: expect.stringMatching(/^ORD-\d{8}-\d{4}$/),
      order_date: '2024-04-16',
      customer_name: '株式会社テスト',
      subtotal: 500000,
      tax_amount: 50000,
      total_amount: 550000,
      line_items: expect.arrayContaining([
        expect.objectContaining({
          product_name: 'ソフトウェアライセンス',
          quantity: 10,
          unit_price: 50000,
        }),
      ]),
      header: {
        company_name: expect.any(String),
        company_address: expect.any(String),
        company_phone: expect.any(String),
      },
      footer: {
        payment_terms: expect.any(String),
        notes: expect.any(String),
      },
      format_version: '1.0',
    });

    // ========== 手順3: 注文書から請求書を自動生成 ==========
    const invoice = generateInvoice({
      order_number: order.order_number,
      deal_id: dealData.deal_id,
      customer_name: dealData.customer_name,
      invoice_date: '2024-04-20',
      due_date: '2024-05-20',
    });

    expect(invoice).toEqual({
      document_type: '請求書',
      invoice_number: expect.stringMatching(/^INV-\d{8}-\d{4}$/),
      invoice_date: '2024-04-20',
      due_date: '2024-05-20',
      customer_name: '株式会社テスト',
      customer_postal_code: '100-0001',
      customer_address: '東京都千代田区丸の内1-1-1',
      subtotal: 500000,
      tax_amount: 50000,
      total_amount: 550000,
      line_items: expect.arrayContaining([
        expect.objectContaining({
          product_name: 'ソフトウェアライセンス',
          quantity: 10,
          unit_price: 50000,
          line_amount: 500000,
        }),
      ]),
      header: {
        company_name: expect.any(String),
        company_address: expect.any(String),
        company_phone: expect.any(String),
      },
      amount_section: {
        subtotal_label: '小計',
        subtotal_value: 500000,
        tax_label: '消費税',
        tax_value: 50000,
        total_label: '合計金額',
        total_value: 550000,
      },
      footer: {
        payment_terms: expect.any(String),
        notes: expect.any(String),
        signature_line: expect.any(String),
      },
      format_version: '1.0',
    });

    // ========== 手順4: 請求書フォーマットの統一性を検証 ==========
    const formatValidationResult = validateInvoiceFormat({
      invoice: invoice,
      format_rules: {
        header_required: true,
        amount_section_required: true,
        footer_required: true,
        date_format: 'YYYY-MM-DD',
        document_number_pattern: '^INV-\\d{8}-\\d{4}$',
        tax_rate: 0.1,
      },
    });

    expect(formatValidationResult).toEqual({
      is_valid: true,
      validation_errors: [],
      header_valid: true,
      amount_section_valid: true,
      footer_valid: true,
      date_format_valid: true,
      document_number_valid: true,
      line_items_valid: true,
      consistency_score: 100,
    });

    // ========== 手順5: 複数の請求書を生成して統一性を確認 ==========
    const invoice2_deal = {
      deal_id: 'DEAL-002',
      customer_name: '株式会社サンプル',
      customer_postal_code: '110-0001',
      customer_address: '東京都台東区東上野1-1-1',
      line_items: [
        {
          product_name: 'コンサルティングサービス',
          quantity: 1,
          unit_price: 300000,
          tax_rate: 0.1,
        },
        {
          product_name: '導入支援',
          quantity: 5,
          unit_price: 20000,
          tax_rate: 0.1,
        },
      ],
    };

    const estimate2 = generateEstimate({
      deal_id: invoice2_deal.deal_id,
      customer_name: invoice2_deal.customer_name,
      customer_postal_code: invoice2_deal.customer_postal_code,
      customer_address: invoice2_deal.customer_address,
      line_items: invoice2_deal.line_items,
      estimate_date: '2024-04-10',
    });

    const order2 = generateOrder({
      estimate_number: estimate2.estimate_number,
      deal_id: invoice2_deal.deal_id,
      customer_name: invoice2_deal.customer_name,
      order_date: '2024-04-12',
    });

    const invoice2 = generateInvoice({
      order_number: order2.order_number,
      deal_id: invoice2_deal.deal_id,
      customer_name: invoice2_deal.customer_name,
      invoice_date: '2024-04-15',
      due_date: '2024-05-15',
    });

    // ========== 手順6: 複数請求書の統一フォーマット検証 ==========
    const allInvoices = [invoice, invoice2];

    allInvoices.forEach((inv) => {
      expect(inv).toHaveProperty('document_type', '請求書');
      expect(inv).toHaveProperty('invoice_number');
      expect(inv).toHaveProperty('invoice_date');
      expect(inv).toHaveProperty('due_date');
      expect(inv).toHaveProperty('customer_name');
      expect(inv).toHaveProperty('subtotal');
      expect(inv).toHaveProperty('tax_amount');
      expect(inv).toHaveProperty('total_amount');
      expect(inv).toHaveProperty('header');
      expect(inv).toHaveProperty('amount_section');
      expect(inv).toHaveProperty('footer');
      expect(inv).toHaveProperty('format_version', '1.0');
      expect(inv.header).toHaveProperty('company_name');
      expect(inv.header).toHaveProperty('company_address');
      expect(inv.header).toHaveProperty('company_phone');
      expect(inv.amount_section).toHaveProperty('subtotal_label', '小計');
      expect(inv.amount_section).toHaveProperty('tax_label', '消費税');
      expect(inv.amount_section).toHaveProperty('total_label', '合計金額');
      expect(inv.footer).toHaveProperty('payment_terms');
      expect(inv.footer).toHaveProperty('notes');
      expect(inv.footer).toHaveProperty('signature_line');
    });

    // ========== 手順7: 複数請求書の金額計算一貫性を検証 ==========
    // 請求書1の金額検証
    expect(invoice.subtotal).toBe(500000);
    expect(invoice.tax_amount).toBe(50000);
    expect(invoice.total_amount).toBe(550000);
    expect(invoice.total_amount).toBe(invoice.subtotal + invoice.tax_amount);

    // 請求書2の金額検証
    // 300000 + (20000 * 5) = 400000
    expect(invoice2.subtotal).toBe(400000);
    // 400000 * 0.1 = 40000
    expect(invoice2.tax_amount).toBe(40000);
    // 400000 + 40000 = 440000
    expect(invoice2.total_amount).toBe(440000);
    expect(invoice2.total_amount).toBe(
      invoice2.subtotal + invoice2.tax_amount
    );

    // ========== 手順8: 日付形式の統一性を検証 ==========
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(invoice.invoice_date).toMatch(dateFormatRegex);
    expect(invoice.due_date).toMatch(dateFormatRegex);
    expect(invoice2.invoice_date).toMatch(dateFormatRegex);
    expect(invoice2.due_date).toMatch(dateFormatRegex);

    // ========== 手順9: 請求書番号形式の統一性を検証 ==========
    const invoiceNumberRegex = /^INV-\d{8}-\d{4}$/;
    expect(invoice.invoice_number).toMatch(invoiceNumberRegex);
    expect(invoice2.invoice_number).toMatch(invoiceNumberRegex);

    // ========== 手順10: 最終的な統一フォーマット検証 ==========
    const finalValidation = {
      all_documents_have_same_structure: allInvoices.every(
        (inv) =>
          inv.document_type === '請求書' &&
          inv.header &&
          inv.amount_section &&
          inv.footer &&
          inv.format_version === '1.0'
      ),
      all_dates_same_format: allInvoices.every(
        (inv) =>
          inv.invoice_date.match(dateFormatRegex) &&
          inv.due_date.match(dateFormatRegex)
      ),
      all_numbers_same_format: allInvoices.every(
        (inv) => inv.invoice_number.match(invoiceNumberRegex)
      ),
      all_amounts_calculated_correctly: allInvoices.every(
        (inv) => inv.total_amount === inv.subtotal + inv.tax_amount
      ),
    };

    expect(finalValidation.all_documents_have_same_structure).toBe(true);
    expect(finalValidation.all_dates_same_format).toBe(true);
    expect(finalValidation.all_numbers_same_format).toBe(true);
    expect(finalValidation.all_amounts_calculated_correctly).toBe(true);
  });
});