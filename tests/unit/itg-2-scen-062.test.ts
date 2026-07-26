import { markUnbilledDeals } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-062
  test('未請求案件フラグ付与機能 - 商談ステータス「受注」で請求書発行予定日が設定されている場合、月次集計時に未請求フラグが正しく付与される', () => {
    // テストデータ作成: 商談ステータスが『受注』で請求書発行予定日が設定されている案件
    const deal_id_1 = 'DEAL-001';
    const deal_status = '受注';
    const billing_scheduled_date = '2024-02-15';
    const is_billed_initial = false;

    const input_deals = [
      {
        deal_id: deal_id_1,
        deal_status: deal_status,
        billing_scheduled_date: billing_scheduled_date,
        is_unbilled: is_billed_initial,
      },
    ];

    // 初期状態の確認: 未請求フラグが付与されていないことを検証
    const initial_unbilled_flag = input_deals[0].is_unbilled;
    expect(initial_unbilled_flag).toBe(false);

    // 月次集計処理を実行
    const current_date = '2024-02-20';
    const result_deals = markUnbilledDeals(input_deals, current_date);

    // 集計処理後、対象案件の未請求フラグの状態を確認
    expect(result_deals).toHaveLength(1);
    expect(result_deals[0].deal_id).toBe(deal_id_1);
    expect(result_deals[0].deal_status).toBe(deal_status);

    // 未請求フラグが正しく付与されていることをアサート
    expect(result_deals[0].is_unbilled).toBe(true);
    expect(result_deals[0].billing_scheduled_date).toBe(billing_scheduled_date);
  });
});