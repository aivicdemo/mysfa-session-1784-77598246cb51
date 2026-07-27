import { linkBillingDataToDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-290
  test('商談ステータス履歴に「受注」への更新記録が存在しないとき、紐付け対象外として処理される', () => {
    // 商談レコードを作成し、商談IDを記録する
    const dealId = 'DEAL-001';
    const deal = {
      id: dealId,
      customerId: 'CUST-001',
      amount: 500000,
      status: '失注',
      createdAt: new Date('2024-01-10T09:00:00Z'),
    };

    // 商談ステータス履歴テーブル：『見積提案』→『提案受領待ち』→『失注』の3件のステータス更新記録を挿入
    // （『受注』への更新記録は含めない）
    const dealStatusHistories = [
      {
        dealId: dealId,
        previousStatus: null,
        newStatus: '見積提案',
        changedAt: new Date('2024-01-10T09:00:00Z'),
      },
      {
        dealId: dealId,
        previousStatus: '見積提案',
        newStatus: '提案受領待ち',
        changedAt: new Date('2024-01-12T10:30:00Z'),
      },
      {
        dealId: dealId,
        previousStatus: '提案受領待ち',
        newStatus: '失注',
        changedAt: new Date('2024-01-15T14:45:00Z'),
      },
    ];

    // 請求データ1件を作成し、紐付け対象となる商談IDを設定する
    const billingData = {
      id: 'BILLING-001',
      customerId: 'CUST-001',
      dealId: dealId,
      amount: 500000,
      issuedAt: new Date('2024-01-16T11:00:00Z'),
      linkedDealId: null,
      linkingStatus: '未紐付け',
    };

    // 紐付け・可視化処理を実行する
    // （商談ステータス履歴から『受注』ステータスを検索し、該当する商談に対して請求データを紐付ける処理）
    const result = linkBillingDataToDeals(
      [deal],
      dealStatusHistories,
      [billingData],
    );

    // 対象商談に紐付けされた請求データの状態をクエリで確認する
    // 期待結果：商談ステータス履歴に『受注』への更新記録が存在しないため、
    // 当該商談は紐付け対象外として処理され、請求データは当該商談に紐付けされず、
    // 『linkedDealId』フィールドはnull、『linkingStatus』フィールドは『未紐付け』のままである
    const linkedBillingData = result.billingDataWithLinking.find(
      (b: any) => b.id === 'BILLING-001',
    );

    expect(linkedBillingData.linkedDealId).toBeNull();
    expect(linkedBillingData.linkingStatus).toBe('未紐付け');
    expect(result.unlinkedCount).toBe(1);
  });
});