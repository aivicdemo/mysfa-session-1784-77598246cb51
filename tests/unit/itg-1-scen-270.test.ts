import { validateQuotationContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-270
  test("[normal] 帳票内容検証機能 - 見積書に紐付く請求明細が1行の場合、検証対象として処理される", () => {
    // Arrange: 見積書レコード
    const quotationRecord = {
      quotation_id: "QT-001",
      customer_name: "山田商事",
      amount: 100000,
      created_at: new Date("2024-01-15T10:00:00Z"),
    };

    // 請求明細データ
    const invoiceLinesData = [
      {
        line_id: "INV-LINE-001",
        quotation_id: "QT-001",
        product_name: "商品A",
        quantity: 1,
        unit_price: 100000,
        line_amount: 100000,
      },
    ];

    // DocumentStorageAdapter スタブ
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: "FILE-001",
        file_url:
          "https://drive.google.com/file/d/FILE-001/view?usp=sharing",
      }),
      generateShareLink: jest
        .fn()
        .mockResolvedValue(
          "https://drive.google.com/file/d/FILE-001/view?usp=sharing"
        ),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapter スタブ
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        message_id: "MSG-001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        message_id: "MSG-002",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        message_id: "MSG-003",
        status: "sent",
      }),
      getDeliveryStatus: jest
        .fn()
        .mockResolvedValue({ status: "delivered", opened_at: null }),
    };

    // Act: 検証処理を実行
    const validationResult = validateQuotationContent(
      quotationRecord,
      invoiceLinesData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert: 検証結果をアサート
    expect(validationResult).toEqual({
      quotation_id: "QT-001",
      validation_status: "valid",
      invoice_line_count: 1,
      total_amount: 100000,
      matched_details: [
        {
          line_id: "INV-LINE-001",
          product_name: "商品A",
          quantity: 1,
          unit_price: 100000,
          line_amount: 100000,
          match_status: "matched",
        },
      ],
      document_upload_confirmed: true,
      notification_sent_confirmed: true,
    });

    // DocumentStorageAdapter.uploadDocument が呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        quotation_id: "QT-001",
        customer_name: "山田商事",
      })
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);

    // NotificationServiceAdapter.sendQuoteNotification が呼び出されたことを確認
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        quotation_id: "QT-001",
        customer_name: "山田商事",
      })
    );
    expect(
      mockNotificationServiceAdapter.sendQuoteNotification
    ).toHaveBeenCalledTimes(1);
  });
});