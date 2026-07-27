import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談ステータス遷移検証機能', () => {
  // SCEN-755
  test('同じ遷移ルールを2回検証した場合、同じ結果が得られる', () => {
    const testDataSet = {
      currentStatus: '見積提出',
      targetStatus: '商談進行中',
      transitionCondition: '顧客から返信あり',
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
    };

    const transitionRule = {
      from: '見積提出',
      to: '商談進行中',
      requiredCondition: '顧客から返信あり',
    };

    // 第1回目の検証実行
    const firstResult = validateDealStatusTransition(
      testDataSet.currentStatus,
      testDataSet.targetStatus,
      testDataSet.transitionCondition,
      transitionRule
    );

    const firstIsAllowed = firstResult.isAllowed;
    const firstMessage = firstResult.message;
    const firstNewStatus = firstResult.newStatus;
    const firstTimestamp = firstResult.timestamp;

    // 第2回目の検証実行（同じテストデータセットと遷移ルール）
    const secondResult = validateDealStatusTransition(
      testDataSet.currentStatus,
      testDataSet.targetStatus,
      testDataSet.transitionCondition,
      transitionRule
    );

    const secondIsAllowed = secondResult.isAllowed;
    const secondMessage = secondResult.message;
    const secondNewStatus = secondResult.newStatus;
    const secondTimestamp = secondResult.timestamp;

    // 遷移可否判定結果の一致を確認
    expect(firstIsAllowed).toBe(secondIsAllowed);

    // 遷移が許可される場合の検証
    if (firstIsAllowed && secondIsAllowed) {
      expect(firstNewStatus).toBe('商談進行中');
      expect(secondNewStatus).toBe('商談進行中');
      expect(firstNewStatus).toBe(secondNewStatus);
    }

    // 拒否理由の一致を確認
    expect(firstMessage).toBe(secondMessage);

    // 戻り値の型と内容の一致を確認
    expect(typeof firstIsAllowed).toBe(typeof secondIsAllowed);
    expect(typeof firstMessage).toBe(typeof secondMessage);
    expect(typeof firstNewStatus).toBe(typeof secondNewStatus);
    expect(firstNewStatus).toEqual(secondNewStatus);

    // 検証タイムスタンプが正しい形式であることを確認
    expect(typeof firstTimestamp).toBe('string');
    expect(typeof secondTimestamp).toBe('string');
  });
});