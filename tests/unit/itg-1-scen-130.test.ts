import { validateInvoiceGenerationData } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-130
  test("帳票生成検証機能 - 生成された請求書の顧客情報が不完全な場合に警告が表示される", () => {
    const incomplete_customer_data = {
      customer_name: "",
      customer_address: "",
      customer_phone: "09012345678",
      transaction_amount: 100000,
      transaction_date: "2024-01-15",
      line_items: [
        {
          item_name: "商品A",
          quantity: 10,
          unit_price: 10000,
        },
      ],
    };

    const result = validateInvoiceGenerationData(incomplete_customer_data);

    expect(result.is_valid).toBe(false);
    expect(result.warnings).toContain(expect.objectContaining({ field: "customer_name" }));
    expect(result.warnings).toContain(expect.objectContaining({ field: "customer_address" }));
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w: { field: string }) => w.field === "customer_name")).toBe(true);
    expect(result.warnings.some((w: { field: string }) => w.field === "customer_address")).toBe(
      true
    );
    expect(result.generation_blocked).toBe(true);
  });
});