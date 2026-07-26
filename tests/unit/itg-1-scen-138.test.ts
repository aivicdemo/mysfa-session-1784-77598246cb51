import { calculateMonthlyOutstandingAmount } from "../../src/logic/it-1-3";

describe("売上実績・請求状況の月次集計機能", () => {
  // SCEN-138
  test("期間内に部分請求された商談の未請求額が正確に計算される", () => {
    // ハッピーパス：単一回の部分請求
    const deal_single_partial = {
      deal_id: "DEAL-001",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-001",
          billing_date: "2024-01-10",
          billing_amount: 600000,
        },
      ],
    };

    const result_single = calculateMonthlyOutstandingAmount(deal_single_partial);
    expect(result_single).toBe(400000);

    // ハッピーパス：複数回の分割請求
    const deal_multi_partial = {
      deal_id: "DEAL-002",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-002",
          billing_date: "2024-01-05",
          billing_amount: 300000,
        },
        {
          billing_id: "BIL-003",
          billing_date: "2024-01-15",
          billing_amount: 400000,
        },
      ],
    };

    const result_multi = calculateMonthlyOutstandingAmount(deal_multi_partial);
    expect(result_multi).toBe(300000);

    // ハッピーパス：期間内請求と期間外請求の混在
    const deal_mixed_period = {
      deal_id: "DEAL-003",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-004",
          billing_date: "2024-01-10",
          billing_amount: 500000,
        },
        {
          billing_id: "BIL-005",
          billing_date: "2024-02-05",
          billing_amount: 300000,
        },
      ],
    };

    const result_mixed = calculateMonthlyOutstandingAmount(deal_mixed_period);
    expect(result_mixed).toBe(500000);

    // ハッピーパス：全額請求（未請求額ゼロ）
    const deal_fully_billed = {
      deal_id: "DEAL-004",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-006",
          billing_date: "2024-01-20",
          billing_amount: 1000000,
        },
      ],
    };

    const result_fully = calculateMonthlyOutstandingAmount(deal_fully_billed);
    expect(result_fully).toBe(0);

    // ハッピーパス：未請求（請求なし）
    const deal_unbilled = {
      deal_id: "DEAL-005",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [],
    };

    const result_unbilled = calculateMonthlyOutstandingAmount(deal_unbilled);
    expect(result_unbilled).toBe(1000000);

    // エラーケース：請求額の合計が商談金額を超える場合
    const deal_over_billed = {
      deal_id: "DEAL-006",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-007",
          billing_date: "2024-01-10",
          billing_amount: 800000,
        },
        {
          billing_id: "BIL-008",
          billing_date: "2024-01-20",
          billing_amount: 300000,
        },
      ],
    };

    expect(() =>
      calculateMonthlyOutstandingAmount(deal_over_billed)
    ).toThrow(/請求額/);

    // エラーケース：商談金額が負の値
    const deal_negative_amount = {
      deal_id: "DEAL-007",
      deal_amount: -1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [],
    };

    expect(() =>
      calculateMonthlyOutstandingAmount(deal_negative_amount)
    ).toThrow(/商談金額/);

    // エラーケース：請求額が負の値
    const deal_negative_billing = {
      deal_id: "DEAL-008",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-009",
          billing_date: "2024-01-10",
          billing_amount: -100000,
        },
      ],
    };

    expect(() =>
      calculateMonthlyOutstandingAmount(deal_negative_billing)
    ).toThrow(/請求額/);

    // エラーケース：期間開始日が期間終了日より後ろ
    const deal_invalid_period = {
      deal_id: "DEAL-009",
      deal_amount: 1000000,
      period_start: "2024-01-31",
      period_end: "2024-01-01",
      billings: [],
    };

    expect(() =>
      calculateMonthlyOutstandingAmount(deal_invalid_period)
    ).toThrow(/期間/);

    // ハッピーパス：境界値テスト - 期間開始日の請求
    const deal_boundary_start = {
      deal_id: "DEAL-010",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-010",
          billing_date: "2024-01-01",
          billing_amount: 250000,
        },
      ],
    };

    const result_boundary_start =
      calculateMonthlyOutstandingAmount(deal_boundary_start);
    expect(result_boundary_start).toBe(750000);

    // ハッピーパス：境界値テスト - 期間終了日の請求
    const deal_boundary_end = {
      deal_id: "DEAL-011",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-011",
          billing_date: "2024-01-31",
          billing_amount: 250000,
        },
      ],
    };

    const result_boundary_end =
      calculateMonthlyOutstandingAmount(deal_boundary_end);
    expect(result_boundary_end).toBe(750000);

    // ハッピーパス：複数回の分割請求で3回以上
    const deal_three_partial = {
      deal_id: "DEAL-012",
      deal_amount: 1000000,
      period_start: "2024-01-01",
      period_end: "2024-01-31",
      billings: [
        {
          billing_id: "BIL-012",
          billing_date: "2024-01-05",
          billing_amount: 200000,
        },
        {
          billing_id: "BIL-013",
          billing_date: "2024-01-15",
          billing_amount: 300000,
        },
        {
          billing_id: "BIL-014",
          billing_date: "2024-01-25",
          billing_amount: 250000,
        },
      ],
    };

    const result_three = calculateMonthlyOutstandingAmount(deal_three_partial);
    expect(result_three).toBe(250000);
  });
});