import { generateMonthlySettlementReport } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-344
  test("月次決算レポート生成機能 - 請求書ステータスが『未発行』のとき、請求金額ではなく未請求額として集計される", () => {
    const targetMonth = "2024-04";
    const salesTransactions = [
      {
        transactionId: "取引ID-001",
        productName: "商品A",
        amount: 100000,
        invoiceStatus: "未発行",
        transactionDate: "2024-04-15",
      },
      {
        transactionId: "取引ID-002",
        productName: "商品B",
        amount: 50000,
        invoiceStatus: "発行済",
        transactionDate: "2024-04-20",
      },
    ];

    const report = generateMonthlySettlementReport(targetMonth, salesTransactions);

    expect(report.targetMonth).toBe("2024-04");
    expect(report.unissuedAmount).toBe(100000);
    expect(report.issuedAmount).toBe(50000);
    expect(report.totalAmount).toBe(150000);
    expect(report.transactions).toHaveLength(2);
    expect(report.transactions[0].transactionId).toBe("取引ID-001");
    expect(report.transactions[0].invoiceStatus).toBe("未発行");
    expect(report.transactions[1].transactionId).toBe("取引ID-002");
    expect(report.transactions[1].invoiceStatus).toBe("発行済");
  });
});