import { extractSalesData } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-120
  test("月次報告期限・データ抽出処理 - 同じ入力条件でデータ抽出を2回実行した場合、同じ結果が返される", () => {
    // テスト用データ：月次報告期限2024年1月31日、営業担当者A、顧客X社の売上データ（件数3件、合計金額150万円）
    const test_sales_records = [
      {
        id: "deal_001",
        sales_person: "営業担当者A",
        customer_id: "cust_X",
        customer_name: "顧客X社",
        amount: 500000,
        date: "2024-01-15",
      },
      {
        id: "deal_002",
        sales_person: "営業担当者A",
        customer_id: "cust_X",
        customer_name: "顧客X社",
        amount: 300000,
        date: "2024-01-20",
      },
      {
        id: "deal_003",
        sales_person: "営業担当者A",
        customer_id: "cust_X",
        customer_name: "顧客X社",
        amount: 700000,
        date: "2024-01-25",
      },
    ];

    // スタブデータベース：同じ結果セットを返す
    const stub_database = {
      query: jest.fn(() => test_sales_records),
    };

    // 入力条件
    const extraction_params = {
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      sales_person: "営業担当者A",
      customer_filter: "cust_X",
      output_format: "json",
    };

    // 第1回目の実行
    const result_first = extractSalesData(extraction_params, stub_database);

    // 第1回目の結果を確認
    expect(result_first.extraction_count).toBe(3);
    expect(result_first.total_amount).toBe(1500000);
    expect(result_first.data).toHaveLength(3);
    expect(result_first.data[0]).toEqual({
      id: "deal_001",
      sales_person: "営業担当者A",
      customer_id: "cust_X",
      customer_name: "顧客X社",
      amount: 500000,
      date: "2024-01-15",
    });
    expect(result_first.data[1]).toEqual({
      id: "deal_002",
      sales_person: "営業担当者A",
      customer_id: "cust_X",
      customer_name: "顧客X社",
      amount: 300000,
      date: "2024-01-20",
    });
    expect(result_first.data[2]).toEqual({
      id: "deal_003",
      sales_person: "営業担当者A",
      customer_id: "cust_X",
      customer_name: "顧客X社",
      amount: 700000,
      date: "2024-01-25",
    });
    expect(result_first.schema).toHaveProperty("type", "object");

    // 第2回目の実行（同じ入力条件）
    const result_second = extractSalesData(extraction_params, stub_database);

    // 第2回目の結果を確認
    expect(result_second.extraction_count).toBe(3);
    expect(result_second.total_amount).toBe(1500000);
    expect(result_second.data).toHaveLength(3);
    expect(result_second.data[0]).toEqual({
      id: "deal_001",
      sales_person: "営業担当者A",
      customer_id: "cust_X",
      customer_name: "顧客X社",
      amount: 500000,
      date: "2024-01-15",
    });
    expect(result_second.data[1]).toEqual({
      id: "deal_002",
      sales_person: "営業担当者A",
      customer_id: "cust_X",
      customer_name: "顧客X社",
      amount: 300000,
      date: "2024-01-20",
    });
    expect(result_second.data[2]).toEqual({
      id: "deal_003",
      sales_person: "営業担当者A",
      customer_id: "cust_X",
      customer_name: "顧客X社",
      amount: 700000,
      date: "2024-01-25",
    });
    expect(result_second.schema).toHaveProperty("type", "object");

    // 第1回目と第2回目の完全比較
    expect(result_first.extraction_count).toBe(result_second.extraction_count);
    expect(result_first.total_amount).toBe(result_second.total_amount);
    expect(result_first.data).toEqual(result_second.data);
    expect(JSON.stringify(result_first.data)).toBe(
      JSON.stringify(result_second.data)
    );
    expect(result_first.schema).toEqual(result_second.schema);
  });
});