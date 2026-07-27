import { updateDealStatus } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-761: [normal] 商談ステータス遷移検証機能 - ステータスマスタが複数行の場合、有効な遷移ルールに従う
  test('ステータスマスタが複数行で、有効な遷移ルールに従ったステータス変更が成功し、無効な遷移は拒否される', () => {
    const statusMasterData = [
      {
        statusId: 1,
        statusName: '初期状態',
        allowedTransitions: [2],
      },
      {
        statusId: 2,
        statusName: '提案中',
        allowedTransitions: [3, 5],
      },
      {
        statusId: 3,
        statusName: '交渉中',
        allowedTransitions: [4, 5],
      },
      {
        statusId: 4,
        statusName: '受注',
        allowedTransitions: [6],
      },
      {
        statusId: 5,
        statusName: '失注',
        allowedTransitions: [6],
      },
      {
        statusId: 6,
        statusName: 'クローズ',
        allowedTransitions: [],
      },
    ];

    const dealRecord = {
      dealId: 'DEAL-001',
      dealName: 'テスト商談',
      currentStatusId: 1,
      amount: 1000000,
      customerId: 'CUST-001',
    };

    // ステップ4: 初期状態（1）→ 提案中（2）への遷移
    const result1 = updateDealStatus(
      dealRecord,
      2,
      statusMasterData,
    );
    expect(result1.success).toBe(true);
    expect(result1.updatedDealStatus).toBe(2);
    expect(result1.dealRecord.currentStatusId).toBe(2);

    // ステップ5: 提案中（2）→ 交渉中（3）への遷移
    const dealAfterStep4 = result1.dealRecord;
    const result2 = updateDealStatus(
      dealAfterStep4,
      3,
      statusMasterData,
    );
    expect(result2.success).toBe(true);
    expect(result2.updatedDealStatus).toBe(3);
    expect(result2.dealRecord.currentStatusId).toBe(3);

    // ステップ6: 交渉中（3）→ 受注（4）への遷移
    const dealAfterStep5 = result2.dealRecord;
    const result3 = updateDealStatus(
      dealAfterStep5,
      4,
      statusMasterData,
    );
    expect(result3.success).toBe(true);
    expect(result3.updatedDealStatus).toBe(4);
    expect(result3.dealRecord.currentStatusId).toBe(4);

    // ステップ7: 受注（4）→ 提案中（2）への無効な逆戻り遷移を試行
    const dealAfterStep6 = result3.dealRecord;
    expect(() => {
      updateDealStatus(
        dealAfterStep6,
        2,
        statusMasterData,
      );
    }).toThrow(/ステータス遷移/);

    // ステップ9: 最終的な商談ステータスが「受注」のまま変わらないことを確認
    const finalDealStatus = dealAfterStep6.currentStatusId;
    expect(finalDealStatus).toBe(4);
  });
});