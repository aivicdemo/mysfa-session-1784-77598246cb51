import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('月次決算レポート生成 - 売上実績集計の精度検証', () => {
  test('SCEN-328: 兆円規模の売上実績が高精度で集計される', () => {
    // 期待値: 1兆2345億6789万円（1,234,567,890,000円）
    const expectedTotalRevenue = 1234567890000n;

    // テストデータ: 複数の営業取引レコード（各レコードは数百億〜数千億円規模）
    const revenueRecords = [
      {
        recordId: 'REC-001',
        amount: 500000000000n, // 5000億円
        dealDate: '2024-04-01',
        dealStatus: '受注',
        customerId: 'CUST-001',
      },
      {
        recordId: 'REC-002',
        amount: 350000000000n, // 3500億円
        dealDate: '2024-04-05',
        dealStatus: '受注',
        customerId: 'CUST-002',
      },
      {
        recordId: 'REC-003',
        amount: 200000000000n, // 2000億円
        dealDate: '2024-04-10',
        dealStatus: '完了',
        customerId: 'CUST-003',
      },
      {
        recordId: 'REC-004',
        amount: 184567890000n, // 1845億6789万円
        dealDate: '2024-04-15',
        dealStatus: '受注',
        customerId: 'CUST-004',
      },
    ];

    // 月次決算レポート生成処理を実行
    const reportInput = {
      targetPeriodStart: '2024-04-01',
      targetPeriodEnd: '2024-04-30',
      revenueRecords: revenueRecords,
    };

    const generatedReport = generateMonthlyRevenueReport(reportInput);

    // 集計結果の検証
    expect(generatedReport.totalRevenue).toBe(expectedTotalRevenue);

    // レポート出力形式での数値精度確認
    expect(generatedReport.totalRevenueAsString).toBe('1234567890000');
    expect(typeof generatedReport.totalRevenueAsString).toBe('string');

    // フロントエンド表示形式での精度確認（万円単位・カンマ区切り）
    expect(generatedReport.displayFormatRevenue).toBe('1兆2,345億6,789万円');

    // レコード数の検証
    expect(generatedReport.recordCount).toBe(4);

    // 受注件数の検証
    expect(generatedReport.confirmedOrderCount).toBe(3);

    // メタデータ検証
    expect(generatedReport.aggregationStart).toBe('2024-04-01');
    expect(generatedReport.aggregationEnd).toBe('2024-04-30');
    expect(generatedReport.generatedAt).toBeDefined();

    // 内部精度チェック: 各レコードの金額が正確に保持されている
    expect(generatedReport.recordDetails).toHaveLength(4);
    expect(generatedReport.recordDetails[0].amount).toBe(500000000000n);
    expect(generatedReport.recordDetails[1].amount).toBe(350000000000n);
    expect(generatedReport.recordDetails[2].amount).toBe(200000000000n);
    expect(generatedReport.recordDetails[3].amount).toBe(184567890000n);

    // 合計の手計算確認
    const manualSum = 500000000000n + 350000000000n + 200000000000n + 184567890000n;
    expect(manualSum).toBe(expectedTotalRevenue);
    expect(generatedReport.totalRevenue).toBe(manualSum);
  });
});