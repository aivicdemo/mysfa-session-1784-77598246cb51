import { generateMonthlyReportWithCustomerDetails } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-124: 月次営業成績報告書生成機能 - 報告書に顧客別詳細情報が正確に記載される", () => {
    // Arrange: テストデータの準備
    const targetMonth = "2024-01";
    const customers = [
      {
        customerId: "CUST001",
        customerName: "A株式会社",
        salesAmount: 1500000,
        transactionCount: 3,
        productBreakdown: [
          { productName: "商品A", amount: 1000000 },
          { productName: "商品B", amount: 500000 },
        ],
      },
      {
        customerId: "CUST002",
        customerName: "B有限会社",
        salesAmount: 800000,
        transactionCount: 2,
        productBreakdown: [
          { productName: "商品C", amount: 500000 },
          { productName: "商品D", amount: 300000 },
        ],
      },
      {
        customerId: "CUST003",
        customerName: "C商事",
        salesAmount: 1200000,
        transactionCount: 4,
        productBreakdown: [
          { productName: "商品A", amount: 700000 },
          { productName: "商品E", amount: 500000 },
        ],
      },
    ];

    // Act: 報告書を生成
    const report = generateMonthlyReportWithCustomerDetails(
      targetMonth,
      customers
    );

    // Assert: 報告書の基本情報を検証
    expect(report).toBeDefined();
    expect(report.reportMonth).toBe("2024-01");
    expect(report.generatedDate).toBeDefined();

    // Assert: 顧客別詳細情報の検証
    expect(report.customerDetails).toHaveLength(3);

    // 顧客1の詳細情報を検証
    expect(report.customerDetails[0]).toEqual({
      customerId: "CUST001",
      customerName: "A株式会社",
      salesAmount: 1500000,
      transactionCount: 3,
      productBreakdown: [
        { productName: "商品A", amount: 1000000 },
        { productName: "商品B", amount: 500000 },
      ],
    });

    // 顧客2の詳細情報を検証
    expect(report.customerDetails[1]).toEqual({
      customerId: "CUST002",
      customerName: "B有限会社",
      salesAmount: 800000,
      transactionCount: 2,
      productBreakdown: [
        { productName: "商品C", amount: 500000 },
        { productName: "商品D", amount: 300000 },
      ],
    });

    // 顧客3の詳細情報を検証
    expect(report.customerDetails[2]).toEqual({
      customerId: "CUST003",
      customerName: "C商事",
      salesAmount: 1200000,
      transactionCount: 4,
      productBreakdown: [
        { productName: "商品A", amount: 700000 },
        { productName: "商品E", amount: 500000 },
      ],
    });

    // Assert: 集計値の検証
    const totalSalesAmount = 1500000 + 800000 + 1200000;
    const totalTransactionCount = 3 + 2 + 4;

    expect(report.totalSalesAmount).toBe(totalSalesAmount);
    expect(report.totalTransactionCount).toBe(totalTransactionCount);

    // Assert: 報告書フォーマットの必須項目が存在することを検証
    expect(report.reportTitle).toBe("月次営業成績報告書");
    expect(report.reportFormat).toBe("standardFormat");

    // Assert: データベース情報との完全一致を検証
    const sourceCustomerIds = customers.map((c) => c.customerId);
    const reportCustomerIds = report.customerDetails.map(
      (c) => c.customerId
    );
    expect(reportCustomerIds).toEqual(sourceCustomerIds);

    // Assert: 各顧客の売上高が正確に記載されていることを検証
    report.customerDetails.forEach((reportCustomer, index) => {
      const sourceCustomer = customers[index];
      expect(reportCustomer.salesAmount).toBe(sourceCustomer.salesAmount);
      expect(reportCustomer.transactionCount).toBe(
        sourceCustomer.transactionCount
      );
    });

    // Assert: 商品別売上内訳の正確性を検証
    report.customerDetails.forEach((reportCustomer, index) => {
      const sourceCustomer = customers[index];
      expect(reportCustomer.productBreakdown).toHaveLength(
        sourceCustomer.productBreakdown.length
      );
      reportCustomer.productBreakdown.forEach((reportProduct, prodIndex) => {
        const sourceProduct = sourceCustomer.productBreakdown[prodIndex];
        expect(reportProduct.productName).toBe(sourceProduct.productName);
        expect(reportProduct.amount).toBe(sourceProduct.amount);
      });
    });
  });
});