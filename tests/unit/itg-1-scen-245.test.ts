import { validateBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-245
  test("請求対象データ妥当性検証機能 - 重複データを検出し不承認を判定する", () => {
    const testData = [
      {
        billingId: "BILL-001",
        customerId: "CUST-0001",
        billingAmount: 100000,
        billingDate: "2024-04-15",
        itemCount: 5,
        status: "pending" as const,
      },
      {
        billingId: "BILL-002",
        customerId: "CUST-0001",
        billingAmount: 100000,
        billingDate: "2024-04-15",
        itemCount: 5,
        status: "pending" as const,
      },
      {
        billingId: "BILL-003",
        customerId: "CUST-0002",
        billingAmount: 50000,
        billingDate: "2024-04-16",
        itemCount: 3,
        status: "pending" as const,
      },
    ];

    const result = validateBillingTargetData(testData);

    // 重複検出の確認
    expect(result.isDuplicate).toBe(true);
    expect(result.duplicateCount).toBe(2);

    // 重複データの詳細情報の確認
    expect(result.duplicateDetails).toEqual([
      {
        duplicateKey: "CUST-0001_100000_2024-04-15",
        affectedBillingIds: ["BILL-001", "BILL-002"],
        duplicateFieldsCount: 3,
        duplicateFields: ["customerId", "billingAmount", "billingDate"],
      },
    ]);

    // 不承認判定の確認
    expect(result.approvalStatus).toBe("rejected");
    expect(result.rejectionReason).toBe("duplicate_detected");

    // 重複検出されたデータの承認ステータスの確認
    expect(result.dataValidationDetails).toEqual([
      {
        billingId: "BILL-001",
        isValid: false,
        approvalStatus: "rejected",
        reason: "duplicate_entry",
      },
      {
        billingId: "BILL-002",
        isValid: false,
        approvalStatus: "rejected",
        reason: "duplicate_entry",
      },
      {
        billingId: "BILL-003",
        isValid: true,
        approvalStatus: "approved",
        reason: null,
      },
    ]);

    // 検証概要の確認
    expect(result.validationSummary).toEqual({
      totalRecords: 3,
      validRecords: 1,
      invalidRecords: 2,
      approvedCount: 1,
      rejectedCount: 2,
      validationPassRate: 0.333,
    });
  });
});