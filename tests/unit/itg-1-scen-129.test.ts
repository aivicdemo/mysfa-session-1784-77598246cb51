import { validateGeneratedDocuments } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  test('SCEN-129: [normal] 帳票生成検証機能 - 成約時に生成された見積・注文・請求書の必須項目がすべて入力されていることを検証できる', () => {
    // 成約案件のテストデータ
    const dealData = {
      deal_id: 'DEAL-20240115-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      product_name: 'サービスA',
      quantity: 10,
      unit_price: 50000,
      total_amount: 500000,
      deal_status: '受注',
      deal_date: '2024-01-15T10:00:00Z',
      delivery_date: '2024-02-15T00:00:00Z',
    };

    const estimateData = {
      estimate_id: 'EST-20240115-001',
      customer_name: '株式会社テスト',
      product_name: 'サービスA',
      amount: 500000,
      issue_date: '2024-01-15',
      validity_date: '2024-02-15',
    };

    const orderData = {
      order_id: 'ORD-20240115-001',
      customer_name: '株式会社テスト',
      product_name: 'サービスA',
      quantity: 10,
      unit_price: 50000,
      total_amount: 500000,
      delivery_date: '2024-02-15',
      order_date: '2024-01-15',
    };

    const invoiceData = {
      invoice_id: 'INV-20240115-001',
      customer_name: '株式会社テスト',
      invoice_amount: 500000,
      invoice_date: '2024-01-15',
      payment_due_date: '2024-02-28',
    };

    const generatedDocuments = {
      estimate: estimateData,
      order: orderData,
      invoice: invoiceData,
    };

    // 帳票生成検証機能を実行
    const validationResult = validateGeneratedDocuments(dealData, generatedDocuments);

    // 検証結果が成功であることを確認
    expect(validationResult.is_valid).toBe(true);

    // 見積書の必須項目すべてが入力されていることを確認
    expect(validationResult.estimate_validation.is_complete).toBe(true);
    expect(validationResult.estimate_validation.has_customer_name).toBe(true);
    expect(validationResult.estimate_validation.has_product_name).toBe(true);
    expect(validationResult.estimate_validation.has_amount).toBe(true);
    expect(validationResult.estimate_validation.has_issue_date).toBe(true);
    expect(validationResult.estimate_validation.has_validity_date).toBe(true);
    expect(validationResult.estimate_validation.missing_fields.length).toBe(0);

    // 注文書の必須項目すべてが入力されていることを確認
    expect(validationResult.order_validation.is_complete).toBe(true);
    expect(validationResult.order_validation.has_customer_name).toBe(true);
    expect(validationResult.order_validation.has_product_name).toBe(true);
    expect(validationResult.order_validation.has_quantity).toBe(true);
    expect(validationResult.order_validation.has_unit_price).toBe(true);
    expect(validationResult.order_validation.has_total_amount).toBe(true);
    expect(validationResult.order_validation.has_delivery_date).toBe(true);
    expect(validationResult.order_validation.missing_fields.length).toBe(0);

    // 請求書の必須項目すべてが入力されていることを確認
    expect(validationResult.invoice_validation.is_complete).toBe(true);
    expect(validationResult.invoice_validation.has_customer_name).toBe(true);
    expect(validationResult.invoice_validation.has_invoice_amount).toBe(true);
    expect(validationResult.invoice_validation.has_invoice_date).toBe(true);
    expect(validationResult.invoice_validation.has_payment_due_date).toBe(true);
    expect(validationResult.invoice_validation.missing_fields.length).toBe(0);

    // 生成された帳票の値が成約案件の情報と一致していることを確認
    expect(validationResult.estimate_validation.customer_name_match).toBe(true);
    expect(validationResult.estimate_validation.amount_match).toBe(true);

    expect(validationResult.order_validation.customer_name_match).toBe(true);
    expect(validationResult.order_validation.quantity_match).toBe(true);
    expect(validationResult.order_validation.unit_price_match).toBe(true);
    expect(validationResult.order_validation.total_amount_match).toBe(true);
    expect(validationResult.order_validation.delivery_date_match).toBe(true);

    expect(validationResult.invoice_validation.customer_name_match).toBe(true);
    expect(validationResult.invoice_validation.amount_match).toBe(true);
    expect(validationResult.invoice_validation.date_match).toBe(true);

    // 生成された3つの帳票すべてが正常に出力されていることを確認
    expect(validationResult.all_documents_generated).toBe(true);
    expect(validationResult.document_count).toBe(3);
    expect(validationResult.validation_errors.length).toBe(0);
  });
});