import { detectDelayedDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-569
  test("請求予定日を超過した案件が0件のとき遅延案件リストは空のままである", () => {
    const today = new Date("2024-04-15T00:00:00Z");
    const testDeals = [];

    const result = detectDelayedDeals(testDeals, today);

    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});