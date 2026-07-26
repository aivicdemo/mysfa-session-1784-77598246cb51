import { generateUnifiedDocuments } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-165: [normal] 見積・注文・請求書統一フォーマット自動生成機能 - 生成された帳票が営業担当者の確認・検証画面で参照可能な状態になる
  test('should generate unified documents in standard format with all required fields and enable operations in verification screen', () => {
    const deal_record_input = {
      deal_id: 'DL-2024-001',
      customer_id: 'CUST-0001',
      customer_name: '株式会社サンプル',
      customer_postal_code: '100-0001',
      customer_address: '東京都千代田区丸の内1-1-1',
      customer_phone: '03-XXXX-XXXX',
      customer_contact_person: '営業太郎',
      deal_status: '成約',
      deal_amount: 1500000,
      deal_date: '2024-04-15T09:30:00Z',
      line_items: [
        {
          line_item_id: 'LI-001',
          product_name: 'クラウドサービス基本プラン',
          quantity: 1,
          unit_price: 1000000,
          tax_rate: 0.1,
          line_amount: 1000000,
          tax_amount: 100000
        },
        {
          line_item_id: 'LI-002',
          product_name: 'オンサイト導入サポート',
          quantity: 1,
          unit_price: 500000,
          tax_rate: 0.1,
          line_amount: 500000,
          tax_amount: 50000
        }
      ],
      quotation_due_date: '2024-04-22T23:59:59Z',
      order_execution_date: '2024-04-15T10:00:00Z',
      invoice_issue_date: '2024-04-15T14:00:00Z',
      invoice_due_date: '2024-05-15T23:59:59Z',
      deal_description: '年間ライセンス契約',
      salesperson_id: 'SP-0001',
      salesperson_name: '営業一郎',
      department: '営業部'
    };

    const generated_documents = generateUnifiedDocuments(deal_record_input);

    // 統一フォーマット見積書の検証
    expect(generated_documents).toBeDefined();
    expect(generated_documents.quotation).toBeDefined();
    expect(generated_documents.quotation.document_id).toMatch(/^QT-/);
    expect(generated_documents.quotation.document_type).toBe('quotation');
    expect(generated_documents.quotation.header.customer_name).toBe('株式会社サンプル');
    expect(generated_documents.quotation.header.customer_postal_code).toBe('100-0001');
    expect(generated_documents.quotation.header.customer_address).toBe('東京都千代田区丸の内1-1-1');
    expect(generated_documents.quotation.header.customer_phone).toBe('03-XXXX-XXXX');
    expect(generated_documents.quotation.header.customer_contact_person).toBe('営業太郎');
    expect(generated_documents.quotation.header.document_date).toBe('2024-04-15');
    expect(generated_documents.quotation.header.due_date).toBe('2024-04-22');
    expect(generated_documents.quotation.header.salesperson_name).toBe('営業一郎');
    expect(generated_documents.quotation.header.salesperson_id).toBe('SP-0001');
    expect(generated_documents.quotation.header.department).toBe('営業部');

    // 見積書明細の検証
    expect(generated_documents.quotation.line_items).toHaveLength(2);
    expect(generated_documents.quotation.line_items[0].product_name).toBe('クラウドサービス基本プラン');
    expect(generated_documents.quotation.line_items[0].quantity).toBe(1);
    expect(generated_documents.quotation.line_items[0].unit_price).toBe(1000000);
    expect(generated_documents.quotation.line_items[0].tax_rate).toBe(0.1);
    expect(generated_documents.quotation.line_items[0].line_amount).toBe(1000000);
    expect(generated_documents.quotation.line_items[0].tax_amount).toBe(100000);
    expect(generated_documents.quotation.line_items[1].product_name).toBe('オンサイト導入サポート');
    expect(generated_documents.quotation.line_items[1].quantity).toBe(1);
    expect(generated_documents.quotation.line_items[1].unit_price).toBe(500000);
    expect(generated_documents.quotation.line_items[1].tax_rate).toBe(0.1);
    expect(generated_documents.quotation.line_items[1].line_amount).toBe(500000);
    expect(generated_documents.quotation.line_items[1].tax_amount).toBe(50000);

    // 見積書合計の検証
    expect(generated_documents.quotation.subtotal).toBe(1500000);
    expect(generated_documents.quotation.total_tax_amount).toBe(150000);
    expect(generated_documents.quotation.total_amount).toBe(1650000);
    expect(generated_documents.quotation.format_version).toBe('1.0');
    expect(generated_documents.quotation.is_preview_available).toBe(true);
    expect(generated_documents.quotation.is_pdf_downloadable).toBe(true);
    expect(generated_documents.quotation.is_editable).toBe(true);
    expect(generated_documents.quotation.is_approvable).toBe(true);
    expect(generated_documents.quotation.is_rejectable).toBe(true);

    // 統一フォーマット注文書の検証
    expect(generated_documents.order).toBeDefined();
    expect(generated_documents.order.document_id).toMatch(/^OR-/);
    expect(generated_documents.order.document_type).toBe('order');
    expect(generated_documents.order.header.customer_name).toBe('株式会社サンプル');
    expect(generated_documents.order.header.customer_postal_code).toBe('100-0001');
    expect(generated_documents.order.header.customer_address).toBe('東京都千代田区丸の内1-1-1');
    expect(generated_documents.order.header.customer_phone).toBe('03-XXXX-XXXX');
    expect(generated_documents.order.header.customer_contact_person).toBe('営業太郎');
    expect(generated_documents.order.header.document_date).toBe('2024-04-15');
    expect(generated_documents.order.header.execution_date).toBe('2024-04-15');
    expect(generated_documents.order.header.salesperson_name).toBe('営業一郎');
    expect(generated_documents.order.header.salesperson_id).toBe('SP-0001');
    expect(generated_documents.order.header.department).toBe('営業部');

    // 注文書明細の検証
    expect(generated_documents.order.line_items).toHaveLength(2);
    expect(generated_documents.order.line_items[0].product_name).toBe('クラウドサービス基本プラン');
    expect(generated_documents.order.line_items[0].quantity).toBe(1);
    expect(generated_documents.order.line_items[0].unit_price).toBe(1000000);
    expect(generated_documents.order.line_items[0].tax_rate).toBe(0.1);
    expect(generated_documents.order.line_items[0].line_amount).toBe(1000000);
    expect(generated_documents.order.line_items[0].tax_amount).toBe(100000);
    expect(generated_documents.order.line_items[1].product_name).toBe('オンサイト導入サポート');
    expect(generated_documents.order.line_items[1].quantity).toBe(1);
    expect(generated_documents.order.line_items[1].unit_price).toBe(500000);
    expect(generated_documents.order.line_items[1].tax_rate).toBe(0.1);
    expect(generated_documents.order.line_items[1].line_amount).toBe(500000);
    expect(generated_documents.order.line_items[1].tax_amount).toBe(50000);

    // 注文書合計の検証
    expect(generated_documents.order.subtotal).toBe(1500000);
    expect(generated_documents.order.total_tax_amount).toBe(150000);
    expect(generated_documents.order.total_amount).toBe(1650000);
    expect(generated_documents.order.format_version).toBe('1.0');
    expect(generated_documents.order.is_preview_available).toBe(true);
    expect(generated_documents.order.is_pdf_downloadable).toBe(true);
    expect(generated_documents.order.is_editable).toBe(true);
    expect(generated_documents.order.is_approvable).toBe(true);
    expect(generated_documents.order.is_rejectable).toBe(true);

    // 統一フォーマット請求書の検証
    expect(generated_documents.invoice).toBeDefined();
    expect(generated_documents.invoice.document_id).toMatch(/^INV-/);
    expect(generated_documents.invoice.document_type).toBe('invoice');
    expect(generated_documents.invoice.header.customer_name).toBe('株式会社サンプル');
    expect(generated_documents.invoice.header.customer_postal_code).toBe('100-0001');
    expect(generated_documents.invoice.header.customer_address).toBe('東京都千代田区丸の内1-1-1');
    expect(generated_documents.invoice.header.customer_phone).toBe('03-XXXX-XXXX');
    expect(generated_documents.invoice.header.customer_contact_person).toBe('営業太郎');
    expect(generated_documents.invoice.header.document_date).toBe('2024-04-15');
    expect(generated_documents.invoice.header.due_date).toBe('2024-05-15');
    expect(generated_documents.invoice.header.salesperson_name).toBe('営業一郎');
    expect(generated_documents.invoice.header.salesperson_id).toBe('SP-0001');
    expect(generated_documents.invoice.header.department).toBe('営業部');
    expect(generated_documents.invoice.header.related_deal_id).toBe('DL-2024-001');
    expect(generated_documents.invoice.header.related_quotation_id).toMatch(/^QT-/);
    expect(generated_documents.invoice.header.related_order_id).toMatch(/^OR-/);

    // 請求書明細の検証
    expect(generated_documents.invoice.line_items).toHaveLength(2);
    expect(generated_documents.invoice.line_items[0].product_name).toBe('クラウドサービス基本プラン');
    expect(generated_documents.invoice.line_items[0].quantity).toBe(1);
    expect(generated_documents.invoice.line_items[0].unit_price).toBe(1000000);
    expect(generated_documents.invoice.line_items[0].tax_rate).toBe(0.1);
    expect(generated_documents.invoice.line_items[0].line_amount).toBe(1000000);
    expect(generated_documents.invoice.line_items[0].tax_amount).toBe(100000);
    expect(generated_documents.invoice.line_items[1].product_name).toBe('オンサイト導入サポート');
    expect(generated_documents.invoice.line_items[1].quantity).toBe(1);
    expect(generated_documents.invoice.line_items[1].unit_price).toBe(500000);
    expect(generated_documents.invoice.line_items[1].tax_rate).toBe(0.1);
    expect(generated_documents.invoice.line_items[1].line_amount).toBe(500000);
    expect(generated_documents.invoice.line_items[1].tax_amount).toBe(50000);

    // 請求書合計の検証
    expect(generated_documents.invoice.subtotal).toBe(1500000);
    expect(generated_documents.invoice.total_tax_amount).toBe(150000);
    expect(generated_documents.invoice.total_amount).toBe(1650000);
    expect(generated_documents.invoice.format_version).toBe('1.0');
    expect(generated_documents.invoice.is_preview_available).toBe(true);
    expect(generated_documents.invoice.is_pdf_downloadable).toBe(true);
    expect(generated_documents.invoice.is_editable).toBe(true);
    expect(generated_documents.invoice.is_approvable).toBe(true);
    expect(generated_documents.invoice.is_rejectable).toBe(true);

    // 確認・検証画面での可用性の検証
    expect(generated_documents.verification_screen_state).toBeDefined();
    expect(generated_documents.verification_screen_state.is_quotation_visible).toBe(true);
    expect(generated_documents.verification_screen_state.is_order_visible).toBe(true);
    expect(generated_documents.verification_screen_state.is_invoice_visible).toBe(true);
    expect(generated_documents.verification_screen_state.quotation_preview_format).toBe('HTML');
    expect(generated_documents.verification_screen_state.order_preview_format).toBe('HTML');
    expect(generated_documents.verification_screen_state.invoice_preview_format).toBe('HTML');
    expect(generated_documents.verification_screen_state.is_batch_operations_enabled).toBe(true);
    expect(generated_documents.verification_screen_state.can_edit_all_documents).toBe(true);
    expect(generated_documents.verification_screen_state.can_approve_all_documents).toBe(true);
    expect(generated_documents.verification_screen_state.can_reject_all_documents).toBe(true);
    expect(generated_documents.verification_screen_state.can_download_all_as_pdf).toBe(true);

    // 生成タイムスタンプの検証
    expect(generated_documents.generated_timestamp).toBeDefined();
    expect(generated_documents.is_all_documents_generated).toBe(true);
    expect(generated_documents.document_count).toBe(3);

    // 異なるパターン: 金額と明細数が異なる場合の検証
    const deal_record_input_pattern2 = {
      deal_id: 'DL-2024-002',
      customer_id: 'CUST-0002',
      customer_name: '株式会社テスト企画',
      customer_postal_code: '150-0001',
      customer_address: '東京都渋谷区神宮前1-1-1',
      customer_phone: '03-YYYY-YYYY',
      customer_contact_person: '企画花子',
      deal_status: '成約',
      deal_amount: 3000000,
      deal_date: '2024-04-16T08:00:00Z',
      line_items: [
        {
          line_item_id: 'LI-010',
          product_name: 'エンタープライズライセンス',
          quantity: 10,
          unit_price: 200000,
          tax_rate: 0.1,
          line_amount: 2000000,
          tax_amount: 200000
        },
        {
          line_item_id: 'LI-011',
          product_name: 'カスタマイズサービス',
          quantity: 1,
          unit_price: 1000000,
          tax_rate: 0.1,
          line_amount: 1000000,
          tax_amount: 100000
        }
      ],
      quotation_due_date: '2024-04-23T23:59:59Z',
      order_execution_date: '2024-04-16T09:30:00Z',
      invoice_issue_date: '2024-04-16T15:00:00Z',
      invoice_due_date: '2024-05-16T23:59:59Z',
      deal_description: 'エンタープライズパッケージ',
      salesperson_id: 'SP-0002',
      salesperson_name: '営業二郎',
      department: '営業部'
    };

    const generated_documents_pattern2 = generateUnifiedDocuments(deal_record_input_pattern2);

    expect(generated_documents_pattern2).toBeDefined();
    expect(generated_documents_pattern2.quotation).toBeDefined();
    expect(generated_documents_pattern2.order).toBeDefined();
    expect(generated_documents_pattern2.invoice).toBeDefined();
    expect(generated_documents_pattern2.quotation.line_items).toHaveLength(2);
    expect(generated_documents_pattern2.quotation.line_items[0].quantity).toBe(10);
    expect(generated_documents_pattern2.quotation.line_items[0].unit_price).toBe(200000);
    expect(generated_documents_pattern2.quotation.line_items[0].line_amount).toBe(2000000);
    expect(generated_documents_pattern2.quotation.line_items[0].tax_amount).toBe(200000);
    expect(generated_documents_pattern2.quotation.line_items[1].quantity).toBe(1);
    expect(generated_documents_pattern2.quotation.line_items[1].unit_price).toBe(1000000);
    expect(generated_documents_pattern2.quotation.line_items[1].line_amount).toBe(1000000);
    expect(generated_documents_pattern2.quotation.line_items[1].tax_amount).toBe(100000);
    expect(generated_documents_pattern2.quotation.subtotal).toBe(3000000);
    expect(generated_documents_pattern2.quotation.total_tax_amount).toBe(300000);
    expect(generated_documents_pattern2.quotation.total_amount).toBe(3300000);
    expect(generated_documents_pattern2.order.subtotal).toBe(3000000);
    expect(generated_documents_pattern2.order.total_tax_amount).toBe(300000);
    expect(generated_documents_pattern2.order.total_amount).toBe(3300000);
    expect(generated_documents_pattern2.invoice.subtotal).toBe(3000000);
    expect(generated_documents_pattern2.invoice.total_tax_amount).toBe(300000);
    expect(generated_documents_pattern2.invoice.total_amount).toBe(3300000);
    expect(generated_documents_pattern2.quotation.header.customer_name).toBe('株式会社テスト企画');
    expect(generated_documents_pattern2.order.header.customer_name).toBe('株式会社テスト企画');
    expect(generated_documents_pattern2.invoice.header.customer_name).toBe('株式会社テスト企画');
    expect(generated_documents_pattern2.verification_screen_state.is_quotation_visible).toBe(true);
    expect(generated_documents_pattern2.verification_screen_state.is_order_visible).toBe(true);
    expect(generated_documents_pattern2.verification_screen_state.is_invoice_visible).toBe(true);
    expect(generated_documents_pattern2.verification_screen_state.can_edit_all_documents).toBe(true);
    expect(generated_documents_pattern2.verification_screen_state.can_approve_all_documents).toBe(true);
    expect(generated_documents_pattern2.verification_screen_state.can_reject_all_documents).toBe(true);
    expect(generated_documents_pattern2.document_count).toBe(3);
  });
});