import { classifyDealsByCustomerAndStatus } from "../../src/logic/it-1";

describe("顧客別商談進捗分類機能", () => {
  // SCEN-121
  test("不正なステータス値を持つ商談がある場合、エラーが発生する", () => {
    const invalid_deals = [
      {
        deal_id: "D001",
        customer_id: "C001",
        customer_name: "顧客A",
        status: "invalid_status",
        amount: 100000,
      },
    ];

    expect(() => classifyDealsByCustomerAndStatus(invalid_deals)).toThrow(
      /ステータス/
    );
  });

  test("ステータスがnullの場合、エラーが発生する", () => {
    const deals_with_null_status = [
      {
        deal_id: "D002",
        customer_id: "C002",
        customer_name: "顧客B",
        status: null,
        amount: 150000,
      },
    ];

    expect(() =>
      classifyDealsByCustomerAndStatus(deals_with_null_status)
    ).toThrow(/ステータス/);
  });

  test("ステータスが数値の場合、エラーが発生する", () => {
    const deals_with_numeric_status = [
      {
        deal_id: "D003",
        customer_id: "C003",
        customer_name: "顧客C",
        status: 123,
        amount: 200000,
      },
    ];

    expect(() =>
      classifyDealsByCustomerAndStatus(deals_with_numeric_status)
    ).toThrow(/ステータス/);
  });

  test("複数の商談から不正なステータス値を持つものが検出される", () => {
    const mixed_deals = [
      {
        deal_id: "D004",
        customer_id: "C004",
        customer_name: "顧客D",
        status: "initial_contact",
        amount: 100000,
      },
      {
        deal_id: "D005",
        customer_id: "C004",
        customer_name: "顧客D",
        status: "unknown_status",
        amount: 250000,
      },
    ];

    expect(() => classifyDealsByCustomerAndStatus(mixed_deals)).toThrow(
      /ステータス/
    );
  });

  test("ステータスが空文字列の場合、エラーが発生する", () => {
    const deals_with_empty_status = [
      {
        deal_id: "D006",
        customer_id: "C005",
        customer_name: "顧客E",
        status: "",
        amount: 300000,
      },
    ];

    expect(() =>
      classifyDealsByCustomerAndStatus(deals_with_empty_status)
    ).toThrow(/ステータス/);
  });

  test("正規のステータス値で正常に分類される", () => {
    const valid_deals = [
      {
        deal_id: "D007",
        customer_id: "C006",
        customer_name: "顧客F",
        status: "initial_contact",
        amount: 100000,
      },
      {
        deal_id: "D008",
        customer_id: "C006",
        customer_name: "顧客F",
        status: "proposal",
        amount: 150000,
      },
      {
        deal_id: "D009",
        customer_id: "C006",
        customer_name: "顧客F",
        status: "negotiation",
        amount: 200000,
      },
      {
        deal_id: "D010",
        customer_id: "C006",
        customer_name: "顧客F",
        status: "won",
        amount: 250000,
      },
      {
        deal_id: "D011",
        customer_id: "C006",
        customer_name: "顧客F",
        status: "lost",
        amount: 0,
      },
    ];

    const result = classifyDealsByCustomerAndStatus(valid_deals);

    expect(result).toEqual({
      "C006": {
        customer_name: "顧客F",
        initial_contact: {
          count: 1,
          total_amount: 100000,
          deals: [
            {
              deal_id: "D007",
              amount: 100000,
            },
          ],
        },
        proposal: {
          count: 1,
          total_amount: 150000,
          deals: [
            {
              deal_id: "D008",
              amount: 150000,
            },
          ],
        },
        negotiation: {
          count: 1,
          total_amount: 200000,
          deals: [
            {
              deal_id: "D009",
              amount: 200000,
            },
          ],
        },
        won: {
          count: 1,
          total_amount: 250000,
          deals: [
            {
              deal_id: "D010",
              amount: 250000,
            },
          ],
        },
        lost: {
          count: 1,
          total_amount: 0,
          deals: [
            {
              deal_id: "D011",
              amount: 0,
            },
          ],
        },
      },
    });
  });

  test("複数顧客の商談が正常に顧客別に分類される", () => {
    const multi_customer_deals = [
      {
        deal_id: "D012",
        customer_id: "C007",
        customer_name: "顧客G",
        status: "won",
        amount: 500000,
      },
      {
        deal_id: "D013",
        customer_id: "C008",
        customer_name: "顧客H",
        status: "proposal",
        amount: 300000,
      },
      {
        deal_id: "D014",
        customer_id: "C007",
        customer_name: "顧客G",
        status: "negotiation",
        amount: 400000,
      },
    ];

    const result = classifyDealsByCustomerAndStatus(multi_customer_deals);

    expect(result["C007"].customer_name).toBe("顧客G");
    expect(result["C007"].won.count).toBe(1);
    expect(result["C007"].negotiation.count).toBe(1);
    expect(result["C008"].customer_name).toBe("顧客H");
    expect(result["C008"].proposal.count).toBe(1);
  });
});