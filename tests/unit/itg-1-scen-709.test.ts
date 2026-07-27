import { calculateBusinessDaysBefore } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-709
  test("営業日計算ロジック - 月次決算期限から2営業日前を算出する場合、土日祝日を正しくスキップして計算される", () => {
    // Arrange: 月次決算期限を2024年1月31日（水曜日）として設定
    const targetDate = new Date("2024-01-31T00:00:00Z");

    // 祝日マスタ: 2024年1月29日（月）を成人の日として登録
    const holidays = [new Date("2024-01-29T00:00:00Z")];

    // Act: calculateBusinessDaysBefore(targetDate: 2024-01-31, daysCount: 2)を呼び出す
    const result = calculateBusinessDaysBefore(targetDate, 2, holidays);

    // Assert: 戻り値は2024年1月25日（木曜日）である
    const expectedDate = new Date("2024-01-25T00:00:00Z");
    expect(result).toEqual(expectedDate);

    // 計算ロジックが以下の順序で土日祝日をスキップしたことを確認：
    // 2024年1月31日（水）から遡る
    // → 1月30日（火）を1営業日前としてカウント
    // → 1月29日（月、成人の日）をスキップ
    // → 1月28日（日）をスキップ
    // → 1月27日（土）をスキップ
    // → 1月26日（金）を2営業日前としてカウント
    // → さらに1営業日前として1月25日（木）を返す
  });
});