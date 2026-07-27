import { validateInvoiceData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-814
  test("請求対象データ妥当性検証機能 - 重複する請求データが存在するとき、重複フラグを付与して不承認と判定する", () => {
    const invoiceRecord1 = {
      customerId: "CUST001",
      dealId: "DEAL001",
      invoiceAmount: 100000,
      recordId: "REC001",
    };

    const invoiceRecord2 = {
      customerId: "CUST001",
      dealId: "DEAL001",
      invoiceAmount: 100000,
      recordId: "REC002",
    };

    const dataSet = [invoiceRecord1, invoiceRecord2];

    const result = validateInvoiceData(dataSet);

    expect(result).toHaveLength(2);

    const validationResult1 = result.find((r) => r.recordId === "REC001");
    const validationResult2 = result.find((r) => r.recordId === "REC002");

    expect(validationResult1).toBeDefined();
    expect(validationResult2).toBeDefined();

    expect(validationResult1?.isDuplicate).toBe(true);
    expect(validationResult2?.isDuplicate).toBe(true);

    expect(validationResult1?.approvalStatus).toBe("不承認");
    expect(validationResult2?.approvalStatus).toBe("不承認");

    expect(validationResult1?.duplicateReason).toContain("同一顧客ID");
    expect(validationResult1?.duplicateReason).toContain("同一商談ID");
    expect(validationResult1?.duplicateReason).toContain("同一請求金額");

    expect(validationResult2?.duplicateReason).toContain("同一顧客ID");
    expect(validationResult2?.duplicateReason).toContain("同一商談ID");
    expect(validationResult2?.duplicateReason).toContain("同一請求金額");
  });
});