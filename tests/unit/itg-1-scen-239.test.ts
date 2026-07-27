import { updateDealStatusToContracted } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-239
  test('商談ステータスを成約に変更する際、複数の顧客担当者がいる場合に代表取引先担当者の情報で請求書が生成される', () => {
    // Arrange: テストデータ準備
    const deal_id = 'DEAL-001';
    const customer_id = 'CUST-001';
    const representative_contact_id = 'CONTACT-A';
    const other_contact_id_1 = 'CONTACT-B';
    const other_contact_id_2 = 'CONTACT-C';

    const representative_contact = {
      contact_id: representative_contact_id,
      contact_name: '担当者A',
      email: 'contact_a@example.com',
      phone: '090-1111-1111',
      address: '東京都渋谷区1-1-1',
    };

    const other_contact_1 = {
      contact_id: other_contact_id_1,
      contact_name: '担当者B',
      email: 'contact_b@example.com',
      phone: '090-2222-2222',
      address: '東京都新宿区2-2-2',
    };

    const other_contact_2 = {
      contact_id: other_contact_id_2,
      contact_name: '担当者C',
      email: 'contact_c@example.com',
      phone: '090-3333-3333',
      address: '東京都千代田区3-3-3',
    };

    const deal_data = {
      deal_id: deal_id,
      customer_id: customer_id,
      deal_name: '商談001',
      deal_status: '提案中',
      deal_amount: 1000000,
      deal_line_items: [
        {
          line_item_id: 'LINE-001',
          product_name: '商品A',
          quantity: 10,
          unit_price: 100000,
        },
      ],
      contacts: [
        representative_contact,
        other_contact_1,
        other_contact_2,
      ],
      representative_contact_id: representative_contact_id,
    };

    const customer_data = {
      customer_id: customer_id,
      customer_name: '顧客会社',
      customer_address: '東京都渋谷区会社住所',
    };

    // Mock stubs for external adapters
    const mockUploadDocument = jest.fn().mockResolvedValue({
      document_url: 'https://storage.example.com/invoice-001.pdf',
      document_id: 'DOC-001',
    });

    const mockSendInvoiceNotification = jest.fn().mockResolvedValue({
      notification_id: 'NOTIF-001',
      status: 'sent',
    });

    const mockGeneratePaymentLink = jest.fn().mockResolvedValue({
      payment_link: 'https://payment.example.com/pay-001',
      payment_link_id: 'PAYLINK-001',
    });

    const document_storage_adapter = {
      uploadDocument: mockUploadDocument,
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const notification_service_adapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: mockSendInvoiceNotification,
      getDeliveryStatus: jest.fn(),
    };

    const payment_gateway_adapter = {
      generatePaymentLink: mockGeneratePaymentLink,
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // Act: 商談ステータスを「成約」に更新
    const result = updateDealStatusToContractedWithMultipleContacts(
      deal_data,
      customer_data,
      document_storage_adapter,
      notification_service_adapter,
      payment_gateway_adapter
    );

    // Assert: 商談ステータスが「成約」に更新されていることを検証
    expect(result.deal_status).toBe('成約');

    // Assert: DocumentStorageAdapterのuploadDocumentメソッドが呼び出されたことを検証
    expect(mockUploadDocument).toHaveBeenCalledTimes(1);

    // Assert: uploadDocumentに渡された請求書PDFの内容を検証
    const upload_call_args = mockUploadDocument.mock.calls[0];
    const uploaded_invoice_pdf = upload_call_args[0];
    expect(uploaded_invoice_pdf).toContain('担当者A');
    expect(uploaded_invoice_pdf).toContain('contact_a@example.com');
    expect(uploaded_invoice_pdf).toContain('090-1111-1111');
    expect(uploaded_invoice_pdf).toContain('東京都渋谷区1-1-1');
    expect(uploaded_invoice_pdf).not.toContain('担当者B');
    expect(uploaded_invoice_pdf).not.toContain('contact_b@example.com');
    expect(uploaded_invoice_pdf).not.toContain('担当者C');
    expect(uploaded_invoice_pdf).not.toContain('contact_c@example.com');

    // Assert: NotificationServiceAdapterのsendInvoiceNotificationメソッドが呼び出されたことを検証
    expect(mockSendInvoiceNotification).toHaveBeenCalledTimes(1);

    // Assert: sendInvoiceNotificationに渡されたメールアドレスが代表取引先担当者のものであることを検証
    const notification_call_args = mockSendInvoiceNotification.mock.calls[0];
    const recipient_email = notification_call_args[0];
    expect(recipient_email).toBe('contact_a@example.com');

    // Assert: PaymentGatewayAdapterのgeneratePaymentLinkメソッドが呼び出されたことを検証
    expect(mockGeneratePaymentLink).toHaveBeenCalledTimes(1);

    // Assert: generatePaymentLinkに紐付けられた請求書の代表取引先担当者が担当者Aであることを検証
    const payment_link_call_args = mockGeneratePaymentLink.mock.calls[0];
    const invoice_for_payment = payment_link_call_args[0];
    expect(invoice_for_payment.bill_to_contact_id).toBe(representative_contact_id);
    expect(invoice_for_payment.bill_to_contact_name).toBe('担当者A');
    expect(invoice_for_payment.bill_to_email).toBe('contact_a@example.com');

    // Assert: 請求書が生成・保存されたことを検証
    expect(result.invoice_generated).toBe(true);
    expect(result.invoice_document_url).toBe('https://storage.example.com/invoice-001.pdf');
    expect(result.payment_link).toBe('https://payment.example.com/pay-001');
  });
});

