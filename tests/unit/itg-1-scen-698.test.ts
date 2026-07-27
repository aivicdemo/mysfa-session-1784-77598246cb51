import { detectAndRouteDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-698
  test('段階的対応ルーティング機能 - 照合結果が確定後、営業管理者への報告期限が2営業日前より早い場合、報告対象に含まれる', () => {
    // === 準備: テスト用照合対象データ ===
    // 照合確定日時を基準点 T0 として設定
    const reconciliationConfirmedAt = new Date('2024-04-15T09:00:00Z'); // T0
    
    // 営業日計算: T0 = 2024-04-15 (月曜) とすると
    // T0 + 1営業日 = 2024-04-16 (火曜)
    // T0 + 2営業日 = 2024-04-17 (水曜)
    // T0 + 2営業日より前 = 2024-04-16 (火曜) など
    const reportingDeadlineBeforeT2 = new Date('2024-04-16T18:00:00Z'); // T0 + 1営業日 (2営業日前より早い)
    
    // テスト入力データ
    const reconciliationResult = {
      reconciliation_id: 'RECON-2024-001',
      customer_id: 'CUST-A001',
      customer_name: '株式会社テスト商社',
      transaction_date: '2024-04-10',
      status: '受注',
      invoice_amount: 500000,
      invoice_issued_date: null, // 未請求
      reconciliation_status: 'confirmed', // 照合確定状態
      reconciliation_confirmed_at: reconciliationConfirmedAt,
      reporting_deadline: reportingDeadlineBeforeT2,
    };

    // === 実行: 段階的対応ルーティング機能を実行 ===
    const routingResult = detectAndRouteDelayedCases({
      reconciliation_result: reconciliationResult,
      evaluation_base_timestamp: new Date('2024-04-15T10:00:00Z'), // T0 から少し後
    });

    // === 検証 ===
    // 期待値: 報告対象リストに該当レコードが含まれ、報告対象フラグが true
    expect(routingResult.reporting_target_list).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reconciliation_id: 'RECON-2024-001',
          customer_id: 'CUST-A001',
          reporting_target_flag: true, // 報告対象フラグが true
        }),
      ])
    );

    // 報告対象の詳細情報を検証
    const targetRecord = routingResult.reporting_target_list.find(
      (record) => record.reconciliation_id === 'RECON-2024-001'
    );
    
    expect(targetRecord).toBeDefined();
    expect(targetRecord?.reconciliation_confirmed_at).toEqual(reconciliationConfirmedAt);
    expect(targetRecord?.reporting_deadline).toEqual(reportingDeadlineBeforeT2);
    expect(targetRecord?.reporting_target_flag).toBe(true);
    
    // 報告ステータスが「報告対象」に設定されている
    expect(targetRecord?.routing_status).toBe('ready_for_reporting');
  });
});