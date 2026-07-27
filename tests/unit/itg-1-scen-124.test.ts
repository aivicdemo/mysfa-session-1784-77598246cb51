import { checkMonthlyReportDeadlineAndExtractData } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-124
  test('月次報告期限到来を確認するアクティビティのステータスが完了以外の場合、データ抽出は実行されない', () => {
    const mockDataExtractor = jest.fn();
    const mockLogger = jest.fn();

    const activity = {
      id: 'activity-001',
      type: 'monthly_report_deadline_check',
      status: 'in_progress',
      deadline_date: new Date('2024-01-15T00:00:00Z'),
      created_at: new Date('2024-01-15T09:00:00Z'),
    };

    const currentDate = new Date('2024-01-15T10:00:00Z');

    checkMonthlyReportDeadlineAndExtractData({
      activity,
      currentDate,
      dataExtractor: mockDataExtractor,
      logger: mockLogger,
    });

    expect(mockDataExtractor).not.toHaveBeenCalled();
    expect(mockDataExtractor).toHaveBeenCalledTimes(0);

    expect(mockLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        activity_id: 'activity-001',
        message: expect.stringMatching(/完了|スキップ/),
        level: 'info',
      })
    );
  });
});