import { evaluateInvestmentDecision } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-297
  test('ROI試算が承認基準を下回る場合、投資判定が却下される', () => {
    const roi_trial_value = 10;
    const approval_threshold = 15;
    const result = evaluateInvestmentDecision({
      roi_trial_value,
      approval_threshold,
    });

    expect(result.decision).toBe('却下');
    expect(result.reason).toBe('ROI試算値が承認基準を下回っています');
  });
});