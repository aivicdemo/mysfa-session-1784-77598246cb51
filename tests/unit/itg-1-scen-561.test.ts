import { detectDiscrepanciesBetweenDealStatusAndInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-561
  test("ステータスが『受注』と前後に空白を含む場合条件に該当しない", () => {
    // Arrange: テストデータを準備
    // 商談レコード: ステータス『 受注 』（前後に全角スペース各1文字を含む）
    const dealRecords = [
      {
        dealId: "DEAL-001",
        dealStatus: " 受注 ",
        dealAmount: 100000,
        dealDate: "2024-04-15",
      },
    ];

    // 請求書レコード: ステータス『未発行』
    const invoiceRecords = [
      {
        invoiceId: "INV-001",
        dealId: "DEAL-001",
        invoiceStatus: "未発行",
        invoiceAmount: 100000,
        invoiceDate: null,
      },
    ];

    // Act: 照合機能を実行
    const discrepancyLog = detectDiscrepanciesBetweenDealStatusAndInvoice(
      dealRecords,
      invoiceRecords
    );

    // Assert: ズレ検出ログに当該商談レコードの記録が存在しないことを確認
    // 『 受注 』（前後の空白を含む）は『受注』（空白なし）に該当しないため、
    // ズレ検出ログには記録されないはず
    const matchingDiscrepancies = discrepancyLog.filter(
      (log: { dealId: string }) => log.dealId === "DEAL-001"
    );

    expect(matchingDiscrepancies).toHaveLength(0);
  });
});