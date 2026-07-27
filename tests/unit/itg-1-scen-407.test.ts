import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { formatActivityRecordsTimeline } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録の時系列表示機能", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // SCEN-407
  test("活動記録の作成日時が不正な形式のとき、エラーが発生する", () => {
    const invalidActivityRecords = [
      {
        activityId: "ACT001",
        activityType: "email",
        createdAt: "2024-13-45 25:70:90",
        description: "Invalid month and time",
      },
      {
        activityId: "ACT002",
        activityType: "call",
        createdAt: "invalid-date",
        description: "Completely invalid format",
      },
      {
        activityId: "ACT003",
        activityType: "visit",
        createdAt: null,
        description: "Null date",
      },
    ];

    expect(() => {
      formatActivityRecordsTimeline(invalidActivityRecords);
    }).toThrow(/Invalid date format in activity record/);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid date format in activity record")
    );
  });
});