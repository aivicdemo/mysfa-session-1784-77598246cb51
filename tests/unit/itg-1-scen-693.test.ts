import { detectUnissuedDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-693
  test("月次決算期限3営業日前に照合開始時、請求書データが存在しない商談は未請求として検出される", () => {
    // テスト実行日時: 決算期限の3営業日前（例：決算期限が2024-04-30の場合、2024-04-25（木）=3営業日前）
    const settlementDeadline = new Date("2024-04-30T00:00:00Z");
    const threeBusinessDaysBeforeDeadline = new Date("2024-04-25T09:00:00Z");

    // スタブ: DocumentStorageAdapter - いかなるメソッドも呼び出されないよう仕様
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // 商談データベースに登録する商談
    const dealData = {
      deal_id: "DEAL-001",
      customer_name: "テスト顧客A",
      status: "成約",
      amount: 100000,
      conclusion_date: new Date("2024-04-15T00:00:00Z"), // 決算期限の10営業日前
    };

    // 請求書テーブルは空（DEAL-001に対応する請求書が存在しない）
    const invoiceData: typeof dealData[] = [];

    // 検出結果の期待値
    const expectedDiscrepancyRecord = {
      deal_id: "DEAL-001",
      discrepancy_type: "未請求",
      status: "検出待ち",
      detection_datetime: threeBusinessDaysBeforeDeadline,
      remarks:
        "商談ステータスは成約だが、対応する請求書データが存在しません。請求書の発行確認が必要です",
    };

    // 照合・ズレ検出機能を実行
    const discrepancyRecords = detectUnissuedDeals(
      {
        deals: [dealData],
        invoices: invoiceData,
        settlementDeadline: settlementDeadline,
        checkDateTime: threeBusinessDaysBeforeDeadline,
      },
      documentStorageAdapterStub
    );

    // 不整合レコードテーブルから DEAL-001 に対応するレコードを取得・検証
    expect(discrepancyRecords).toHaveLength(1);
    expect(discrepancyRecords[0]).toEqual(expectedDiscrepancyRecord);

    // DocumentStorageAdapter のいかなるメソッドも呼び出されていないことを検証
    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.generateShareLink).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.deleteDocument).not.toHaveBeenCalled();
  });
});