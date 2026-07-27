import { filterActivityRecordsByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録・課題解決状況表示機能', () => {
  test('SCEN-429: 活動記録フィルタリング機能 - タイムスタンプフィールド欠落レコードの除外', () => {
    // テストデータセット準備
    const recordA = {
      id: 'A',
      timestamp: '2024-01-15T10:30:00Z',
      activityType: '営業訪問',
      description: 'テスト訪問A',
    };

    const recordB = {
      id: 'B',
      activityType: '営業訪問',
      description: 'テスト訪問B',
      // タイムスタンプフィールド欠落
    };

    const recordC = {
      id: 'C',
      timestamp: '2024-01-10T14:00:00Z',
      activityType: '電話',
      description: 'テスト電話C',
    };

    const testDataSet = [recordA, recordB, recordC];

    // ログキャプチャ用のモック
    const mockLogger = {
      logs: [] as Array<{ level: string; message: string }>,
      error: function (message: string) {
        this.logs.push({ level: 'error', message });
      },
    };

    // フィルタリング条件：期間指定フィルタ（2024-01-01〜2024-01-31）
    const filterDateStart = new Date('2024-01-01T00:00:00Z');
    const filterDateEnd = new Date('2024-01-31T23:59:59Z');

    // フィルタリング処理を実行
    const result = filterActivityRecordsByDateRange(testDataSet, filterDateStart, filterDateEnd, mockLogger);

    // 期待結果：レコードA とレコードC のみが含まれること
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('A');
    expect(result[1].id).toBe('C');

    // レコードB（タイムスタンプフィールド欠落）は結果から除外されていること
    expect(result.map((r: any) => r.id)).not.toContain('B');

    // システムログに『タイムスタンプフィールド欠落のため除外：レコードID=B』というエラーレベルのログが記録されていること
    expect(mockLogger.logs).toContainEqual({
      level: 'error',
      message: 'タイムスタンプフィールド欠落のため除外：レコードID=B',
    });
  });
});