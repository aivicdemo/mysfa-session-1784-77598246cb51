import { recordUnbilledProjectCompletion } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-681
  test('未請求案件の対応完了を記録する機能 - 対応完了日が無効な日付形式のとき、バリデーションエラーが発生する', () => {
    const unbilledProject = {
      projectId: 'TEST-PROJ-001',
      status: '未請求',
      customerId: 'CUST-001',
      dealAmount: 100000,
    };

    const invalidDateFormats = [
      '2024-13-45',
      '2024/2024/01',
      'invalid-date',
      '2024-02-30',
      '2024-12-32',
      'abc-def-ghi',
      '',
      '2024/01/01',
      '01-01-2024',
      '2024.01.01',
    ];

    invalidDateFormats.forEach((invalidDate) => {
      expect(() =>
        recordUnbilledProjectCompletion({
          projectId: unbilledProject.projectId,
          completionDate: invalidDate,
        })
      ).toThrow(/対応完了日/);
    });
  });
});