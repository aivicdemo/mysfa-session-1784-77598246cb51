import { extractBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-789: [normal] 請求対象データ抽出機能 - 同じ金額の商談成約データが並んでいるとき、全件が抽出される
  test("同じ金額の複数の商談成約データが全件抽出されること", () => {
    const mockDealData = [
      {
        dealId: "DEAL-001",
        customerId: "CUST-A",
        status: "成約済み",
        amount: 100000,
        productName: "商品X",
        isBillingTarget: true,
        dealDate: "2024-01-15",
      },
      {
        dealId: "DEAL-002",
        customerId: "CUST-B",
        status: "成約済み",
        amount: 100000,
        productName: "商品Y",
        isBillingTarget: true,
        dealDate: "2024-01-16",
      },
      {
        dealId: "DEAL-003",
        customerId: "CUST-C",
        status: "成約済み",
        amount: 100000,
        productName: "商品Z",
        isBillingTarget: true,
        dealDate: "2024-01-17",
      },
      {
        dealId: "DEAL-004",
        customerId: "CUST-D",
        status: "提案中",
        amount: 100000,
        productName: "商品W",
        isBillingTarget: false,
        dealDate: "2024-01-18",
      },
      {
        dealId: "DEAL-005",
        customerId: "CUST-E",
        status: "成約済み",
        amount: 50000,
        productName: "商品V",
        isBillingTarget: true,
        dealDate: "2024-01-19",
      },
    ];

    const extractionCriteria = {
      status: "成約済み",
      amount: 100000,
    };

    const result = extractBillingTargetData(mockDealData, extractionCriteria);

    expect(result.length).toBe(3);
    expect(result[0].dealId).toBe("DEAL-001");
    expect(result[0].customerId).toBe("CUST-A");
    expect(result[0].status).toBe("成約済み");
    expect(result[0].amount).toBe(100000);
    expect(result[0].productName).toBe("商品X");
    expect(result[0].isBillingTarget).toBe(true);

    expect(result[1].dealId).toBe("DEAL-002");
    expect(result[1].customerId).toBe("CUST-B");
    expect(result[1].status).toBe("成約済み");
    expect(result[1].amount).toBe(100000);
    expect(result[1].productName).toBe("商品Y");
    expect(result[1].isBillingTarget).toBe(true);

    expect(result[2].dealId).toBe("DEAL-003");
    expect(result[2].customerId).toBe("CUST-C");
    expect(result[2].status).toBe("成約済み");
    expect(result[2].amount).toBe(100000);
    expect(result[2].productName).toBe("商品Z");
    expect(result[2].isBillingTarget).toBe(true);

    const allMatchCriteria = result.every(
      (record) =>
        record.status === extractionCriteria.status &&
        record.amount === extractionCriteria.amount
    );
    expect(allMatchCriteria).toBe(true);

    const noDuplicates = new Set(result.map((r) => r.dealId)).size === result.length;
    expect(noDuplicates).toBe(true);
  });
});