import { getCustomerActivityHistory } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-191
  test('商談・活動履歴の時系列表示機能 - ちょうど100件の商談・活動記録が表示され、101件目は除外される', () => {
    // テストデータとして101件の商談・活動記録を作成
    const activityRecords = Array.from({ length: 101 }, (_, index) => ({
      id: `activity_${index + 1}`,
      customerId: 'cust_001',
      recordType: index % 3 === 0 ? 'call' : index % 3 === 1 ? 'email' : 'visit',
      description: `Activity ${index + 1}`,
      activityDate: new Date('2024-01-01T00:00:00Z').getTime() + index * 86400000, // 1日ずつ差分を付与
    }));

    const dealRecords = Array.from({ length: 101 }, (_, index) => ({
      id: `deal_${index + 1}`,
      customerId: 'cust_001',
      dealName: `Deal ${index + 1}`,
      dealAmount: 10000 * (index + 1),
      status: index % 5 === 0 ? 'initial' : index % 5 === 1 ? 'proposal' : index % 5 === 2 ? 'negotiation' : index % 5 === 3 ? 'order' : 'lost',
      dealDate: new Date('2024-01-01T00:00:00Z').getTime() + index * 86400000,
    }));

    const allRecords = [...activityRecords, ...dealRecords].sort((a, b) => {
      const aDate = 'activityDate' in a ? a.activityDate : a.dealDate;
      const bDate = 'activityDate' in b ? b.activityDate : b.dealDate;
      return bDate - aDate;
    });

    // 機能を実行
    const result = getCustomerActivityHistory({
      customerId: 'cust_001',
      records: allRecords,
      maxRecordCount: 100,
      sortOrder: 'desc', // 最新順
    });

    // 101件のうち、100件だけが返却されることを確認
    expect(result.records.length).toBe(100);

    // 返却されたレコードが時系列順（新しい順）に並んでいることを確認
    for (let i = 0; i < result.records.length - 1; i++) {
      const currentDate = 'activityDate' in result.records[i] ? result.records[i].activityDate : result.records[i].dealDate;
      const nextDate = 'activityDate' in result.records[i + 1] ? result.records[i + 1].activityDate : result.records[i + 1].dealDate;
      expect(currentDate).toBeGreaterThanOrEqual(nextDate);
    }

    // 101件目のレコードが含まれていないことを確認
    const record101Id = `activity_101`;
    const deal101Id = `deal_101`;
    const recordIds = result.records.map((r) => r.id);
    expect(recordIds).not.toContain(record101Id);
    expect(recordIds).not.toContain(deal101Id);

    // 最初の記録（最新）の日付が最後の記録（古い）の日付より新しいことを確認
    if (result.records.length > 1) {
      const firstDate = 'activityDate' in result.records[0] ? result.records[0].activityDate : result.records[0].dealDate;
      const lastDate = 'activityDate' in result.records[result.records.length - 1] ? result.records[result.records.length - 1].activityDate : result.records[result.records.length - 1].dealDate;
      expect(firstDate).toBeGreaterThan(lastDate);
    }

    // キャッシュ状態が正常であることを確認
    expect(result.cacheStatus).toBe('valid');

    // トータルレコード数が正しく報告されることを確認
    expect(result.totalRecordCount).toBe(202);

    // 除外されたレコード数が1件であることを確認
    expect(result.excludedRecordCount).toBe(102);
  });
});