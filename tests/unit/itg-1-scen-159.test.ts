import { refreshCustomerRecordIfCacheExpired } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-159
  test("キャッシュ有効期限を超えた場合にデータベースから最新データが再取得される", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const customerId = "CUST-20240115-001";
    const currentTimestamp = new Date("2024-01-15T12:00:00Z").getTime();
    const cacheExpiryTimestamp = new Date("2024-01-15T10:00:00Z").getTime();

    const customerRecordFromDb = {
      customerId: customerId,
      customerName: "テスト顧客A",
      industry: "製造業",
      representativeName: "山田太郎",
      phone: "090-1234-5678",
      email: "yamada@test-customer.com",
      lastModified: new Date("2024-01-15T11:30:00Z").toISOString(),
      dealHistories: [
        {
          dealId: "DEAL-20240110-001",
          dealName: "システム導入プロジェクト",
          status: "提案中",
          amount: 5000000,
          proposalDate: "2024-01-10",
        },
        {
          dealId: "DEAL-20240105-001",
          dealName: "保守契約更新",
          status: "受注",
          amount: 1200000,
          contractDate: "2024-01-05",
        },
      ],
      activityRecords: [
        {
          activityId: "ACT-20240115-001",
          activityType: "電話",
          content: "顧客からの問い合わせ対応",
          recordedDate: "2024-01-15T10:30:00Z",
        },
        {
          activityId: "ACT-20240114-001",
          activityType: "訪問",
          content: "営業ヒアリング実施",
          recordedDate: "2024-01-14T14:00:00Z",
        },
      ],
      issueResolutions: [
        {
          issueId: "ISSUE-20240110-001",
          issueName: "納期短縮要件への対応",
          status: "解決済",
          resolvedDate: "2024-01-12T15:00:00Z",
        },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(customerRecordFromDb), {
      status: 200,
    });

    const cacheState = {
      customerId: customerId,
      expiryTimestamp: cacheExpiryTimestamp,
      data: {
        customerId: customerId,
        customerName: "テスト顧客A（古いキャッシュ）",
        industry: "製造業",
        representativeName: "山田太郎",
        phone: "090-1234-5678",
        email: "yamada@test-customer.com",
        lastModified: new Date("2024-01-15T09:00:00Z").toISOString(),
        dealHistories: [],
        activityRecords: [],
        issueResolutions: [],
      },
    };

    const result = await refreshCustomerRecordIfCacheExpired(
      customerId,
      currentTimestamp,
      cacheState
    );

    expect(result.fromCache).toBe(false);
    expect(result.data.customerId).toBe("CUST-20240115-001");
    expect(result.data.customerName).toBe("テスト顧客A");
    expect(result.data.industry).toBe("製造業");
    expect(result.data.representativeName).toBe("山田太郎");
    expect(result.data.lastModified).toBe(
      new Date("2024-01-15T11:30:00Z").toISOString()
    );

    expect(result.data.dealHistories).toHaveLength(2);
    expect(result.data.dealHistories[0].dealId).toBe("DEAL-20240110-001");
    expect(result.data.dealHistories[0].dealName).toBe(
      "システム導入プロジェクト"
    );
    expect(result.data.dealHistories[0].status).toBe("提案中");
    expect(result.data.dealHistories[0].amount).toBe(5000000);
    expect(result.data.dealHistories[1].dealId).toBe("DEAL-20240105-001");
    expect(result.data.dealHistories[1].status).toBe("受注");
    expect(result.data.dealHistories[1].amount).toBe(1200000);

    expect(result.data.activityRecords).toHaveLength(2);
    expect(result.data.activityRecords[0].activityId).toBe("ACT-20240115-001");
    expect(result.data.activityRecords[0].activityType).toBe("電話");
    expect(result.data.activityRecords[0].recordedDate).toBe(
      "2024-01-15T10:30:00Z"
    );
    expect(result.data.activityRecords[1].activityId).toBe("ACT-20240114-001");
    expect(result.data.activityRecords[1].activityType).toBe("訪問");
    expect(result.data.activityRecords[1].recordedDate).toBe(
      "2024-01-14T14:00:00Z"
    );

    expect(result.data.issueResolutions).toHaveLength(1);
    expect(result.data.issueResolutions[0].issueId).toBe("ISSUE-20240110-001");
    expect(result.data.issueResolutions[0].issueName).toBe(
      "納期短縮要件への対応"
    );
    expect(result.data.issueResolutions[0].status).toBe("解決済");

    expect(fetchMock.calls()).toHaveLength(1);

    fetchMock.disableMocks();
  });
});