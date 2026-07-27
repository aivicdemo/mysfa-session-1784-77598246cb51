import { validateInvoiceForApproval } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-121
  test("請求書承認検証機能 - 請求書に記載される顧客メールアドレスが有効な形式のとき、検証を成功させる", () => {
    const mockNotificationAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg-123456",
        status: "sent",
        timestamp: "2024-01-15T11:00:00Z",
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const invoiceData = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-001",
      customerName: "Example Corporation",
      customerEmail: "customer@example.com",
      invoiceDate: "2024-01-15T10:00:00Z",
      dueDate: "2024-02-15T23:59:59Z",
      totalAmount: 150000,
      currency: "JPY",
      lineItems: [
        {
          itemId: "ITEM-001",
          description: "Product A",
          quantity: 2,
          unitPrice: 50000,
          amount: 100000,
        },
        {
          itemId: "ITEM-002",
          description: "Service B",
          quantity: 1,
          unitPrice: 50000,
          amount: 50000,
        },
      ],
      status: "draft",
    };

    const validationResult = validateInvoiceForApproval(
      invoiceData,
      mockNotificationAdapter
    );

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.validationStatus).toBe("success");
    expect(validationResult.emailValidationStatus).toBe("valid");
    expect(validationResult.errors).toEqual([]);
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: "INV-2024-001",
        customerEmail: "customer@example.com",
      })
    );
    expect(validationResult.canProceedToNextStep).toBe(true);
  });
});