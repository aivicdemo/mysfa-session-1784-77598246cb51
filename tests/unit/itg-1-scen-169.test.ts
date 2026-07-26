import { detectBillingDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-169
  test("商談レコードが存在しない場合でも処理が失敗せず空リストを返す", () => {
    const deals = [];

    const result = detectBillingDiscrepancies(deals);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});