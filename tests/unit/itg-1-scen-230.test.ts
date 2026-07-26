import { validateMigrationDataConsistency } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-230
  test("商談ステータス『成約』で請求書発行状況『未発行』のデータレコードが検出され、照合ズレレポートに記録される", () => {
    const migrationData = [
      {
        dealId: "DEAL-001",
        customerName: "顧客A",
        dealStatus: "成約",
        invoiceIssuanceStatus: "未発行",
        dealAmount: 100000,
        expectedInvoiceDate: "2024-01-31",
      },
      {
        dealId: "DEAL-002",
        customerName: "顧客B",
        dealStatus: "成約",
        invoiceIssuanceStatus: "発行済",
        dealAmount: 200000,
        expectedInvoiceDate: "2024-01-31",
      },
      {
        dealId: "DEAL-003",
        customerName: "顧客C",
        dealStatus: "受注",
        invoiceIssuanceStatus: "未発行",
        dealAmount: 150000,
        expectedInvoiceDate: "2024-02-28",
      },
    ];

    const result = validateMigrationDataConsistency(migrationData);

    expect(result.isConsistent).toBe(false);
    expect(result.discrepancyCount).toBe(1);
    expect(result.errorMessage).toMatch(/商談ステータスと請求書発行状況/);
    expect(result.discrepancyDetails).toHaveLength(1);
    expect(result.discrepancyDetails[0]).toEqual({
      dealId: "DEAL-001",
      customerName: "顧客A",
      dealStatus: "成約",
      invoiceIssuanceStatus: "未発行",
      issueType: "照合ズレ",
    });
  });

  test("すべての商談ステータスと請求書発行状況が一致している場合、検証成功で一貫性が確認される", () => {
    const migrationData = [
      {
        dealId: "DEAL-001",
        customerName: "顧客A",
        dealStatus: "成約",
        invoiceIssuanceStatus: "発行済",
        dealAmount: 100000,
        expectedInvoiceDate: "2024-01-31",
      },
      {
        dealId: "DEAL-002",
        customerName: "顧客B",
        dealStatus: "受注",
        invoiceIssuanceStatus: "発行済",
        dealAmount: 200000,
        expectedInvoiceDate: "2024-01-31",
      },
      {
        dealId: "DEAL-003",
        customerName: "顧客C",
        dealStatus: "初期接触",
        invoiceIssuanceStatus: "未発行",
        dealAmount: 150000,
        expectedInvoiceDate: "2024-02-28",
      },
    ];

    const result = validateMigrationDataConsistency(migrationData);

    expect(result.isConsistent).toBe(true);
    expect(result.discrepancyCount).toBe(0);
    expect(result.discrepancyDetails).toHaveLength(0);
  });

  test("複数の照合ズレが存在する場合、すべてのズレレコードが検出され照合ズレレポートに記録される", () => {
    const migrationData = [
      {
        dealId: "DEAL-001",
        customerName: "顧客A",
        dealStatus: "成約",
        invoiceIssuanceStatus: "未発行",
        dealAmount: 100000,
        expectedInvoiceDate: "2024-01-31",
      },
      {
        dealId: "DEAL-002",
        customerName: "顧客B",
        dealStatus: "成約",
        invoiceIssuanceStatus: "未発行",
        dealAmount: 200000,
        expectedInvoiceDate: "2024-01-31",
      },
      {
        dealId: "DEAL-003",
        customerName: "顧客C",
        dealStatus: "完了",
        invoiceIssuanceStatus: "未発行",
        dealAmount: 150000,
        expectedInvoiceDate: "2024-02-28",
      },
    ];

    const result = validateMigrationDataConsistency(migrationData);

    expect(result.isConsistent).toBe(false);
    expect(result.discrepancyCount).toBe(3);
    expect(result.discrepancyDetails).toHaveLength(3);
    expect(result.discrepancyDetails[0].dealId).toBe("DEAL-001");
    expect(result.discrepancyDetails[1].dealId).toBe("DEAL-002");
    expect(result.discrepancyDetails[2].dealId).toBe("DEAL-003");
  });

  test("空のマイグレーションデータが入力された場合、例外がスロウされる", () => {
    const migrationData: typeof migrationData = [];

    expect(() => validateMigrationDataConsistency(migrationData)).toThrow(
      /マイグレーションデータ/
    );
  });

  test("必須フィールドが不足しているデータレコードが入力された場合、データ検証エラーが発生する", () => {
    const migrationData = [
      {
        dealId: "DEAL-001",
        customerName: "顧客A",
        dealStatus: "成約",
        // invoiceIssuanceStatus 欠落
        dealAmount: 100000,
        expectedInvoiceDate: "2024-01-31",
      },
    ];

    expect(() =>
      validateMigrationDataConsistency(migrationData as any)
    ).toThrow(/必須フィールド/);
  });
});