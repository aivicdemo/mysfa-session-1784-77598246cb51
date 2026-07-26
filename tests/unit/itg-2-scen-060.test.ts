import { detectDealAndInvoiceMismatch } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-060: [error] ステータス・請求ズレ検出機能 - 商談ステータスと請求データが整合しない場合、エラーが発生する
  test("should detect mismatch between deal status and invoice data and throw error with code and details", () => {
    const dealData = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      status: "成約",
      contractAmount: 1000000,
      contractDate: "2024-01-15",
      invoiceScheduleDate: "2024-02-15",
    };

    const invoiceData = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      customerId: "CUST-001",
      invoiceAmount: 950000,
      invoiceDate: "2024-02-20",
    };

    expect(() => detectDealAndInvoiceMismatch(dealData, invoiceData)).toThrow(
      /商談ステータスと請求データが整合しません/
    );

    try {
      detectDealAndInvoiceMismatch(dealData, invoiceData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toContain("商談ステータスと請求データが整合しません");
        const errorObj = error as Error & {
          code?: string;
          details?: Record<string, unknown>;
        };
        expect(errorObj.code).toBeDefined();
        expect(errorObj.details).toBeDefined();
      }
    }
  });
});