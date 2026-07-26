import { detectUnbilledCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求データの自動照合・ズレ検出", () => {
  // SCEN-130
  test("商談ステータス『受注』で請求書が未発行の場合、未請求案件として検出される", () => {
    const test_deals = [
      {
        deal_id: "DEAL001",
        customer_name: "ABC株式会社",
        status: "受注",
        contract_date: "2024-04-15",
        amount: 500000,
        invoice_issued_date: null,
        invoice_status: "未発行",
      },
      {
        deal_id: "DEAL002",
        customer_name: "XYZ商事",
        status: "受注",
        contract_date: "2024-04-10",
        amount: 300000,
        invoice_issued_date: "2024-04-20",
        invoice_status: "発行済み",
      },
      {
        deal_id: "DEAL003",
        customer_name: "DEF企業",
        status: "提案中",
        contract_date: "2024-04-18",
        amount: 200000,
        invoice_issued_date: null,
        invoice_status: "未発行",
      },
      {
        deal_id: "DEAL004",
        customer_name: "GHI産業",
        status: "受注",
        contract_date: "2024-04-05",
        amount: 750000,
        invoice_issued_date: null,
        invoice_status: "未発行",
      },
    ];

    const result = detectUnbilledCases(test_deals);

    expect(result).toEqual({
      unbilled_cases: [
        {
          deal_id: "DEAL001",
          customer_name: "ABC株式会社",
          contract_date: "2024-04-15",
          status: "受注",
          amount: 500000,
          mismatch_reason: "受注状態で請求書未発行",
        },
        {
          deal_id: "DEAL004",
          customer_name: "GHI産業",
          contract_date: "2024-04-05",
          status: "受注",
          amount: 750000,
          mismatch_reason: "受注状態で請求書未発行",
        },
      ],
      total_unbilled_amount: 1250000,
      detection_count: 2,
      timestamp: expect.any(String),
    });

    expect(result.unbilled_cases).toHaveLength(2);
    expect(result.unbilled_cases[0].deal_id).toBe("DEAL001");
    expect(result.unbilled_cases[0].customer_name).toBe("ABC株式会社");
    expect(result.unbilled_cases[0].contract_date).toBe("2024-04-15");
    expect(result.unbilled_cases[0].status).toBe("受注");
    expect(result.unbilled_cases[0].amount).toBe(500000);
    expect(result.unbilled_cases[0].mismatch_reason).toBe(
      "受注状態で請求書未発行"
    );

    expect(result.unbilled_cases[1].deal_id).toBe("DEAL004");
    expect(result.unbilled_cases[1].customer_name).toBe("GHI産業");
    expect(result.unbilled_cases[1].contract_date).toBe("2024-04-05");
    expect(result.unbilled_cases[1].status).toBe("受注");
    expect(result.unbilled_cases[1].amount).toBe(750000);
    expect(result.unbilled_cases[1].mismatch_reason).toBe(
      "受注状態で請求書未発行"
    );

    expect(result.total_unbilled_amount).toBe(1250000);
    expect(result.detection_count).toBe(2);
  });
});