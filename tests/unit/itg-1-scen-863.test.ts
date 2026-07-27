import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { validateInvoiceApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  let mockNotificationAdapter: {
    sendInvoiceNotification: jest.Mock;
    sendQuoteNotification: jest.Mock;
    sendOrderNotification: jest.Mock;
    getDeliveryStatus: jest.Mock;
  };

  beforeEach(() => {
    mockNotificationAdapter = {
      sendInvoiceNotification: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };
  });

  // SCEN-863
  test("should fail validation and not send notification when customer email is missing", () => {
    const invoiceData = {
      invoiceId: "INV-2024-001",
      invoiceStatus: "pending_approval",
      customerName: "株式会社テスト",
      customerId: "CUST-001",
      customerEmail: "",
      invoiceAmount: 100000,
      invoiceDate: "2024-01-15",
      lineItems: [
        {
          itemId: "ITEM-001",
          description: "商品A",
          quantity: 1,
          unitPrice: 100000,
        },
      ],
    };

    const result = validateInvoiceApproval(
      invoiceData,
      mockNotificationAdapter
    );

    expect(result.isValid).toBe(false);
    expect(result.validationErrors).toContain("顧客のメールアドレスが必須です");
    expect(result.invoiceStatus).toBe("pending_approval");
    expect(mockNotificationAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
  });

  test("should fail validation and not send notification when customer email is null", () => {
    const invoiceData = {
      invoiceId: "INV-2024-002",
      invoiceStatus: "pending_approval",
      customerName: "株式会社テスト",
      customerId: "CUST-002",
      customerEmail: null as unknown as string,
      invoiceAmount: 150000,
      invoiceDate: "2024-01-16",
      lineItems: [
        {
          itemId: "ITEM-002",
          description: "商品B",
          quantity: 2,
          unitPrice: 75000,
        },
      ],
    };

    const result = validateInvoiceApproval(
      invoiceData,
      mockNotificationAdapter
    );

    expect(result.isValid).toBe(false);
    expect(result.validationErrors).toContain("顧客のメールアドレスが必須です");
    expect(result.invoiceStatus).toBe("pending_approval");
    expect(mockNotificationAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
  });
});