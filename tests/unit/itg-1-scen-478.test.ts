import { searchDealHistoryByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-478: 開始日と終了日が同日の期間で商談履歴を検索するとき、その日のレコードのみ返される', () => {
    // Arrange: テストデータセットアップ
    const customerId = 'CUST-001';
    const targetDate = new Date('2024-01-15T00:00:00Z');
    
    const dealHistoryRecords = [
      {
        dealId: 'DEAL-A',
        customerId: customerId,
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T14:00:00Z'),
        dealStatus: '提案中',
        amount: 500000,
      },
      {
        dealId: 'DEAL-B',
        customerId: customerId,
        startTime: new Date('2024-01-14T09:00:00Z'),
        endTime: new Date('2024-01-14T16:00:00Z'),
        dealStatus: '初期接触',
        amount: 300000,
      },
      {
        dealId: 'DEAL-C',
        customerId: customerId,
        startTime: new Date('2024-01-16T08:00:00Z'),
        endTime: new Date('2024-01-16T12:00:00Z'),
        dealStatus: '交渉中',
        amount: 700000,
      },
      {
        dealId: 'DEAL-D',
        customerId: customerId,
        startTime: new Date('2024-01-15T15:00:00Z'),
        endTime: new Date('2024-01-16T10:00:00Z'),
        dealStatus: '受注',
        amount: 1000000,
      },
    ];

    // Act: 開始日と終了日を同日で指定して検索実行
    const searchStartDate = new Date('2024-01-15T00:00:00Z');
    const searchEndDate = new Date('2024-01-15T23:59:59Z');
    
    const result = searchDealHistoryByDateRange(
      customerId,
      dealHistoryRecords,
      searchStartDate,
      searchEndDate
    );

    // Assert: 期待結果の検証
    expect(result).toHaveLength(1);
    expect(result[0].dealId).toBe('DEAL-A');
    expect(result[0].startTime).toEqual(new Date('2024-01-15T10:00:00Z'));
    expect(result[0].endTime).toEqual(new Date('2024-01-15T14:00:00Z'));
  });
});