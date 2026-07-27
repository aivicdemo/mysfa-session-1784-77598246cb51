import { assignActionItemsForConfirmedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-705
  test('段階的対応ルーティング機能 - 照合結果が確定後、営業担当者への対応指示対象案件が複数件の場合、全案件に対応指示が割り当てられる', () => {
    // テストデータ準備: 照合結果が『確定』状態の営業案件3件
    const dealA = {
      deal_id: 'DEAL-A-001',
      customer_id: 'CUST-0001',
      deal_name: '案件A',
      deal_amount: 5000000,
      deal_status: '受注',
      invoice_issued_date: null,
      reconciliation_status: '確定',
      assigned_salesperson_id: 'SALES-X-001',
      assigned_salesperson_name: '営業担当者X'
    };

    const dealB = {
      deal_id: 'DEAL-B-002',
      customer_id: 'CUST-0002',
      deal_name: '案件B',
      deal_amount: 3000000,
      deal_status: '受注',
      invoice_issued_date: null,
      reconciliation_status: '確定',
      assigned_salesperson_id: 'SALES-Y-002',
      assigned_salesperson_name: '営業担当者Y'
    };

    const dealC = {
      deal_id: 'DEAL-C-003',
      customer_id: 'CUST-0003',
      deal_name: '案件C',
      deal_amount: 2000000,
      deal_status: '受注',
      invoice_issued_date: null,
      reconciliation_status: '確定',
      assigned_salesperson_id: 'SALES-Z-003',
      assigned_salesperson_name: '営業担当者Z'
    };

    const confirmedDeals = [dealA, dealB, dealC];

    // 各案件に対して、営業担当者への対応指示が未割り当て状態であることを確認
    const actionItemsBeforeAssignment = confirmedDeals.map(deal => ({
      deal_id: deal.deal_id,
      action_item_id: null,
      assigned_to_salesperson_id: null,
      assigned_to_salesperson_name: null,
      action_status: null,
      created_at: null
    }));

    actionItemsBeforeAssignment.forEach(item => {
      expect(item.action_item_id).toBeNull();
      expect(item.assigned_to_salesperson_id).toBeNull();
    });

    // 段階的対応ルーティング機能を実行
    const result = assignActionItemsForConfirmedDeals(confirmedDeals);

    // システムが対応指示対象の案件（案件A、案件B、案件C）を自動検出することを確認
    expect(result.detected_deal_count).toBe(3);
    expect(result.detected_deals).toHaveLength(3);
    expect(result.detected_deals.map((d: any) => d.deal_id)).toEqual(['DEAL-A-001', 'DEAL-B-002', 'DEAL-C-003']);

    // 各案件に対して対応指示レコードが生成されたことを確認
    expect(result.assigned_action_items).toHaveLength(3);

    // 案件Aの対応指示が『営業担当者X』に割り当てられていることを確認
    const actionItemA = result.assigned_action_items[0];
    expect(actionItemA.deal_id).toBe('DEAL-A-001');
    expect(actionItemA.assigned_to_salesperson_id).toBe('SALES-X-001');
    expect(actionItemA.assigned_to_salesperson_name).toBe('営業担当者X');
    expect(actionItemA.action_item_id).not.toBeNull();

    // 案件Bの対応指示が『営業担当者Y』に割り当てられていることを確認
    const actionItemB = result.assigned_action_items[1];
    expect(actionItemB.deal_id).toBe('DEAL-B-002');
    expect(actionItemB.assigned_to_salesperson_id).toBe('SALES-Y-002');
    expect(actionItemB.assigned_to_salesperson_name).toBe('営業担当者Y');
    expect(actionItemB.action_item_id).not.toBeNull();

    // 案件Cの対応指示が『営業担当者Z』に割り当てられていることを確認
    const actionItemC = result.assigned_action_items[2];
    expect(actionItemC.deal_id).toBe('DEAL-C-003');
    expect(actionItemC.assigned_to_salesperson_id).toBe('SALES-Z-003');
    expect(actionItemC.assigned_to_salesperson_name).toBe('営業担当者Z');
    expect(actionItemC.action_item_id).not.toBeNull();

    // 各対応指示のステータスが『未対応』で初期化されていることを確認
    expect(actionItemA.action_status).toBe('未対応');
    expect(actionItemB.action_status).toBe('未対応');
    expect(actionItemC.action_status).toBe('未対応');

    // 各対応指示の作成タイムスタンプが同一バッチ処理内のものであることを確認
    const createdAtA = new Date(actionItemA.created_at).getTime();
    const createdAtB = new Date(actionItemB.created_at).getTime();
    const createdAtC = new Date(actionItemC.created_at).getTime();
    
    const maxTimeDifference = Math.max(
      Math.abs(createdAtA - createdAtB),
      Math.abs(createdAtB - createdAtC),
      Math.abs(createdAtA - createdAtC)
    );
    
    expect(maxTimeDifference).toBeLessThanOrEqual(1000);

    // 全対応指示の作成日時が同一バッチ内で記録されていることを確認
    expect(result.batch_processed_at).not.toBeNull();
    expect(result.total_action_items_assigned).toBe(3);
  });
});