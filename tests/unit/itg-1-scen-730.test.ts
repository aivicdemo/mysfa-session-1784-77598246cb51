import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  test('SCEN-730: 商談ステータス遷移検証機能 - 商談レコードIDが欠落している場合、検証は失敗する', () => {
    // 商談レコードIDが空文字列の場合
    expect(() =>
      validateDealStatusTransition({
        dealId: '',
        newStatus: 'won',
        transitionDate: new Date('2024-01-15T11:00:00Z'),
      })
    ).toThrow(/商談レコードID/);

    // 商談レコードIDがnullの場合
    expect(() =>
      validateDealStatusTransition({
        dealId: null as any,
        newStatus: 'won',
        transitionDate: new Date('2024-01-15T11:00:00Z'),
      })
    ).toThrow(/商談レコードID/);

    // 商談レコードIDがundefinedの場合
    expect(() =>
      validateDealStatusTransition({
        dealId: undefined as any,
        newStatus: 'won',
        transitionDate: new Date('2024-01-15T11:00:00Z'),
      })
    ).toThrow(/商談レコードID/);
  });
});