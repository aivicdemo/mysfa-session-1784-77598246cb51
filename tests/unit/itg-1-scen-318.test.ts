import { calculateInitialConstructionCost } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-318
  test('初期構築コストが負の値で入力された場合にバリデーションエラーが検出される', () => {
    const negativeConstructionCost = -50000;

    expect(() => {
      calculateInitialConstructionCost({
        developmentScale: 'medium',
        developmentDays: 180,
        teamSize: 5,
        initialConstructionCost: negativeConstructionCost,
      });
    }).toThrow(/初期構築コスト/);
  });
});