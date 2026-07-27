import { recordUnbilledIssueCompletion } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 未請求案件対応完了記録', () => {
  test('SCEN-680: 未請求案件IDが空のとき、バリデーションエラーが発生する', () => {
    const completionRecord = {
      unbilledIssueId: '',
      completionDateTime: new Date('2024-04-15T14:30:00Z'),
      completionDetails: '請求書を発行し、顧客に通知完了',
      completionStatus: '対応完了',
    };

    expect(() => recordUnbilledIssueCompletion(completionRecord)).toThrow(/未請求案件ID/);
  });
});