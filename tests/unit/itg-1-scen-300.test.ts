import { judgeImplementationReadiness } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-300
  test('導入研修準備完了判定機能 - 研修実施率・マニュアル理解度・システム操作習熟度が全て基準を満たす場合、移行準備完了と判定される', () => {
    // 入力: 研修実施率100%、マニュアル理解度85%、システム操作習熟度85%（全て基準を満たす）
    const training_completion_rate = 100;
    const manual_comprehension_score = 85;
    const system_proficiency_score = 85;

    // 基準値
    const training_threshold = 100;
    const manual_threshold = 80;
    const proficiency_threshold = 80;

    const result = judgeImplementationReadiness({
      training_completion_rate,
      manual_comprehension_score,
      system_proficiency_score,
      training_threshold,
      manual_threshold,
      proficiency_threshold,
    });

    // 期待値: 移行準備完了と判定される
    expect(result).toEqual({
      is_ready: true,
      status: '完了',
      message: '移行準備完了',
      training_completion_rate: 100,
      manual_comprehension_score: 85,
      system_proficiency_score: 85,
    });
  });
});