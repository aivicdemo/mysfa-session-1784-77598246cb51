import { updateDealStatusToContracting } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-235
  test('商談ステータス更新・請求データ紐付け機能 - 商談ステータスを成約に変更する際、商談進捗ステータスマスタで成約が有効な選択肢である場合にステータス更新が成功する', () => {
    // 商談進捗ステータスマスタのセットアップ
    const statusMasterData = [
      { id: 'status_001', name: '初期接触', enabled: true },
      { id: 'status_002', name: '提案中', enabled: true },
      { id: 'status_003', name: '交渉中', enabled: true },
      { id: 'status_004', name: '成約', enabled: true },
      { id: 'status_005', name: '失注', enabled: true },
    ];

    // 成約ステータスが有効であることを確認
    const contracting_status = statusMasterData.find(
      (s) => s.name === '成約' && s.enabled === true
    );
    expect(contracting_status).toBeDefined();
    expect(contracting_status?.enabled).toBe(true);

    // テスト用の商談レコード（現在のステータスを「交渉中」に設定）
    const deal_id = 'deal_001';
    const customer_id = 'cust_001';
    const current_status = '交渉中';
    const deal_amount = 1500000;
    const billing_reference_id = 'bill_ref_001';
    const created_at = new Date('2024-01-15T10:00:00Z');
    const current_timestamp = new Date('2024-01-15T14:30:00Z');

    // 商談ステータス更新のリクエスト
    const update_request = {
      deal_id: deal_id,
      customer_id: customer_id,
      new_status: '成約',
      updated_at: current_timestamp,
    };

    // APIを呼び出し
    const result = updateDealStatusToContracting(
      update_request,
      statusMasterData,
      current_timestamp
    );

    // APIレスポンスのステータスコードが200（成功）であることを確認
    expect(result.status_code).toBe(200);

    // 商談レコードのステータスフィールドが「成約」に更新されていることを検証
    expect(result.updated_deal.deal_id).toBe(deal_id);
    expect(result.updated_deal.status).toBe('成約');
    expect(result.updated_deal.customer_id).toBe(customer_id);

    // 商談の更新日時が現在時刻に近い値に変更されていることを確認
    expect(result.updated_deal.updated_at).toEqual(current_timestamp);

    // 商談に紐付く請求データが存在する場合、参照整合性が保たれていることを確認
    if (result.updated_deal.billing_reference_id) {
      expect(result.updated_deal.billing_reference_id).toBe(
        billing_reference_id
      );
      expect(result.billing_data_integrity).toBe(true);
    }

    // ステータス遷移履歴が記録されていることを確認
    expect(result.status_history_recorded).toBe(true);
    expect(result.status_history).toHaveLength(1);
    expect(result.status_history[0].from_status).toBe('交渉中');
    expect(result.status_history[0].to_status).toBe('成約');
    expect(result.status_history[0].changed_at).toEqual(current_timestamp);
  });
});