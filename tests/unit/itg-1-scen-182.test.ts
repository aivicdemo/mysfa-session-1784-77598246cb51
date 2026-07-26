import { searchCustomerRecords } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-182
  test("SQL インジェクション攻撃文字列が入力された場合、適切にエスケープ・サニタイズされて処理される", () => {
    // SQL インジェクション攻撃 1: ' OR '1'='1
    const sqlInjectionPayload1 = "' OR '1'='1";
    const result1 = searchCustomerRecords({
      searchQuery: sqlInjectionPayload1,
      searchType: "customer_name",
    });

    // 不正なSQLが実行されず、0件または安全な結果が返されることを検証
    expect(Array.isArray(result1.records)).toBe(true);
    expect(result1.records.length).toBe(0);
    expect(result1.isSuccessful).toBe(true);
    expect(result1.sanitized).toBe(true);

    // SQL インジェクション攻撃 2: '; DROP TABLE customers; --
    const sqlInjectionPayload2 = "'; DROP TABLE customers; --";
    const result2 = searchCustomerRecords({
      searchQuery: sqlInjectionPayload2,
      searchType: "customer_id",
    });

    // テーブルが削除されず、安全に処理されることを検証
    expect(Array.isArray(result2.records)).toBe(true);
    expect(result2.records.length).toBe(0);
    expect(result2.isSuccessful).toBe(true);
    expect(result2.sanitized).toBe(true);

    // XSS 攻撃ペイロード: <script>alert('XSS')</script>
    const xssPayload = "<script>alert('XSS')</script>";
    const result3 = searchCustomerRecords({
      searchQuery: xssPayload,
      searchType: "customer_name",
    });

    // XSS スクリプトがそのまま実行されず、エスケープされることを検証
    expect(Array.isArray(result3.records)).toBe(true);
    expect(result3.records.length).toBe(0);
    expect(result3.isSuccessful).toBe(true);
    expect(result3.sanitized).toBe(true);

    // エラーログに入力値がそのまま出力されないことを検証
    expect(result1.errorLog).not.toContain(sqlInjectionPayload1);
    expect(result2.errorLog).not.toContain(sqlInjectionPayload2);
    expect(result3.errorLog).not.toContain(xssPayload);

    // 複数の攻撃ペイロードが検出された場合の統合テスト
    const combinedPayload = sqlInjectionPayload1 + " " + sqlInjectionPayload2;
    const resultCombined = searchCustomerRecords({
      searchQuery: combinedPayload,
      searchType: "customer_name",
    });

    expect(Array.isArray(resultCombined.records)).toBe(true);
    expect(resultCombined.records.length).toBe(0);
    expect(resultCombined.isSuccessful).toBe(true);
    expect(resultCombined.sanitized).toBe(true);
    expect(resultCombined.errorLog).not.toContain(combinedPayload);
  });
});