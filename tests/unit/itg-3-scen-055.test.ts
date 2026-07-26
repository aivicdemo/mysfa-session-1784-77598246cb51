import { definePhaseBasedMigrationPlan } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('段階的移行計画の定義・検証機能', () => {
  // SCEN-055
  test('移行フェーズ数が0の場合、エラーが発生する', () => {
    const invalidPlanInput = {
      phaseCount: 0,
      milestones: [],
      riskFactors: [],
      mitigationStrategies: [],
    };

    expect(() => definePhaseBasedMigrationPlan(invalidPlanInput)).toThrow(/移行フェーズ数/);
  });
});