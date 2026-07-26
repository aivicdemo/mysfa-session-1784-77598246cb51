import { detectUnbilledCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-166: 商談ステータスが『受注』で請求書未発行の案件を『未請求案件』として正しく特定できる
  test("商談ステータスが『受注』かつ請求書未発行の案件のみを未請求案件として検出する", () => {
    // 準備: テストデータとして商談ステータスが『受注』の案件を3件以上、
    // うち2件は請求書未発行、1件は請求書発行済みとして設定
    const deals = [
      {
        dealId: "DEAL001",
        dealStatus: "受注",
        billingStatus: "未発行",
        amount: 100000,
        customerId: "CUST001",
        dealDate: "2024-01-15",
      },
      {
        dealId: "DEAL002",
        dealStatus: "受注",
        billingStatus: "未発行",
        amount: 150000,
        customerId: "CUST002",
        dealDate: "2024-01-16",
      },
      {
        dealId: "DEAL003",
        dealStatus: "受注",
        billingStatus: "発行済み",
        amount: 200000,
        customerId: "CUST003",
        dealDate: "2024-01-17",
      },
    ];

    // 実行: 『未請求案件検出』機能を実行
    const result = detectUnbilledCases(deals);

    // 検証1: 検出された案件の件数が2件であることを確認
    expect(result.unbilledCases.length).toBe(2);

    // 検証2: 検出結果に含まれるのはDEAL001とDEAL002のみであることを確認
    const detectedDealIds = result.unbilledCases.map((c) => c.dealId);
    expect(detectedDealIds).toContain("DEAL001");
    expect(detectedDealIds).toContain("DEAL002");
    expect(detectedDealIds).not.toContain("DEAL003");

    // 検証3: 検出された各案件の商談ステータスが『受注』であることを確認
    result.unbilledCases.forEach((unbilled) => {
      expect(unbilled.dealStatus).toBe("受注");
    });

    // 検証4: 検出された各案件の請求書発行状況が『未発行』であることを確認
    result.unbilledCases.forEach((unbilled) => {
      expect(unbilled.billingStatus).toBe("未発行");
    });

    // 検証5: DEAL003（請求書発行済み）は検出結果に含まれていないことを確認
    const deal003Found = result.unbilledCases.find((c) => c.dealId === "DEAL003");
    expect(deal003Found).toBeUndefined();

    // 検証6: 検出結果に含まれる案件の詳細情報が正確であることを確認
    const deal001 = result.unbilledCases.find((c) => c.dealId === "DEAL001");
    expect(deal001).toEqual({
      dealId: "DEAL001",
      dealStatus: "受注",
      billingStatus: "未発行",
      amount: 100000,
      customerId: "CUST001",
      dealDate: "2024-01-15",
    });

    const deal002 = result.unbilledCases.find((c) => c.dealId === "DEAL002");
    expect(deal002).toEqual({
      dealId: "DEAL002",
      dealStatus: "受注",
      billingStatus: "未発行",
      amount: 150000,
      customerId: "CUST002",
      dealDate: "2024-01-16",
    });

    // 検証7: CSVエクスポート用のデータが正確に生成されていることを確認
    expect(result.csvExportData).toBeDefined();
    expect(result.csvExportData.length).toBe(2);
    expect(result.csvExportData[0]).toContain("DEAL001");
    expect(result.csvExportData[1]).toContain("DEAL002");

    // 検証8: 合計未請求金額が正確に計算されていることを確認（100000 + 150000 = 250000）
    expect(result.totalUnbilledAmount).toBe(250000);
  });
});