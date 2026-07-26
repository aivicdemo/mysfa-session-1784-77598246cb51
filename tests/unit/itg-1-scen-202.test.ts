import { extractBillingTargetDeals } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-202
  test('請求タイプ判定と請求対象商談の自動抽出機能 - 請求対象の境界値が正確に判定される', () => {
    const billing_period_start = new Date('2024-04-01T00:00:00Z');
    const billing_period_end = new Date('2024-04-30T23:59:59Z');

    // テストケース1: 契約開始日が請求対象期間の開始日と一致する商談
    const deal_1 = {
      deal_id: 'DEAL_001',
      customer_name: 'Customer A',
      contract_start_date: new Date('2024-04-01T00:00:00Z'),
      deal_amount: 100000,
      status: 'won',
    };

    // テストケース2: 契約開始日が請求対象期間の中間にある商談
    const deal_2 = {
      deal_id: 'DEAL_002',
      customer_name: 'Customer B',
      contract_start_date: new Date('2024-04-15T00:00:00Z'),
      deal_amount: 150000,
      status: 'won',
    };

    // テストケース3: 契約開始日が請求対象期間の終了日と一致する商談
    const deal_3 = {
      deal_id: 'DEAL_003',
      customer_name: 'Customer C',
      contract_start_date: new Date('2024-04-30T00:00:00Z'),
      deal_amount: 200000,
      status: 'won',
    };

    // テストケース4: 契約開始日が請求対象期間より1日前の商談
    const deal_4 = {
      deal_id: 'DEAL_004',
      customer_name: 'Customer D',
      contract_start_date: new Date('2024-03-31T00:00:00Z'),
      deal_amount: 120000,
      status: 'won',
    };

    // テストケース5: 契約開始日が請求対象期間より1日後の商談
    const deal_5 = {
      deal_id: 'DEAL_005',
      customer_name: 'Customer E',
      contract_start_date: new Date('2024-05-01T00:00:00Z'),
      deal_amount: 180000,
      status: 'won',
    };

    // テストケース6: ステータスが『受注』以外の商談
    const deal_6 = {
      deal_id: 'DEAL_006',
      customer_name: 'Customer F',
      contract_start_date: new Date('2024-04-10T00:00:00Z'),
      deal_amount: 90000,
      status: 'lost',
    };

    const all_deals = [deal_1, deal_2, deal_3, deal_4, deal_5, deal_6];

    const result = extractBillingTargetDeals(
      all_deals,
      billing_period_start,
      billing_period_end
    );

    // 期待結果: deal_1, deal_2, deal_3, deal_4 が請求対象として抽出される
    // deal_4は契約開始日が請求対象期間より前だが、請求対象に含まれる（契約が既に開始している）
    // deal_5はステータスは『受注』だが、契約開始日が請求対象期間より後なので除外される
    // deal_6はステータスが『受注』以外なので除外される

    expect(result).toHaveLength(4);
    
    // 抽出された商談が正しいことを確認
    const extracted_deal_ids = result.map((deal: any) => deal.deal_id).sort();
    expect(extracted_deal_ids).toEqual(['DEAL_001', 'DEAL_002', 'DEAL_003', 'DEAL_004']);

    // deal_1の検証: 契約開始日が請求対象期間の開始日と一致
    const extracted_deal_1 = result.find((d: any) => d.deal_id === 'DEAL_001');
    expect(extracted_deal_1.contract_start_date).toEqual(new Date('2024-04-01T00:00:00Z'));
    expect(extracted_deal_1.deal_amount).toBe(100000);
    expect(extracted_deal_1.status).toBe('won');

    // deal_3の検証: 契約開始日が請求対象期間の終了日と一致
    const extracted_deal_3 = result.find((d: any) => d.deal_id === 'DEAL_003');
    expect(extracted_deal_3.contract_start_date).toEqual(new Date('2024-04-30T00:00:00Z'));
    expect(extracted_deal_3.deal_amount).toBe(200000);

    // deal_4の検証: 契約開始日が請求対象期間より前
    const extracted_deal_4 = result.find((d: any) => d.deal_id === 'DEAL_004');
    expect(extracted_deal_4.contract_start_date).toEqual(new Date('2024-03-31T00:00:00Z'));
    expect(extracted_deal_4.deal_amount).toBe(120000);

    // deal_5が除外されていることを確認
    expect(result.find((d: any) => d.deal_id === 'DEAL_005')).toBeUndefined();

    // deal_6が除外されていることを確認
    expect(result.find((d: any) => d.deal_id === 'DEAL_006')).toBeUndefined();

    // 合計金額の検証: 100000 + 150000 + 200000 + 120000 = 570000
    const total_amount = result.reduce((sum: number, deal: any) => sum + deal.deal_amount, 0);
    expect(total_amount).toBe(570000);
  });
});