import { detectAndRouteStaginedActions } from '../../src/logic/it-1784969823049-1-1-1';

describe('段階的対応ルーティング機能 - 照合結果確定後の営業担当者割り当て判定', () => {
  test('SCEN-702: 対応指示期限が1営業日後の場合、ルーティング対象外と判定される', () => {
    // Setup: テストデータセット準備
    const reconciliationId = 'RECONCILIATION-2024-001';
    const customerId = 'CUSTOMER-A-001';
    const salesPersonId = 'SALESPERSON-B-001';
    
    // 本日を2024年1月15日（月）に固定
    const todayDate = new Date('2024-01-15T09:00:00Z');
    
    // 対応指示期限を2024年1月16日（火）の09:00に設定（1営業日後）
    const actionInstructionDeadline = new Date('2024-01-16T09:00:00Z');
    
    // 照合結果イベント（ステータス='確定'）
    const reconciliationEvent = {
      reconciliationId,
      customerId,
      status: 'confirmed' as const,
      confirmedAt: todayDate,
      unreportedItems: [],
      delayedItems: []
    };
    
    // 対応指示レコード
    const actionInstruction = {
      id: 'ACTION-INSTR-001',
      customerId,
      salesPersonId,
      deadline: actionInstructionDeadline,
      createdAt: todayDate
    };
    
    // Act: 段階的対応ルーティング機能を実行
    const routingResult = detectAndRouteStaginedActions(
      reconciliationEvent,
      [actionInstruction],
      todayDate
    );
    
    // Assert: 対応指示対象に営業担当者Bが含まれていないことを確認
    expect(routingResult.assignedSalesPersonIds).toEqual([]);
    expect(routingResult.routedActionInstructions).toEqual([]);
    expect(routingResult.exclusionReason).toMatch(/期限.*本日より遅い/);
    expect(routingResult.isExcluded).toBe(true);
  });
});