import { validateBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - 請求対象データの妥当性検証", () => {
  // SCEN-842
  test("月初日が請求期日のとき、その日付を有効な期日として検証を続行し、後続項目の検証も完了する", () => {
    const billingStartDate = new Date("2024-01-01T00:00:00Z");
    const billingDueDate = new Date("2024-01-01T00:00:00Z");
    const billingEndDate = new Date("2024-01-31T23:59:59Z");

    const billingTargetData = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      customerEmail: "customer@example.com",
      dealAmount: 1000000,
      billingStartDate: billingStartDate,
      billingDueDate: billingDueDate,
      billingEndDate: billingEndDate,
      lineItems: [
        {
          itemId: "ITEM-001",
          itemName: "商品A",
          quantity: 10,
          unitPrice: 100000,
          lineTotal: 1000000,
        },
      ],
      totalAmount: 1000000,
      currency: "JPY",
    };

    const result = validateBillingTargetData(billingTargetData);

    expect(result.validationStatus).toBe("valid");
    expect(result.errorList).toEqual([]);
    expect(result.isReadyForBillingGeneration).toBe(true);
    expect(result.processedAt).toBeDefined();
  });
});