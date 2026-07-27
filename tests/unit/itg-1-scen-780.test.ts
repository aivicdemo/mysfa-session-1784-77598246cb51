import { extractInvoiceTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-780: [error] 請求対象データ抽出機能 - 期間終了日条件が空のとき、エラーが発生する
  test("期間終了日が空の場合、エラーが発生し、データ抽出は実行されない", () => {
    const extractionParams = {
      startDate: "2024-01-01",
      endDate: "",
      status: "contract",
    };

    expect(() => extractInvoiceTargetData(extractionParams)).toThrow(
      /期間終了日/
    );
  });
});