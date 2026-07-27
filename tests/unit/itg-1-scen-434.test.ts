import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { displayCustomerRecordWithCache } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-434
  test("キャッシュ有効期限内では既存データが画面に表示される", () => {
    const customerId = "CUST-001";
    const cacheValidityMs = 5 * 60 * 1000; // 5 minutes in milliseconds
    const elapsedTimeMs = 3 * 60 * 1000; // 3 minutes elapsed

    const initialDealHistory = [
      {
        dealId: "DEAL-100",
        customerId: "CUST-001",
        dealName: "商談A",
        status: "proposal",
        amount: 500000,
        createdAt: "2024-01-10T09:00:00Z",
      },
      {
        dealId: "DEAL-101",
        customerId: "CUST-001",
        dealName: "商談B",
        status: "negotiation",
        amount: 750000,
        createdAt: "2024-01-15T14:30:00Z",
      },
    ];

    const initialActivityRecords = [
      {
        activityId: "ACT-001",
        customerId: "CUST-001",
        type: "email",
        description: "提案メール送信",
        activityDate: "2024-01-10T10:15:00Z",
      },
      {
        activityId: "ACT-002",
        customerId: "CUST-001",
        type: "call",
        description: "電話打ち合わせ",
        activityDate: "2024-01-12T11:00:00Z",
      },
      {
        activityId: "ACT-003",
        customerId: "CUST-001",
        type: "visit",
        description: "顧客訪問",
        activityDate: "2024-01-15T15:45:00Z",
      },
    ];

    const mockDataSource = {
      fetchCustomerDealHistory: jest.fn(),
      fetchCustomerActivityRecords: jest.fn(),
    };

    mockDataSource.fetchCustomerDealHistory.mockResolvedValueOnce(
      initialDealHistory
    );
    mockDataSource.fetchCustomerActivityRecords.mockResolvedValueOnce(
      initialActivityRecords
    );

    const initialResult = displayCustomerRecordWithCache(
      customerId,
      cacheValidityMs,
      0,
      mockDataSource
    );

    expect(initialResult).toEqual({
      dealHistory: initialDealHistory,
      activityRecords: initialActivityRecords,
      fromCache: false,
    });

    expect(mockDataSource.fetchCustomerDealHistory).toHaveBeenCalledTimes(1);
    expect(mockDataSource.fetchCustomerActivityRecords).toHaveBeenCalledTimes(
      1
    );

    mockDataSource.fetchCustomerDealHistory.mockClear();
    mockDataSource.fetchCustomerActivityRecords.mockClear();

    const cachedResult = displayCustomerRecordWithCache(
      customerId,
      cacheValidityMs,
      elapsedTimeMs,
      mockDataSource
    );

    expect(cachedResult).toEqual({
      dealHistory: initialDealHistory,
      activityRecords: initialActivityRecords,
      fromCache: true,
    });

    expect(mockDataSource.fetchCustomerDealHistory).not.toHaveBeenCalled();
    expect(mockDataSource.fetchCustomerActivityRecords).not.toHaveBeenCalled();

    expect(cachedResult.dealHistory.length).toBe(2);
    expect(cachedResult.activityRecords.length).toBe(3);
    expect(cachedResult.dealHistory[0].dealId).toBe("DEAL-100");
    expect(cachedResult.dealHistory[1].dealId).toBe("DEAL-101");
    expect(cachedResult.activityRecords[0].activityId).toBe("ACT-001");
    expect(cachedResult.activityRecords[1].activityId).toBe("ACT-002");
    expect(cachedResult.activityRecords[2].activityId).toBe("ACT-003");
  });
});