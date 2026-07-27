import { calculateBusinessDayStartFromDeadline } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-713: 月次決算期限が日曜日の場合、営業日計算は金曜日から数える", () => {
    // 月次決算期限を日曜日に設定（2024年1月7日は日曜日）
    const decisionDeadline = new Date("2024-01-07T00:00:00Z");
    
    // 営業日計算ロジックを呼び出し
    const businessDayStart = calculateBusinessDayStartFromDeadline(decisionDeadline);
    
    // 計算結果が2024年1月5日（金曜日）であることを検証
    const expectedBusinessDayStart = new Date("2024-01-05T00:00:00Z");
    expect(businessDayStart.toISOString().split("T")[0]).toBe(
      expectedBusinessDayStart.toISOString().split("T")[0]
    );
    
    // 計算結果の曜日を確認し、getDay()が5（金曜日）であることをアサート
    // getDay(): 0=日, 1=月, 2=火, 3=水, 4=木, 5=金, 6=土
    expect(businessDayStart.getDay()).toBe(5);
  });
});