import { fetchDealAndActivityRecords } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-150
  test("商談・活動記録の時系列ソート表示機能 - 商談と活動記録が最新順にソートされ直近100件まで正しく表示される", async () => {
    const userId = "user_001";
    const customerId = "cust_001";

    // テストデータ: 過去6ヶ月間にわたる商談記録と活動記録を準備
    // 古い順に日時を生成（後で期待値と照合するため）
    const generateRecords = () => {
      const records = [];
      const baseDate = new Date("2024-01-01T09:00:00Z");

      // 150件の商談記録と150件の活動記録を生成（計300件）
      for (let i = 0; i < 150; i++) {
        const dealDate = new Date(
          baseDate.getTime() + i * 24 * 60 * 60 * 1000
        );
        records.push({
          id: `deal_${String(i).padStart(3, "0")}`,
          type: "deal",
          customerId: customerId,
          createdAt: dealDate.toISOString(),
          title: `商談 ${i + 1}`,
          amount: 100000 + i * 1000,
          status: "negotiation",
        });
      }

      for (let i = 0; i < 150; i++) {
        const activityDate = new Date(
          baseDate.getTime() + i * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000
        );
        records.push({
          id: `activity_${String(i).padStart(3, "0")}`,
          type: "activity",
          customerId: customerId,
          createdAt: activityDate.toISOString(),
          activityType: "email",
          description: `活動記録 ${i + 1}`,
        });
      }

      return records;
    };

    const mockRecords = generateRecords();

    // API レスポンスのモック
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        data: mockRecords,
      }),
      { status: 200 }
    );

    // 関数を実行（ユーザーID、顧客ID、ソート順序を指定）
    const result = await fetchDealAndActivityRecords(
      userId,
      customerId,
      "newest"
    );

    // 結果の検証
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);

    // 直近100件までの表示を確認
    expect(result.data.length).toBe(100);

    // 最新順（新しい順・降順）にソートされているか確認
    for (let i = 0; i < result.data.length - 1; i++) {
      const currentDate = new Date(result.data[i].createdAt);
      const nextDate = new Date(result.data[i + 1].createdAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }

    // 最初の10件の日時を確認（新しい順であることを検証）
    const firstTenDates = result.data.slice(0, 10).map((r) => r.createdAt);
    for (let i = 0; i < 9; i++) {
      const current = new Date(firstTenDates[i]);
      const next = new Date(firstTenDates[i + 1]);
      expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
    }

    // 最後に表示されている記録が100件目であることを確認
    const lastRecordIndex = 99; // 0ベースなので99が100件目
    expect(result.data[lastRecordIndex]).toBeDefined();

    // 101件目以降の記録が返されていないことを確認
    expect(result.data.length).toBeLessThanOrEqual(100);

    // 記録に商談と活動記録の両方が含まれていることを確認
    const hasDeals = result.data.some((r) => r.type === "deal");
    const hasActivities = result.data.some((r) => r.type === "activity");
    expect(hasDeals).toBe(true);
    expect(hasActivities).toBe(true);

    // ページリロード後の表示順序が変わらないことを確認するため、
    // 同じパラメータで再度リクエストを実行
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        data: mockRecords,
      }),
      { status: 200 }
    );

    const resultAfterReload = await fetchDealAndActivityRecords(
      userId,
      customerId,
      "newest"
    );

    // リロード前後で表示順序が一致していることを確認
    expect(resultAfterReload.data.length).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(resultAfterReload.data[i].id).toBe(result.data[i].id);
      expect(resultAfterReload.data[i].createdAt).toBe(result.data[i].createdAt);
    }

    // 商談と活動記録の正確な情報が保持されていることを確認
    const dealRecordsInResult = result.data.filter((r) => r.type === "deal");
    const activityRecordsInResult = result.data.filter(
      (r) => r.type === "activity"
    );

    if (dealRecordsInResult.length > 0) {
      expect(dealRecordsInResult[0]).toHaveProperty("amount");
      expect(dealRecordsInResult[0]).toHaveProperty("status");
    }

    if (activityRecordsInResult.length > 0) {
      expect(activityRecordsInResult[0]).toHaveProperty("activityType");
      expect(activityRecordsInResult[0]).toHaveProperty("description");
    }
  });
});