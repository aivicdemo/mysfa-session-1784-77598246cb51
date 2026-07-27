import { validateInvoiceForApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-873
  test("請求書に紐付く顧客が存在しないとき検証が不合格になる", () => {
    const invoiceData = {
      invoiceId: "INV-20240115-001",
      customerId: 9999999,
      invoiceDate: new Date("2024-01-15T09:00:00Z"),
      dueDate: new Date("2024-02-15T23:59:59Z"),
      totalAmount: 150000,
      status: "pending_approval",
      items: [
        {
          itemId: "ITEM-001",
          productName: "サービス提供（1月分）",
          quantity: 1,
          unitPrice: 150000,
          amount: 150000,
        },
      ],
    };

    const mockCustomerRepository = {
      findById: jest.fn().mockReturnValue(null),
    };

    const result = validateInvoiceForApproval(invoiceData, mockCustomerRepository);

    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe("INVOICE_CUSTOMER_NOT_FOUND");
    expect(result.message).toMatch(/顧客が存在しません/);
    expect(result.invoiceStatus).toBe("pending_approval");
  });
});