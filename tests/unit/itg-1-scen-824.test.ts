import { validateInvoiceDataFeasibility } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-824
  test("請求対象データ妥当性検証機能 - 複数請求の合計額が商談金額と異なる場合は不承認と判定する", () => {
    const deal_id = "DEAL-001";
    const deal_amount = 1000000;
    const deal_status = "有効";

    const invoices = [
      {
        invoice_id: "INV-A",
        deal_id: deal_id,
        amount: 600000,
      },
      {
        invoice_id: "INV-B",
        deal_id: deal_id,
        amount: 300000,
      },
      {
        invoice_id: "INV-C",
        deal_id: deal_id,
        amount: 150000,
      },
    ];

    const deal = {
      deal_id: deal_id,
      amount: deal_amount,
      status: deal_status,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const result = validateInvoiceDataFeasibility(
      deal,
      invoices,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.is_approved).toBe(false);
    expect(result.error_code).toBe("INVOICE_AMOUNT_MISMATCH");
    expect(result.error_message).toMatch(/請求合計額.*1050000.*商談金額.*1000000.*一致/);
    expect(result.deal_status_after_validation).toBe("有効");
  });
});