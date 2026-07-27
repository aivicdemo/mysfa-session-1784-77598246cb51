import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-793
  test('請求対象データ抽出機能 - 月をまたぐ期間で抽出するとき、期間内の全データが正しく抽出される', () => {
    // テストデータの準備
    const testData = [
      // 2024年1月14日のデータ（除外されるべき）
      {
        id: '001',
        transactionDate: new Date('2024-01-14T09:00:00Z'),
        amount: 50000,
        customerId: 'C001',
        dealStatus: 'won',
      },
      // 2024年1月15日のデータ（含まれるべき）
      {
        id: '002',
        transactionDate: new Date('2024-01-15T10:00:00Z'),
        amount: 75000,
        customerId: 'C002',
        dealStatus: 'won',
      },
      {
        id: '003',
        transactionDate: new Date('2024-01-15T14:30:00Z'),
        amount: 120000,
        customerId: 'C003',
        dealStatus: 'won',
      },
      // 2024年1月31日のデータ（含まれるべき）
      {
        id: '004',
        transactionDate: new Date('2024-01-31T11:00:00Z'),
        amount: 85000,
        customerId: 'C004',
        dealStatus: 'won',
      },
      {
        id: '005',
        transactionDate: new Date('2024-01-31T15:45:00Z'),
        amount: 95000,
        customerId: 'C005',
        dealStatus: 'won',
      },
      // 2024年2月1日のデータ（含まれるべき）
      {
        id: '006',
        transactionDate: new Date('2024-02-01T08:00:00Z'),
        amount: 110000,
        customerId: 'C006',
        dealStatus: 'won',
      },
      {
        id: '007',
        transactionDate: new Date('2024-02-01T09:30:00Z'),
        amount: 65000,
        customerId: 'C007',
        dealStatus: 'won',
      },
      {
        id: '008',
        transactionDate: new Date('2024-02-01T13:00:00Z'),
        amount: 140000,
        customerId: 'C008',
        dealStatus: 'won',
      },
      {
        id: '009',
        transactionDate: new Date('2024-02-01T16:20:00Z'),
        amount: 55000,
        customerId: 'C009',
        dealStatus: 'won',
      },
      // 2024年2月28日のデータ（含まれるべき）
      {
        id: '010',
        transactionDate: new Date('2024-02-28T10:00:00Z'),
        amount: 100000,
        customerId: 'C010',
        dealStatus: 'won',
      },
      {
        id: '011',
        transactionDate: new Date('2024-02-28T12:30:00Z'),
        amount: 88000,
        customerId: 'C011',
        dealStatus: 'won',
      },
      {
        id: '012',
        transactionDate: new Date('2024-02-28T17:00:00Z'),
        amount: 92000,
        customerId: 'C012',
        dealStatus: 'won',
      },
      // 2024年3月1日のデータ（除外されるべき）
      {
        id: '013',
        transactionDate: new Date('2024-03-01T09:00:00Z'),
        amount: 70000,
        customerId: 'C013',
        dealStatus: 'won',
      },
    ];

    // 抽出条件の設定
    const extractionCriteria = {
      startDate: new Date('2024-01-15T00:00:00Z'),
      endDate: new Date('2024-02-28T23:59:59Z'),
      statusFilter: 'won',
    };

    // 抽出機能の実行
    const extractedData = extractBillingTargetData(testData, extractionCriteria);

    // 検証：抽出結果は全12件
    expect(extractedData).toHaveLength(12);

    // 検証：すべてのレコードが指定期間内に存在
    extractedData.forEach((record) => {
      expect(record.transactionDate.getTime()).toBeGreaterThanOrEqual(
        extractionCriteria.startDate.getTime()
      );
      expect(record.transactionDate.getTime()).toBeLessThanOrEqual(
        extractionCriteria.endDate.getTime()
      );
    });

    // 検証：抽出されたレコードのIDが正しい（1月14日と3月1日のデータは含まれない）
    const extractedIds = extractedData.map((r) => r.id).sort();
    const expectedIds = [
      '002',
      '003',
      '004',
      '005',
      '006',
      '007',
      '008',
      '009',
      '010',
      '011',
      '012',
    ].sort();
    expect(extractedIds).toEqual(expectedIds);

    // 検証：1月15日以降のデータが含まれている
    const jan15AndAfter = extractedData.filter(
      (r) =>
        r.transactionDate.getTime() >=
        new Date('2024-01-15T00:00:00Z').getTime()
    );
    expect(jan15AndAfter).toHaveLength(12);

    // 検証：データ内訳の確認
    const jan15Data = extractedData.filter(
      (r) =>
        r.transactionDate.getTime() >=
          new Date('2024-01-15T00:00:00Z').getTime() &&
        r.transactionDate.getTime() < new Date('2024-01-16T00:00:00Z').getTime()
    );
    expect(jan15Data).toHaveLength(2);

    const jan31Data = extractedData.filter(
      (r) =>
        r.transactionDate.getTime() >=
          new Date('2024-01-31T00:00:00Z').getTime() &&
        r.transactionDate.getTime() < new Date('2024-02-01T00:00:00Z').getTime()
    );
    expect(jan31Data).toHaveLength(2);

    const feb01Data = extractedData.filter(
      (r) =>
        r.transactionDate.getTime() >=
          new Date('2024-02-01T00:00:00Z').getTime() &&
        r.transactionDate.getTime() < new Date('2024-02-02T00:00:00Z').getTime()
    );
    expect(feb01Data).toHaveLength(4);

    const feb28Data = extractedData.filter(
      (r) =>
        r.transactionDate.getTime() >=
          new Date('2024-02-28T00:00:00Z').getTime() &&
        r.transactionDate.getTime() <=
          new Date('2024-02-28T23:59:59Z').getTime()
    );
    expect(feb28Data).toHaveLength(3);

    // 検証：除外されるべきデータ（1月14日以前、3月1日以降）が含まれていない
    const hasExcludedData = extractedData.some(
      (r) =>
        r.id === '001' || r.id === '013' ||
        r.transactionDate.getTime() < extractionCriteria.startDate.getTime() ||
        r.transactionDate.getTime() > extractionCriteria.endDate.getTime()
    );
    expect(hasExcludedData).toBe(false);
  });
});