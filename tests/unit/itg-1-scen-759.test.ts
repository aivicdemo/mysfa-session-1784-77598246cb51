import { initializeStatusValidator, validateTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  test('SCEN-759: ステータスマスタが空の場合、すべての遷移検証は失敗する', () => {
    // Arrange: ステータスマスタが空であることをシミュレート
    const emptyStatusMaster: Array<{ statusId: string; statusName: string }> = [];

    // Act & Assert: initializeStatusValidator を呼び出し、ステータスマスタが空であることを確認
    const initResult = initializeStatusValidator(emptyStatusMaster);
    expect(initResult).toBe(false);

    // Arrange: 商談オブジェクトを作成し、初期ステータスを「新規」に設定
    const dealRecord = {
      dealId: 'DEAL-001',
      currentStatus: '新規',
      targetStatus: '提案中',
    };

    // Act & Assert: 「新規」から「提案中」への遷移を試行
    expect(() => {
      validateTransition(dealRecord.currentStatus, dealRecord.targetStatus, emptyStatusMaster);
    }).toThrow(/ステータスマスタ/);

    // Act & Assert: 「新規」から「成約」への遷移パターンを検証
    const dealRecord2 = {
      dealId: 'DEAL-002',
      currentStatus: '新規',
      targetStatus: '成約',
    };
    expect(() => {
      validateTransition(dealRecord2.currentStatus, dealRecord2.targetStatus, emptyStatusMaster);
    }).toThrow(/ステータスマスタ/);

    // Act & Assert: 「提案中」から「失注」への遷移パターンを検証
    const dealRecord3 = {
      dealId: 'DEAL-003',
      currentStatus: '提案中',
      targetStatus: '失注',
    };
    expect(() => {
      validateTransition(dealRecord3.currentStatus, dealRecord3.targetStatus, emptyStatusMaster);
    }).toThrow(/ステータスマスタ/);
  });
});