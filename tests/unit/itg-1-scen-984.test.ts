import { validateMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-984
  test('不整合件数が許容閾値より1件多い場合、移行不完了として判定される', () => {
    const toleranceThreshold = 5;
    const inconsistencyCount = 6;

    const result = validateMigrationCompletion({
      toleranceThreshold,
      inconsistencyCount,
    });

    expect(result.isComplete).toBe(false);
    expect(result.status).toBe('INCOMPLETE');
    expect(result.reason).toBe(
      `不整合件数 ${inconsistencyCount} 件は許容閾値 ${toleranceThreshold} 件を超過`
    );
  });
});