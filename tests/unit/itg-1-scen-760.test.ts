import { getAvailableStatusTransitions } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談ステータス遷移検証機能', () => {
  // SCEN-760
  test('ステータスマスタが1行のみの場合、遷移先の選択肢は限定される', () => {
    const statusMasterSingleRow = [
      {
        statusId: '01',
        statusName: '初期化',
        canTransition: true,
      },
    ];

    const currentDealId = 'DEAL_001';
    const currentStatus = '初期化';

    const availableTransitions = getAvailableStatusTransitions(
      currentDealId,
      currentStatus,
      statusMasterSingleRow
    );

    expect(availableTransitions).toEqual([
      {
        statusId: '01',
        statusName: '初期化',
        canTransition: true,
      },
    ]);

    expect(availableTransitions.length).toBe(1);

    const transitionNames = availableTransitions.map((t) => t.statusName);
    expect(transitionNames).toContain('初期化');
  });
});