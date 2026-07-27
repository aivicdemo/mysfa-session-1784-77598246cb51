import { validateInvoiceForApproval } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-128
  test("請求書承認検証機能 - 複数の検証項目が失敗したとき、承認不可と失敗理由一覧を返す", async () => {
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

    const invoiceData = {
      invoiceAmount: -10000,
      invoiceBillingCompanyName: "",
      invoiceDateString: "2099-12-31",
      invoiceId: "INV-20240115-001",
      invoiceCustomerId: "CUST-001",
    };

    const result = await validateInvoiceForApproval(
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter
    );

    expect(result.approvalStatus).toBe("REJECTED");
    expect(result.reasons).toHaveLength(3);

    expect(result.reasons[0]).toEqual({
      validationRule: "AMOUNT_VALIDITY",
      message: "請求書金額は0以上である必要があります",
    });

    expect(result.reasons[1]).toEqual({
      validationRule: "REQUIRED_FIELD",
      message: "請求先企業名は必須項目です",
    });

    expect(result.reasons[2]).toEqual({
      validationRule: "DATE_VALIDITY",
      message: "請求日付は本日以前の日付である必要があります",
    });

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(
      mockNotificationServiceAdapter.sendInvoiceNotification
    ).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});