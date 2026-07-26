import { searchCustomers } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-145: [edge] 顧客検索機能 - 検索入力に特殊文字が含まれる場合にサニタイズされて検索される
  test("特殊文字を含む検索入力がサニタイズされ、セキュリティ脅威が防止される", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    // XSS ペイロード
    const xssPayload = "<script>alert(1)</script>";
    // SQL インジェクション ペイロード
    const sqlInjectionPayload = "'; DROP TABLE customers--";
    // SQL ワイルドカード
    const wildcardPayload = "%";

    // 検索実行時のネットワークリクエストをモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        data: [],
        message: "該当する顧客が見つかりません",
      }),
      { status: 200 }
    );

    // XSS ペイロード検索実行
    const resultXss = await searchCustomers({ searchValue: xssPayload });

    // リクエストパラメータを確認
    const callArgsXss = fetchMock.mock.calls[0];
    const urlXss = new URL(callArgsXss[0]);
    const searchParamXss = urlXss.searchParams.get("q");

    // XSS ペイロードが HTMLエンコードされていることを確認
    expect(searchParamXss).not.toContain("<script>");
    expect(searchParamXss).toMatch(/&lt;|&#/);
    expect(resultXss.success).toBe(true);
    expect(Array.isArray(resultXss.data)).toBe(true);

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        data: [],
        message: "該当する顧客が見つかりません",
      }),
      { status: 200 }
    );

    // SQL インジェクション ペイロード検索実行
    const resultSql = await searchCustomers({
      searchValue: sqlInjectionPayload,
    });

    const callArgsSql = fetchMock.mock.calls[0];
    const urlSql = new URL(callArgsSql[0]);
    const searchParamSql = urlSql.searchParams.get("q");

    // SQL インジェクション文字列がエスケープされていることを確認
    expect(searchParamSql).not.toContain("DROP TABLE");
    expect(searchParamSql).toMatch(/\\|%27|&#/);
    expect(resultSql.success).toBe(true);
    expect(Array.isArray(resultSql.data)).toBe(true);

    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        data: [],
        message: "該当する顧客が見つかりません",
      }),
      { status: 200 }
    );

    // ワイルドカード検索実行
    const resultWildcard = await searchCustomers({ searchValue: wildcardPayload });

    const callArgsWildcard = fetchMock.mock.calls[0];
    const urlWildcard = new URL(callArgsWildcard[0]);
    const searchParamWildcard = urlWildcard.searchParams.get("q");

    // ワイルドカード文字が適切にエスケープされていることを確認
    expect(searchParamWildcard).toBeDefined();
    // % が URL エンコードされて %25 になるか、SQL エスケープされることを確認
    expect(searchParamWildcard).toMatch(/%25|\\%/);
    expect(resultWildcard.success).toBe(true);
    expect(Array.isArray(resultWildcard.data)).toBe(true);

    fetchMock.disableMocks();
  });
});