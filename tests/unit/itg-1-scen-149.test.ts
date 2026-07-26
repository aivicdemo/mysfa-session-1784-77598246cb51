import { filterPurchaseHistoryByDateRange } from "../../src/logic/it-1";

describe("顧客レコード画面の過去購買履歴フィルタリング機能", () => {
  // SCEN-149
  test("対象期間の境界日時における購買履歴の包含判定が正確に処理される", () => {
    // 期間設定: 2024年1月1日00:00:00 ～ 2024年12月31日23:59:59
    const periodStartDate = new Date("2024-01-01T00:00:00Z");
    const periodEndDate = new Date("2024-12-31T23:59:59Z");

    // テスト用の購買履歴データ
    // 開始日時境界内（期待: 含める）
    const purchaseAtStartBoundary = new Date("2024-01-01T00:00:00Z");
    // 終了日時境界内（期待: 含める）
    const purchaseAtEndBoundary = new Date("2024-12-31T23:59:59Z");
    // 期間外 - 1秒前（期待: 除外する）
    const purchaseBeforeStart = new Date("2023-12-31T23:59:59Z");
    // 期間外 - 1秒後（期待: 除外する）
    const purchaseAfterEnd = new Date("2025-01-01T00:00:00Z");

    const purchaseHistory = [
      {
        id: "purchase_1",
        customerId: "customer_001",
        purchaseDate: purchaseAtStartBoundary,
        amount: 50000,
        description: "境界日時スタート",
      },
      {
        id: "purchase_2",
        customerId: "customer_001",
        purchaseDate: purchaseAtEndBoundary,
        amount: 75000,
        description: "境界日時エンド",
      },
      {
        id: "purchase_3",
        customerId: "customer_001",
        purchaseDate: purchaseBeforeStart,
        amount: 30000,
        description: "範囲外（開始前）",
      },
      {
        id: "purchase_4",
        customerId: "customer_001",
        purchaseDate: purchaseAfterEnd,
        amount: 45000,
        description: "範囲外（終了後）",
      },
    ];

    // フィルタリング処理の実行
    const filteredResult = filterPurchaseHistoryByDateRange({
      purchaseHistory: purchaseHistory,
      startDate: periodStartDate,
      endDate: periodEndDate,
    });

    // 期待結果の検証
    // 1. フィルタリング結果に含まれるべき件数は 2 件（開始日時と終了日時の境界内）
    expect(filteredResult.length).toBe(2);

    // 2. 開始日時（2024年1月1日00:00:00）の購買履歴が含まれていることを確認
    const resultIds = filteredResult.map((item: any) => item.id);
    expect(resultIds).toContain("purchase_1");
    expect(resultIds).not.toContain("purchase_3");

    // 3. 終了日時（2024年12月31日23:59:59）の購買履歴が含まれていることを確認
    expect(resultIds).toContain("purchase_2");

    // 4. 期間外の購買履歴（2023年12月31日23:59:59）が除外されていることを確認
    expect(resultIds).not.toContain("purchase_3");

    // 5. 期間外の購買履歴（2025年1月1日00:00:00）が除外されていることを確認
    expect(resultIds).not.toContain("purchase_4");

    // 6. 返却データの完全性検証
    const includedRecords = filteredResult.filter(
      (item: any) =>
        item.purchaseDate >= periodStartDate &&
        item.purchaseDate <= periodEndDate
    );
    expect(includedRecords.length).toBe(2);

    // 7. 個別の購買履歴の詳細情報が正確に保持されていることを確認
    const startBoundaryRecord = filteredResult.find(
      (item: any) => item.id === "purchase_1"
    );
    expect(startBoundaryRecord).toEqual({
      id: "purchase_1",
      customerId: "customer_001",
      purchaseDate: purchaseAtStartBoundary,
      amount: 50000,
      description: "境界日時スタート",
    });

    const endBoundaryRecord = filteredResult.find(
      (item: any) => item.id === "purchase_2"
    );
    expect(endBoundaryRecord).toEqual({
      id: "purchase_2",
      customerId: "customer_001",
      purchaseDate: purchaseAtEndBoundary,
      amount: 75000,
      description: "境界日時エンド",
    });

    // 8. フィルタリング結果がソート状態を保有していることを確認（新しい順）
    const sortedRecords = filteredResult.sort(
      (a: any, b: any) =>
        new Date(b.purchaseDate).getTime() -
        new Date(a.purchaseDate).getTime()
    );
    expect(filteredResult).toEqual(sortedRecords);
  });
});