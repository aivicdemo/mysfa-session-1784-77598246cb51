import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-115
  test('当月売上集計機能 - 提案数が0の場合に進捗率計算がエラーとなる', () => {
    // 前提: 営業担当者が月次報告期限までに営業管理システムからデータを抽出し、
    // 当月の売上合計、受注件数、進捗率を計算する必要がある状態
    
    // 正常系: 提案数が存在する場合、進捗率が正しく計算される
    const validInput1 = {
      proposalCount: 10,
      closedDealCount: 7,
    };
    expect(calculateMonthlyProgressRate(validInput1)).toBe(70);

    const validInput2 = {
      proposalCount: 5,
      closedDealCount: 2,
    };
    expect(calculateMonthlyProgressRate(validInput2)).toBe(40);

    // エラー系: 提案数が0の場合、ゼロ除算エラーが発生せず、
    // 適切なエラーメッセージが返される
    const invalidInput = {
      proposalCount: 0,
      closedDealCount: 0,
    };
    expect(() => calculateMonthlyProgressRate(invalidInput)).toThrow(/提案数/);

    // 境界値: 受注件数が提案数を超える場合（データ不整合）
    const boundaryInput = {
      proposalCount: 5,
      closedDealCount: 10,
    };
    expect(() => calculateMonthlyProgressRate(boundaryInput)).toThrow(/受注件数/);

    // 正常な計算結果の検証: 進捗率 = (受注件数 ÷ 提案数) × 100
    const progressRateTest = {
      proposalCount: 20,
      closedDealCount: 8,
    };
    expect(calculateMonthlyProgressRate(progressRateTest)).toBe(40);
  });
});