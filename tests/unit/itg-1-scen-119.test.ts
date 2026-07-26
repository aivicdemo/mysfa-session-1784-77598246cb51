import { classifyDealsByCustomer } from "../../src/logic/it-1";

describe("顧客別商談進捗分類機能", () => {
  // SCEN-119
  test("各ステータスの件数と合計金額が顧客ごとに正しく集計される", () => {
    const deals = [
      {
        customerId: "CUST_A",
        customerName: "顧客A",
        dealId: "DEAL_A_001",
        dealName: "案件A-1",
        status: "提案中",
        amount: 100000,
      },
      {
        customerId: "CUST_A",
        customerName: "顧客A",
        dealId: "DEAL_A_002",
        dealName: "案件A-2",
        status: "提案中",
        amount: 150000,
      },
      {
        customerId: "CUST_A",
        customerName: "顧客A",
        dealId: "DEAL_A_003",
        dealName: "案件A-3",
        status: "検討中",
        amount: 200000,
      },
      {
        customerId: "CUST_A",
        customerName: "顧客A",
        dealId: "DEAL_A_004",
        dealName: "案件A-4",
        status: "成約",
        amount: 500000,
      },
      {
        customerId: "CUST_A",
        customerName: "顧客A",
        dealId: "DEAL_A_005",
        dealName: "案件A-5",
        status: "失注",
        amount: 300000,
      },
      {
        customerId: "CUST_B",
        customerName: "顧客B",
        dealId: "DEAL_B_001",
        dealName: "案件B-1",
        status: "提案中",
        amount: 80000,
      },
      {
        customerId: "CUST_B",
        customerName: "顧客B",
        dealId: "DEAL_B_002",
        dealName: "案件B-2",
        status: "検討中",
        amount: 120000,
      },
      {
        customerId: "CUST_B",
        customerName: "顧客B",
        dealId: "DEAL_B_003",
        dealName: "案件B-3",
        status: "検討中",
        amount: 150000,
      },
      {
        customerId: "CUST_B",
        customerName: "顧客B",
        dealId: "DEAL_B_004",
        dealName: "案件B-4",
        status: "成約",
        amount: 600000,
      },
      {
        customerId: "CUST_B",
        customerName: "顧客B",
        dealId: "DEAL_B_005",
        dealName: "案件B-5",
        status: "失注",
        amount: 100000,
      },
    ];

    const result = classifyDealsByCustomer(deals);

    expect(result).toEqual({
      CUST_A: {
        customerName: "顧客A",
        statusSummary: {
          提案中: {
            count: 2,
            totalAmount: 250000,
          },
          検討中: {
            count: 1,
            totalAmount: 200000,
          },
          成約: {
            count: 1,
            totalAmount: 500000,
          },
          失注: {
            count: 1,
            totalAmount: 300000,
          },
        },
        totalDeals: 5,
        totalAmount: 1250000,
      },
      CUST_B: {
        customerName: "顧客B",
        statusSummary: {
          提案中: {
            count: 1,
            totalAmount: 80000,
          },
          検討中: {
            count: 2,
            totalAmount: 270000,
          },
          成約: {
            count: 1,
            totalAmount: 600000,
          },
          失注: {
            count: 1,
            totalAmount: 100000,
          },
        },
        totalDeals: 5,
        totalAmount: 1050000,
      },
    });

    const custAProposal = result.CUST_A.statusSummary.提案中;
    expect(custAProposal.count).toBe(2);
    expect(custAProposal.totalAmount).toBe(250000);

    const custAConsideration = result.CUST_A.statusSummary.検討中;
    expect(custAConsideration.count).toBe(1);
    expect(custAConsideration.totalAmount).toBe(200000);

    const custAWon = result.CUST_A.statusSummary.成約;
    expect(custAWon.count).toBe(1);
    expect(custAWon.totalAmount).toBe(500000);

    const custALost = result.CUST_A.statusSummary.失注;
    expect(custALost.count).toBe(1);
    expect(custALost.totalAmount).toBe(300000);

    const custBProposal = result.CUST_B.statusSummary.提案中;
    expect(custBProposal.count).toBe(1);
    expect(custBProposal.totalAmount).toBe(80000);

    const custBConsideration = result.CUST_B.statusSummary.検討中;
    expect(custBConsideration.count).toBe(2);
    expect(custBConsideration.totalAmount).toBe(270000);

    const custBWon = result.CUST_B.statusSummary.成約;
    expect(custBWon.count).toBe(1);
    expect(custBWon.totalAmount).toBe(600000);

    const custBLost = result.CUST_B.statusSummary.失注;
    expect(custBLost.count).toBe(1);
    expect(custBLost.totalAmount).toBe(100000);

    expect(result.CUST_A.totalDeals).toBe(5);
    expect(result.CUST_A.totalAmount).toBe(1250000);

    expect(result.CUST_B.totalDeals).toBe(5);
    expect(result.CUST_B.totalAmount).toBe(1050000);

    const custAAllStatuses = Object.keys(result.CUST_A.statusSummary);
    expect(custAAllStatuses).toContain("提案中");
    expect(custAAllStatuses).toContain("検討中");
    expect(custAAllStatuses).toContain("成約");
    expect(custAAllStatuses).toContain("失注");

    const custBAllStatuses = Object.keys(result.CUST_B.statusSummary);
    expect(custBAllStatuses).toContain("提案中");
    expect(custBAllStatuses).toContain("検討中");
    expect(custBAllStatuses).toContain("成約");
    expect(custBAllStatuses).toContain("失注");
  });
});