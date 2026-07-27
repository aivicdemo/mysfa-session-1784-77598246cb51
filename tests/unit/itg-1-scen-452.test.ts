import { fetchCustomerIssueResolutionHistory } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  test("SCEN-452: 課題解決状況が時系列（昇順）で並んでいる場合、その順序で返される", async () => {
    // Arrange: テストデータ準備 - 同一顧客に紐付く課題解決記録を3件、異なるタイムスタンプで作成
    const customerId = "CUST-001";
    const issueResolutionRecord1 = {
      id: "ISSUE-RES-1",
      customerId: customerId,
      issueId: "ISSUE-1",
      resolvedAt: new Date("2024-01-10T09:00:00Z"),
      resolutionContent: "顧客の納期要望に対し、生産スケジュール調整で対応完了",
      status: "resolved",
    };
    const issueResolutionRecord2 = {
      id: "ISSUE-RES-2",
      customerId: customerId,
      issueId: "ISSUE-2",
      resolvedAt: new Date("2024-01-15T14:30:00Z"),
      resolutionContent: "価格交渉について、割引プランを提示して合意",
      status: "resolved",
    };
    const issueResolutionRecord3 = {
      id: "ISSUE-RES-3",
      customerId: customerId,
      issueId: "ISSUE-3",
      resolvedAt: new Date("2024-02-01T11:00:00Z"),
      resolutionContent: "配送先変更要望に対応し、手配完了",
      status: "resolved",
    };

    // スタブ化したデータベース照会ロジック - 昇順（古い順）でタイムスタンプ付きデータを返す
    const mockDataSourceAdapter = {
      fetchIssueResolutionByCustId: jest.fn().mockResolvedValue([
        issueResolutionRecord1,
        issueResolutionRecord2,
        issueResolutionRecord3,
      ]),
    };

    // Act: 顧客レコード画面から課題解決状況を取得
    const result = await fetchCustomerIssueResolutionHistory(
      customerId,
      mockDataSourceAdapter
    );

    // Assert: 返されたレコードが昇順（タイムスタンプ：古い順）に整列していることを検証
    expect(result).toHaveLength(3);

    // 1件目：最も古いレコード（2024-01-10 09:00）
    expect(result[0].id).toBe("ISSUE-RES-1");
    expect(result[0].resolvedAt).toEqual(new Date("2024-01-10T09:00:00Z"));
    expect(result[0].resolutionContent).toBe(
      "顧客の納期要望に対し、生産スケジュール調整で対応完了"
    );

    // 2件目（2024-01-15 14:30）
    expect(result[1].id).toBe("ISSUE-RES-2");
    expect(result[1].resolvedAt).toEqual(new Date("2024-01-15T14:30:00Z"));
    expect(result[1].resolutionContent).toBe(
      "価格交渉について、割引プランを提示して合意"
    );

    // 3件目：最も新しいレコード（2024-02-01 11:00）
    expect(result[2].id).toBe("ISSUE-RES-3");
    expect(result[2].resolvedAt).toEqual(new Date("2024-02-01T11:00:00Z"));
    expect(result[2].resolutionContent).toBe(
      "配送先変更要望に対応し、手配完了"
    );

    // タイムスタンプの順序が昇順（古い順）であることを検証
    const timestamps = result.map((record) => record.resolvedAt.getTime());
    expect(timestamps[0]).toBeLessThan(timestamps[1]);
    expect(timestamps[1]).toBeLessThan(timestamps[2]);

    // モック呼び出しを検証
    expect(mockDataSourceAdapter.fetchIssueResolutionByCustId).toHaveBeenCalledWith(
      customerId
    );
    expect(mockDataSourceAdapter.fetchIssueResolutionByCustId).toHaveBeenCalledTimes(
      1
    );
  });
});