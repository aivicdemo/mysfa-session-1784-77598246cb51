import { describe, test, expect, beforeEach } from "@jest/globals";
import { initializeDashboardWithLicenseData } from "../../src/logic/it-1-3";

interface LicenseUser {
  userId: string;
  username: string;
  licenseEdition: string;
}

interface SalesforceMetadataDataSourceStub {
  fetchLicenseUsers: () => Promise<LicenseUser[]>;
  fetchEditionDetails: () => Promise<Record<string, unknown>>;
  fetchFeatureUsageMetrics: () => Promise<Record<string, unknown>>;
  fetchAnnualCostData: () => Promise<Record<string, unknown>>;
}

interface CachedLicenseData {
  users: LicenseUser[];
  lastUpdatedAt: string;
}

interface DashboardState {
  displayedUsers: LicenseUser[];
  errorMessage: string | null;
  lastUpdateTime: string | null;
  isFallbackMode: boolean;
}

describe("Salesforce Metadata API / Tooling API連携 - 予期しない応答形式への対応", () => {
  let previousCachedData: CachedLicenseData;
  let dashboardState: DashboardState;

  beforeEach(() => {
    previousCachedData = {
      users: [
        {
          userId: "user001",
          username: "alice@example.com",
          licenseEdition: "Professional",
        },
        {
          userId: "user002",
          username: "bob@example.com",
          licenseEdition: "Enterprise",
        },
      ],
      lastUpdatedAt: "2025-01-10T14:30:00Z",
    };

    dashboardState = {
      displayedUsers: [],
      errorMessage: null,
      lastUpdateTime: null,
      isFallbackMode: false,
    };
  });

  // SCEN-1023
  test("fetchLicenseUsersが必須フィールド欠落の応答を返した場合、キャッシュデータが表示され、エラーメッセージと最後の更新時刻が表示される", async () => {
    const malformedResponse: Partial<LicenseUser>[] = [
      {
        userId: "user003",
        // username フィールドが欠落
        licenseEdition: "Lightning",
      },
      {
        userId: "user004",
        username: "charlie@example.com",
        // licenseEdition フィールドが欠落
      },
    ];

    const dataSourceStub: SalesforceMetadataDataSourceStub = {
      fetchLicenseUsers: async () =>
        malformedResponse as LicenseUser[],
      fetchEditionDetails: async () => ({}),
      fetchFeatureUsageMetrics: async () => ({}),
      fetchAnnualCostData: async () => ({}),
    };

    const currentTime = new Date("2025-01-15T10:00:00Z");

    const result = await initializeDashboardWithLicenseData(
      dataSourceStub,
      previousCachedData,
      currentTime
    );

    expect(result.displayedUsers).toEqual(previousCachedData.users);
    expect(result.displayedUsers).toHaveLength(2);
    expect(result.displayedUsers[0]).toEqual({
      userId: "user001",
      username: "alice@example.com",
      licenseEdition: "Professional",
    });
    expect(result.displayedUsers[1]).toEqual({
      userId: "user002",
      username: "bob@example.com",
      licenseEdition: "Enterprise",
    });

    expect(result.errorMessage).toMatch(/Salesforce接続エラー/);
    expect(result.lastUpdateTime).toBe("2025-01-10T14:30:00Z");
    expect(result.isFallbackMode).toBe(true);
  });
});