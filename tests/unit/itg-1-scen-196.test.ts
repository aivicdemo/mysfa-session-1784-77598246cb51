import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { retrieveCustomerDataWithCache } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-196
  test("キャッシュ有効期限内のデータが使用され、再取得が実行されない", () => {
    const customerId = "CUST-001";
    const cacheValidityMinutes = 30;
    const elapsedMinutesAfterFirstFetch = 5;

    const initialFetchTime = new Date("2024-01-15T10:00:00Z");
    const secondFetchTime = new Date("2024-01-15T10:05:00Z");

    const mockCustomerData = {
      customerId: "CUST-001",
      customerName: "株式会社テスト",
      contactPerson: "田中太郎",
      email: "tanaka@test.jp",
      phone: "090-1234-5678",
      industry: "IT",
      address: "東京都渋谷区",
      dealHistories: [
        {
          dealId: "DEAL-100",
          dealName: "システム導入案件",
          status: "受注",
          amount: 5000000,
          closedDate: "2024-01-10",
          dealDate: "2024-01-10T09:30:00Z",
        },
        {
          dealId: "DEAL-101",
          dealName: "保守契約",
          status: "提案中",
          amount: 1200000,
          closedDate: null,
          dealDate: "2024-01-12T14:15:00Z",
        },
      ],
      activityRecords: [
        {
          activityId: "ACT-001",
          activityType: "訪問",
          description: "顧客先訪問、システム導入に関する要件ヒアリング",
          recordedAt: "2024-01-12T10:00:00Z",
        },
        {
          activityId: "ACT-002",
          activityType: "電話",
          description: "進捗確認、来週の打ち合わせ日程調整",
          recordedAt: "2024-01-14T15:30:00Z",
        },
      ],
      issueRecords: [
        {
          issueId: "ISSUE-001",
          issueTitle: "予算承認プロセスの遅延",
          issueStatus: "解決済",
          resolvedAt: "2024-01-13T11:00:00Z",
        },
      ],
    };

    const cacheMetadata = {
      fetchedAt: initialFetchTime,
      expiresAt: new Date(
        initialFetchTime.getTime() + cacheValidityMinutes * 60 * 1000
      ),
      remainingValidityMinutes: cacheValidityMinutes - elapsedMinutesAfterFirstFetch,
    };

    const firstResult = retrieveCustomerDataWithCache({
      customerId,
      cacheValidityMinutes,
      currentTime: initialFetchTime,
    });

    expect(firstResult).toEqual({
      data: mockCustomerData,
      source: "network",
      timestamp: initialFetchTime,
    });

    const secondResult = retrieveCustomerDataWithCache({
      customerId,
      cacheValidityMinutes,
      currentTime: secondFetchTime,
    });

    expect(secondResult).toEqual({
      data: mockCustomerData,
      source: "cache",
      timestamp: initialFetchTime,
      cacheMetadata: {
        expiresAt: cacheMetadata.expiresAt,
        remainingValidityMinutes: 25,
      },
    });

    expect(secondResult.source).toBe("cache");
    expect(secondResult.data).toEqual(firstResult.data);
    expect(secondResult.timestamp).toBe(initialFetchTime);
    expect(secondResult.cacheMetadata?.remainingValidityMinutes).toBe(25);

    const timeDiffMinutes =
      (secondFetchTime.getTime() - initialFetchTime.getTime()) / (1000 * 60);
    expect(timeDiffMinutes).toBe(5);
    expect(timeDiffMinutes).toBeLessThan(cacheValidityMinutes);
  });
});