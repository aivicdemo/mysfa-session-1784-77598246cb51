import { generateMonthlyReportWithDetails } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 月次営業成績報告書生成機能", () => {
  // SCEN-045
  test("月次営業成績報告書が生成され、売上・件数・進捗率・顧客別詳細の全必須項目が統一フォーマットで含まれている", () => {
    // 前提: 営業担当者が月次報告画面にアクセスし、対象月を設定した状態
    const targetMonth = "2024-01";
    const salesData = [
      {
        dealId: "DEAL-001",
        customerId: "CUST-A",
        customerName: "株式会社A",
        salesAmount: 5000000,
        dealStatus: "受注",
        invoiceIssuedDate: "2024-01-15",
      },
      {
        dealId: "DEAL-002",
        customerId: "CUST-A",
        customerName: "株式会社A",
        salesAmount: 3000000,
        dealStatus: "受注",
        invoiceIssuedDate: "2024-01-20",
      },
      {
        dealId: "DEAL-003",
        customerId: "CUST-B",
        customerName: "株式会社B",
        salesAmount: 2500000,
        dealStatus: "受注",
        invoiceIssuedDate: "2024-01-25",
      },
      {
        dealId: "DEAL-004",
        customerId: "CUST-B",
        customerName: "株式会社B",
        salesAmount: 1500000,
        dealStatus: "商談中",
        invoiceIssuedDate: null,
      },
    ];

    const result = generateMonthlyReportWithDetails(targetMonth, salesData);

    // 期待値の計算
    // 売上: 受注ステータスの合計 = 5000000 + 3000000 + 2500000 = 10500000
    const expectedTotalSales = 10500000;
    // 件数: 受注ステータスの案件数 = 3
    const expectedDealCount = 3;
    // 進捗率: 受注件数 / 全件数 * 100 = 3 / 4 * 100 = 75.0
    const expectedProgressRate = 75.0;

    // レポート全体の型チェック
    expect(result).toHaveProperty("reportId");
    expect(result).toHaveProperty("month");
    expect(result).toHaveProperty("generatedDate");
    expect(result).toHaveProperty("totalSales");
    expect(result).toHaveProperty("dealCount");
    expect(result).toHaveProperty("progressRate");
    expect(result).toHaveProperty("customerDetails");
    expect(result).toHaveProperty("format");

    // 必須項目: 売上
    expect(result.totalSales).toBe(expectedTotalSales);
    expect(typeof result.totalSales).toBe("number");

    // 必須項目: 件数
    expect(result.dealCount).toBe(expectedDealCount);
    expect(typeof result.dealCount).toBe("number");

    // 必須項目: 進捗率
    expect(result.progressRate).toBe(expectedProgressRate);
    expect(typeof result.progressRate).toBe("number");

    // 必須項目: 顧客別詳細
    expect(Array.isArray(result.customerDetails)).toBe(true);
    expect(result.customerDetails.length).toBe(2);

    // 顧客別詳細の検証 - 株式会社A
    const customerADetail = result.customerDetails[0];
    expect(customerADetail.customerId).toBe("CUST-A");
    expect(customerADetail.customerName).toBe("株式会社A");
    expect(customerADetail.totalSales).toBe(8000000);
    expect(customerADetail.dealCount).toBe(2);
    expect(customerADetail.progressRate).toBe(100.0);

    // 顧客別詳細の検証 - 株式会社B
    const customerBDetail = result.customerDetails[1];
    expect(customerBDetail.customerId).toBe("CUST-B");
    expect(customerBDetail.customerName).toBe("株式会社B");
    expect(customerBDetail.totalSales).toBe(2500000);
    expect(customerBDetail.dealCount).toBe(1);
    expect(customerBDetail.progressRate).toBe(50.0);

    // 統一フォーマット: データ型の一貫性
    expect(typeof result.month).toBe("string");
    expect(result.month).toMatch(/^\d{4}-\d{2}$/);

    expect(typeof result.generatedDate).toBe("string");
    expect(result.generatedDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    expect(result.format).toHaveProperty("currencyUnit");
    expect(result.format).toHaveProperty("decimalPlaces");
    expect(result.format).toHaveProperty("dateFormat");

    expect(result.format.currencyUnit).toBe("JPY");
    expect(result.format.decimalPlaces).toBe(0);
    expect(result.format.dateFormat).toBe("YYYY-MM-DD");

    // 顧客別詳細のフォーマット一貫性
    result.customerDetails.forEach((detail) => {
      expect(typeof detail.customerId).toBe("string");
      expect(typeof detail.customerName).toBe("string");
      expect(typeof detail.totalSales).toBe("number");
      expect(typeof detail.dealCount).toBe("number");
      expect(typeof detail.progressRate).toBe("number");
      expect(detail.progressRate).toBeGreaterThanOrEqual(0);
      expect(detail.progressRate).toBeLessThanOrEqual(100);
    });

    // 複数月レポートでのフォーマット一貫性確認
    const secondMonthData = [
      {
        dealId: "DEAL-005",
        customerId: "CUST-C",
        customerName: "株式会社C",
        salesAmount: 4000000,
        dealStatus: "受注",
        invoiceIssuedDate: "2024-02-10",
      },
      {
        dealId: "DEAL-006",
        customerId: "CUST-C",
        customerName: "株式会社C",
        salesAmount: 2000000,
        dealStatus: "受注",
        invoiceIssuedDate: "2024-02-15",
      },
    ];

    const secondResult = generateMonthlyReportWithDetails("2024-02", secondMonthData);

    // 第二次生成でのフォーマット一貫性
    expect(secondResult).toHaveProperty("reportId");
    expect(secondResult).toHaveProperty("month");
    expect(secondResult).toHaveProperty("generatedDate");
    expect(secondResult).toHaveProperty("totalSales");
    expect(secondResult).toHaveProperty("dealCount");
    expect(secondResult).toHaveProperty("progressRate");
    expect(secondResult).toHaveProperty("customerDetails");
    expect(secondResult).toHaveProperty("format");

    // 第二次レポートの必須項目値検証
    expect(secondResult.totalSales).toBe(6000000);
    expect(secondResult.dealCount).toBe(2);
    expect(secondResult.progressRate).toBe(100.0);

    // 第二次レポートのフォーマット統一性
    expect(secondResult.format.currencyUnit).toBe("JPY");
    expect(secondResult.format.decimalPlaces).toBe(0);
    expect(secondResult.format.dateFormat).toBe("YYYY-MM-DD");
    expect(typeof secondResult.generatedDate).toBe("string");
    expect(secondResult.generatedDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // 両レポート間でのフォーマット一貫性
    expect(result.format.currencyUnit).toBe(secondResult.format.currencyUnit);
    expect(result.format.decimalPlaces).toBe(secondResult.format.decimalPlaces);
    expect(result.format.dateFormat).toBe(secondResult.format.dateFormat);
  });
});