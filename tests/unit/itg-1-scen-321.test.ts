import { generateMonthlyReportAcrossMonths } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-321
  test('月次決算レポート生成機能 - 月をまたぐ期間が指定されたとき、両月のレコードが正確に集計される', async () => {
    // Arrange: テスト用データベースレコードを準備
    const marchRecords = [
      { id: 'march_1', sales_amount: 1000000, transaction_date: new Date('2024-03-15') },
      { id: 'march_2', sales_amount: 2000000, transaction_date: new Date('2024-03-20') },
      { id: 'march_3', sales_amount: 3000000, transaction_date: new Date('2024-03-25') },
      { id: 'march_4', sales_amount: 1500000, transaction_date: new Date('2024-03-28') },
      { id: 'march_5', sales_amount: 2500000, transaction_date: new Date('2024-03-30') },
    ];

    const aprilRecords = [
      { id: 'april_1', sales_amount: 4000000, transaction_date: new Date('2024-04-02') },
      { id: 'april_2', sales_amount: 5000000, transaction_date: new Date('2024-04-05') },
      { id: 'april_3', sales_amount: 3500000, transaction_date: new Date('2024-04-10') },
    ];

    const allRecords = [...marchRecords, ...aprilRecords];

    // DocumentStorageAdapterのモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        file_id: 'mock_file_123',
        shared_link: 'https://drive.google.com/mock_link',
        upload_timestamp: new Date('2024-04-15T10:00:00Z'),
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const report_start_date = new Date('2024-03-31');
    const report_end_date = new Date('2024-04-01');

    // Act: レポート生成処理を実行
    const generatedReport = await generateMonthlyReportAcrossMonths(
      allRecords,
      report_start_date,
      report_end_date,
      mockDocumentStorageAdapter,
    );

    // Assert: 集計データの検証
    expect(generatedReport.march_total_sales).toBe(10000000); // 10+20+30+15+25 = 100万円
    expect(generatedReport.april_total_sales).toBe(12500000); // 40+50+35 = 125万円
    expect(generatedReport.combined_total_sales).toBe(22500000); // 100+125 = 225万円

    // Assert: レポートメタデータの検証
    expect(generatedReport.report_period).toBe('3月31日～4月1日');
    expect(generatedReport.report_generated_at).toBeDefined();

    // Assert: DocumentStorageAdapterへのアップロード呼び出し検証
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        report_content: expect.any(String),
        file_name: expect.stringContaining('monthly_report'),
      }),
    );

    // Assert: アップロード結果の検証
    expect(generatedReport.storage_file_id).toBe('mock_file_123');
    expect(generatedReport.shared_link).toBe('https://drive.google.com/mock_link');
  });
});