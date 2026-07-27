import { issueOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-079: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ入力で注文書を2回発行したとき、同じ結果が記録される
  test('同じ入力で注文書を2回発行したときPDF内容と発行履歴内容が一致し、発行日時と履歴IDのみ異なること', () => {
    const test_customer_id = 'CUST-001';
    const test_customer_name = 'テスト顧客株式会社';
    const test_product_list = [
      { product_id: 'PROD-A', product_name: '商品A', quantity: 2, unit_price: 10000 },
      { product_id: 'PROD-B', product_name: '商品B', quantity: 1, unit_price: 50000 },
    ];
    const test_subtotal = 70000;
    const test_tax_rate = 0.1;
    const test_tax_amount = 7000;
    const test_total_amount = 77000;
    const test_document_binary_content = Buffer.from('mock_pdf_content_1st');
    const test_document_id_1st_upload = 'DOC-2024-001';
    const test_order_history_id_1st = 'ORDER-HIST-001';
    const test_issue_timestamp_1st = new Date('2024-01-15T10:00:00Z');
    const test_document_binary_content_2nd = Buffer.from('mock_pdf_content_1st');
    const test_document_id_2nd_upload = 'DOC-2024-001';
    const test_order_history_id_2nd = 'ORDER-HIST-002';
    const test_issue_timestamp_2nd = new Date('2024-01-15T11:30:00Z');

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn()
        .mockResolvedValueOnce({
          document_id: test_document_id_1st_upload,
          binary_content: test_document_binary_content,
        })
        .mockResolvedValueOnce({
          document_id: test_document_id_2nd_upload,
          binary_content: test_document_binary_content_2nd,
        }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mock_audit_log_exporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const order_input_1st = {
      customer_id: test_customer_id,
      customer_name: test_customer_name,
      product_list: test_product_list,
      subtotal: test_subtotal,
      tax_rate: test_tax_rate,
      tax_amount: test_tax_amount,
      total_amount: test_total_amount,
      issue_timestamp: test_issue_timestamp_1st,
    };

    const result_1st = issueOrder(
      order_input_1st,
      mock_document_storage_adapter,
      mock_audit_log_exporter
    );

    expect(result_1st.pdf_content).toEqual(test_document_binary_content);
    expect(result_1st.document_id).toBe(test_document_id_1st_upload);
    expect(result_1st.order_history_id).toBe(test_order_history_id_1st);
    expect(result_1st.customer_id).toBe(test_customer_id);
    expect(result_1st.customer_name).toBe(test_customer_name);
    expect(result_1st.product_list).toEqual(test_product_list);
    expect(result_1st.subtotal).toBe(test_subtotal);
    expect(result_1st.tax_amount).toBe(test_tax_amount);
    expect(result_1st.total_amount).toBe(test_total_amount);
    expect(result_1st.issue_timestamp).toEqual(test_issue_timestamp_1st);

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mock_audit_log_exporter.logDataAccess).toHaveBeenCalledTimes(1);

    const first_audit_log_call = mock_audit_log_exporter.logDataAccess.mock.calls[0][0];
    expect(first_audit_log_call.event_type).toBe('ORDER_ISSUED');
    expect(first_audit_log_call.timestamp).toEqual(test_issue_timestamp_1st);

    const order_input_2nd = {
      customer_id: test_customer_id,
      customer_name: test_customer_name,
      product_list: test_product_list,
      subtotal: test_subtotal,
      tax_rate: test_tax_rate,
      tax_amount: test_tax_amount,
      total_amount: test_total_amount,
      issue_timestamp: test_issue_timestamp_2nd,
    };

    const result_2nd = issueOrder(
      order_input_2nd,
      mock_document_storage_adapter,
      mock_audit_log_exporter
    );

    expect(result_2nd.pdf_content).toEqual(test_document_binary_content_2nd);
    expect(result_2nd.document_id).toBe(test_document_id_2nd_upload);
    expect(result_2nd.order_history_id).toBe(test_order_history_id_2nd);
    expect(result_2nd.customer_id).toBe(test_customer_id);
    expect(result_2nd.customer_name).toBe(test_customer_name);
    expect(result_2nd.product_list).toEqual(test_product_list);
    expect(result_2nd.subtotal).toBe(test_subtotal);
    expect(result_2nd.tax_amount).toBe(test_tax_amount);
    expect(result_2nd.total_amount).toBe(test_total_amount);
    expect(result_2nd.issue_timestamp).toEqual(test_issue_timestamp_2nd);

    expect(mock_document_storage_adapter.uploadDocument).toHaveBeenCalledTimes(2);
    expect(mock_audit_log_exporter.logDataAccess).toHaveBeenCalledTimes(2);

    const second_audit_log_call = mock_audit_log_exporter.logDataAccess.mock.calls[1][0];
    expect(second_audit_log_call.event_type).toBe('ORDER_ISSUED');
    expect(second_audit_log_call.timestamp).toEqual(test_issue_timestamp_2nd);

    expect(result_1st.pdf_content).toEqual(result_2nd.pdf_content);
    expect(result_1st.document_id).toBe(result_2nd.document_id);
    expect(result_1st.customer_id).toBe(result_2nd.customer_id);
    expect(result_1st.customer_name).toBe(result_2nd.customer_name);
    expect(result_1st.product_list).toEqual(result_2nd.product_list);
    expect(result_1st.subtotal).toBe(result_2nd.subtotal);
    expect(result_1st.tax_amount).toBe(result_2nd.tax_amount);
    expect(result_1st.total_amount).toBe(result_2nd.total_amount);

    expect(result_1st.order_history_id).not.toBe(result_2nd.order_history_id);
    expect(result_1st.issue_timestamp).not.toEqual(result_2nd.issue_timestamp);

    expect(first_audit_log_call.timestamp).not.toEqual(second_audit_log_call.timestamp);
  });
});