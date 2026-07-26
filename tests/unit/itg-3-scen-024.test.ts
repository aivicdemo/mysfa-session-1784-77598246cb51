import {
  aggregateLicenseCostsByEdition,
} from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce ライセンス利用状況の可視化機能 - ライセンス費用集計", () => {
  // SCEN-024
  test("複数エディションのライセンス契約から正確な費用総額が集計される", () => {
    // Arrange: 複数エディションのライセンス契約データを準備
    const license_contracts = [
      {
        id: "contract_001",
        edition_id: "edition_sales_cloud",
        edition_name: "Sales Cloud",
        license_count: 10,
        unit_price: 165,
        contract_start_date: "2024-01-01",
        contract_end_date: "2024-12-31",
      },
      {
        id: "contract_002",
        edition_id: "edition_service_cloud",
        edition_name: "Service Cloud",
        license_count: 5,
        unit_price: 165,
        contract_start_date: "2024-01-01",
        contract_end_date: "2024-12-31",
      },
      {
        id: "contract_003",
        edition_id: "edition_platform",
        edition_name: "Platform",
        license_count: 3,
        unit_price: 80,
        contract_start_date: "2024-01-01",
        contract_end_date: "2024-12-31",
      },
    ];

    // Act: ライセンス費用集計機能を実行
    const result = aggregateLicenseCostsByEdition(license_contracts);

    // Assert: 費用総額の検証
    // Sales Cloud: 10 * 165 = 1,650
    // Service Cloud: 5 * 165 = 825
    // Platform: 3 * 80 = 240
    // 合計: 1,650 + 825 + 240 = 2,715
    const expected_total_cost = 2715;
    expect(result.total_cost).toBe(expected_total_cost);

    // Assert: エディション別費用内訳の検証
    expect(result.breakdown).toEqual(
      expect.arrayContaining([
        {
          edition_id: "edition_sales_cloud",
          edition_name: "Sales Cloud",
          license_count: 10,
          unit_price: 165,
          subtotal_cost: 1650,
        },
        {
          edition_id: "edition_service_cloud",
          edition_name: "Service Cloud",
          license_count: 5,
          unit_price: 165,
          subtotal_cost: 825,
        },
        {
          edition_id: "edition_platform",
          edition_name: "Platform",
          license_count: 3,
          unit_price: 80,
          subtotal_cost: 240,
        },
      ])
    );

    // Assert: 内訳要素数の検証
    expect(result.breakdown).toHaveLength(3);

    // Assert: 各エディション別の費用計算が正確か検証
    result.breakdown.forEach((item) => {
      expect(item.subtotal_cost).toBe(item.license_count * item.unit_price);
    });

    // Assert: 内訳の合計が総額と一致するか検証
    const breakdown_sum = result.breakdown.reduce(
      (sum, item) => sum + item.subtotal_cost,
      0
    );
    expect(breakdown_sum).toBe(result.total_cost);
  });
});