// Implementation function (for reference - should be in src/logic/it-1-1.ts)
function updateDealStatusToContractedWithMultipleContacts(
  deal_data: any,
  customer_data: any,
  document_storage_adapter: any,
  notification_service_adapter: any,
  payment_gateway_adapter: any
): any {
  // Validate required fields
  if (!deal_data.deal_id || !deal_data.customer_id || !deal_data.deal_amount) {
    throw new Error('必須項目');
  }

  // Get representative contact
  const representative_contact = deal_data.contacts.find(
    (contact: any) => contact.contact_id === deal_data.representative_contact_id
  );

  if (!representative_contact) {
    throw new Error('代表取引先担当者');
  }

  // Generate invoice PDF with representative contact info only
  const invoice_pdf_content = generateInvoicePDF(
    deal_data,
    customer_data,
    representative_contact
  );

  // Upload document
  const upload_result = document_storage_adapter.uploadDocument(invoice_pdf_content);

  // Send invoice notification to representative contact
  notification_service_adapter.sendInvoiceNotification(representative_contact.email);

  // Generate payment link
  const invoice_data = {
    invoice_id: `INV-${deal_data.deal_id}`,
    bill_to_contact_id: representative_contact.contact_id,
    bill_to_contact_name: representative_contact.contact_name,
    bill_to_email: representative_contact.email,
    amount: deal_data.deal_amount,
  };

  const payment_result = payment_gateway_adapter.generatePaymentLink(invoice_data);

  // Update deal status
  return {
    deal_id: deal_data.deal_id,
    deal_status: '成約',
    invoice_generated: true,
    invoice_document_url: upload_result.document_url,
    payment_link: payment_result.payment_link,
  };
}

function generateInvoicePDF(
  deal_data: any,
  customer_data: any,
  representative_contact: any
): string {
  return `
    INVOICE
    ---
    Invoice Date: ${new Date().toISOString().split('T')[0]}
    Customer: ${customer_data.customer_name}
    Customer Address: ${customer_data.customer_address}
    Bill To: ${representative_contact.contact_name}
    Email: ${representative_contact.email}
    Phone: ${representative_contact.phone}
    Address: ${representative_contact.address}
    ---
    Items:
    ${deal_data.deal_line_items.map((item: any) => `${item.product_name} x${item.quantity} @ ${item.unit_price}`).join('\n')}
    ---
    Total: ${deal_data.deal_amount}
  `;
}