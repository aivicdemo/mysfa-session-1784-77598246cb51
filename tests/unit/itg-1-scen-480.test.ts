import { fetchIssueResolutionRecordsByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-480
  test('開始日と終了日が同日の期間で課題解決状況を検索するとき、その日のレコードのみ返される', () => {
    // 検索期間: 2024年1月15日のみ
    const searchStartDate = new Date('2024-01-15T00:00:00Z');
    const searchEndDate = new Date('2024-01-15T23:59:59Z');
    const customerId = 'CUST-001';
    const filterStatus = 'all';

    // テスト用の課題解決記録
    const issueResolutionRecords = [
      {
        id: 'REC-A',
        customerId: customerId,
        createdAt: new Date('2024-01-15T09:00:00Z'),
        status: 'resolved',
        description: 'Issue A resolved on Jan 15',
      },
      {
        id: 'REC-B',
        customerId: customerId,
        createdAt: new Date('2024-01-14T14:30:00Z'),
        status: 'in_progress',
        description: 'Issue B in progress on Jan 14',
      },
      {
        id: 'REC-C',
        customerId: customerId,
        createdAt: new Date('2024-01-16T10:00:00Z'),
        status: 'resolved',
        description: 'Issue C resolved on Jan 16',
      },
    ];

    // 関数を実行
    const result = fetchIssueResolutionRecordsByDateRange({
      customerId: customerId,
      startDate: searchStartDate,
      endDate: searchEndDate,
      statusFilter: filterStatus,
      records: issueResolutionRecords,
    });

    // 期待結果: 記録Aのみが返される
    expect(result).toEqual([
      {
        id: 'REC-A',
        customerId: customerId,
        createdAt: new Date('2024-01-15T09:00:00Z'),
        status: 'resolved',
        description: 'Issue A resolved on Jan 15',
      },
    ]);

    // 検索結果件数は1件
    expect(result.length).toBe(1);
  });
});