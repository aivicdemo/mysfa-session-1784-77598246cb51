import { matchSalesAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-928: [error] 売上実績・請求データ照合機能 - 売上実績レコードに売上計上予定日が未設定の場合、照合不可として処理される", () => {
    // Arrange
    const salesRecord = {
      salesId: "SR-001",
      customerId: "CUST-100",
      amount: 50000,
      expectedPostingDate: null,
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      customerId: "CUST-100",
      invoiceAmount: 50000,
      invoiceDate: "2024-01-15",
    };

    const reconciliationLogs: Array<{
      reconciliationId: string;
      targetRecordId: string;
      failureReason: string;
      timestamp: string;
    }> = [];

    const mockLogReconciliationFailure = (
      reconciliationId: string,
      targetRecordId: string,
      failureReason: string,
      timestamp: string
    ) => {
      reconciliationLogs.push({
        reconciliationId,
        targetRecordId,
        failureReason,
        timestamp,
      });
    };

    // Act
    const result = matchSalesAndInvoiceData(
      salesRecord,
      invoiceRecord,
      mockLogReconciliationFailure
    );

    // Assert
    expect(result.reconciliationStatus).toBe("照合不可");
    expect(result.errorCode).toBe("SALES_POSTING_DATE_MISSING");
    expect(result.errorMessage).toBe(
      "売上実績レコード（ID:SR-001）の売上計上予定日が未設定のため、照合を実行できません"
    );

    expect(reconciliationLogs).toHaveLength(1);
    const logEntry = reconciliationLogs[0];
    expect(logEntry.targetRecordId).toBe("SR-001");
    expect(logEntry.failureReason).toBe(
      "売上実績レコード（ID:SR-001）の売上計上予定日が未設定のため、照合を実行できません"
    );
    expect(logEntry.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });
});