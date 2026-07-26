import { updateDealStatusWithCustomerResponse } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-178
  test("顧客対応状況が商談レコードに記録され、商談ステータスが正しく更新される", () => {
    // Arrange
    const dealId = "DEAL-2024-001";
    const previousStatus = "提案中";
    const customerResponseContent = "顧客から前向きな反応を得た";
    const responseTimestamp = new Date("2024-04-15T10:30:00Z");
    const expectedNewStatus = "決定待ち";
    const invoiceAmount = 500000;
    const invoiceId = "INV-2024-0001";

    const dealRecord = {
      dealId,
      status: previousStatus,
      customerId: "CUST-2024-001",
      amount: invoiceAmount,
      invoiceId,
      invoiceAmount,
      activityRecords: [],
    };

    const customerResponse = {
      content: customerResponseContent,
      timestamp: responseTimestamp,
      recordedAt: responseTimestamp,
    };

    // Act
    const result = updateDealStatusWithCustomerResponse(dealRecord, customerResponse);

    // Assert
    // 顧客対応内容が記録されているか
    expect(result.activityRecords).toBeDefined();
    expect(result.activityRecords.length).toBe(1);
    expect(result.activityRecords[0].content).toBe(customerResponseContent);
    expect(result.activityRecords[0].timestamp).toEqual(responseTimestamp);

    // 商談ステータスが自動更新されているか
    expect(result.status).toBe(expectedNewStatus);

    // 請求データが紐付いているか
    expect(result.invoiceId).toBe(invoiceId);
    expect(result.invoiceAmount).toBe(invoiceAmount);

    // 顧客対応履歴と商談ステータスの関連性が保持されているか
    expect(result.dealId).toBe(dealId);
    expect(result.customerId).toBe("CUST-2024-001");
    expect(result.amount).toBe(invoiceAmount);

    // ステータス変更後も請求データとの関連性が正確であるか
    expect(result.status).toBe(expectedNewStatus);
    expect(result.invoiceAmount).toBe(500000);
  });
});