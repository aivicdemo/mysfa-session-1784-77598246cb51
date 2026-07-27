import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  fetchCustomerDealHistoryWithActivityRecords,
  InvalidCacheTtlError,
} from "../../src/logic/it-1";

// Mock for SalesforceMetadataDataSource
const mockSalesforceMetadataDataSource = {
  fetchLicenseUsers: jest.fn(),
  fetchEditionDetails: jest.fn(),
  fetchFeatureUsageMetrics: jest.fn(),
  fetchAnnualCostData: jest.fn(),
};

// Mock for caching layer
const mockCacheLayer = {
  getCachedData: jest.fn(),
  setCachedData: jest.fn(),
  isExpired: jest.fn(),
};

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheLayer.getCachedData.mockReturnValue(null);
    mockCacheLayer.isExpired.mockReturnValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-461: [error] キャッシュ有効期限が負の値の場合、エラーが発生する
  test("should throw ERR_INVALID_CACHE_TTL when cache TTL is negative", async () => {
    const customerId = "CUST-12345";
    const negativeCacheTtlSeconds = -1;
    const lastSuccessfulCacheData = {
      dealHistory: [
        {
          dealId: "DEAL-001",
          dealName: "Enterprise Contract",
          status: "受注",
          amount: 5000000,
          closedDate: "2024-01-15T00:00:00Z",
        },
      ],
      activityRecords: [
        {
          activityId: "ACT-001",
          activityType: "訪問",
          description: "Initial contact",
          recordedAt: "2024-01-10T09:30:00Z",
        },
      ],
    };

    mockCacheLayer.getCachedData.mockReturnValue(lastSuccessfulCacheData);

    expect(() => {
      fetchCustomerDealHistoryWithActivityRecords(
        customerId,
        mockSalesforceMetadataDataSource,
        mockCacheLayer,
        negativeCacheTtlSeconds
      );
    }).toThrow(/キャッシュ有効期限/);
  });
});