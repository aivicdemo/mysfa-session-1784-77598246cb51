import { getCustomerTimelineRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-394
  test('商談と活動記録が100件ジャストのとき、すべて100件が返される', () => {
    const customerId = 'CUST-001';
    const now = new Date('2024-03-15T10:00:00Z');

    // 商談レコード50件を作成（タイムスタンプは新しいものから古いものへ）
    const deals = Array.from({ length: 50 }, (_, i) => ({
      id: `DEAL-${String(i + 1).padStart(3, '0')}`,
      customerId,
      type: 'deal',
      title: `Deal ${i + 1}`,
      createdAt: new Date(now.getTime() - i * 3600000), // 1時間ずつ前
      status: 'active',
    }));

    // 活動記録50件を作成（タイムスタンプは新しいものから古いものへ）
    const activities = Array.from({ length: 50 }, (_, i) => ({
      id: `ACT-${String(i + 1).padStart(3, '0')}`,
      customerId,
      type: 'activity',
      activityType: 'email',
      description: `Activity ${i + 1}`,
      createdAt: new Date(now.getTime() - (50 + i) * 3600000), // 商談より古い時期
      completedAt: new Date(now.getTime() - (50 + i) * 3600000),
    }));

    const allRecords = [...deals, ...activities];

    // 実際に返されるべき結果：100件のレコードが最新順（降順）に並んでいる
    const expectedRecords = allRecords
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 100);

    // 関数呼び出し
    const result = getCustomerTimelineRecords(customerId, allRecords);

    // アサーション：件数確認
    expect(result.length).toBe(100);

    // アサーション：すべての商談50件が含まれているか
    const dealIds = new Set(deals.map(d => d.id));
    const resultDealIds = new Set(
      result.filter(r => r.type === 'deal').map(r => r.id)
    );
    expect(resultDealIds.size).toBe(50);
    expect(Array.from(resultDealIds)).toEqual(expect.arrayContaining(Array.from(dealIds)));

    // アサーション：すべての活動記録50件が含まれているか
    const activityIds = new Set(activities.map(a => a.id));
    const resultActivityIds = new Set(
      result.filter(r => r.type === 'activity').map(r => r.id)
    );
    expect(resultActivityIds.size).toBe(50);
    expect(Array.from(resultActivityIds)).toEqual(
      expect.arrayContaining(Array.from(activityIds))
    );

    // アサーション：時系列順序（新しい順）を確認
    for (let i = 0; i < result.length - 1; i++) {
      const current = result[i];
      const next = result[i + 1];
      expect(current.createdAt.getTime()).toBeGreaterThanOrEqual(next.createdAt.getTime());
    }

    // アサーション：重複がないか確認
    const resultIds = new Set(result.map(r => r.id));
    expect(resultIds.size).toBe(100);
  });
});