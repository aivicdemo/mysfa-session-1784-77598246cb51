import { validateInvoice } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-880
  test("請求書の消費税額が不正確な場合、検証が不合格になる", () => {
    const taxableAmount = 10000;
    const taxRate = 0.1;
    const expectedTaxAmount = 1000;

    const invoiceDataWithIncorrectTax = {
      id: "INV-001",
      customerId: "CUST-001",
      subtotalAmount: taxableAmount,
      taxRate: taxRate,
      taxAmount: 800,
      totalAmount: taxableAmount + 800,
      status: "PENDING_VALIDATION",
      issueDate: "2024-01-15",
      items: [
        {
          itemId: "ITEM-001",
          description: "Product A",
          quantity: 1,
          unitPrice: 10000,
          lineTotal: 10000,
        },
      ],
    };

    const result = validateInvoice(invoiceDataWithIncorrectTax);

    expect(result.success).toBe(false);
    expect(result.errorType).toBe("TAX_AMOUNT_MISMATCH");
    expect(result.errorMessage).toMatch(/消費税/);
    expect(result.errorMessage).toMatch(/1000/);
    expect(result.errorMessage).toMatch(/800/);
    expect(result.details.expectedTaxAmount).toBe(expectedTaxAmount);
    expect(result.details.actualTaxAmount).toBe(800);
    expect(result.details.taxRate).toBe(0.1);
    expect(result.invoiceStatus).toBe("VALIDATION_FAILED");
  });
});