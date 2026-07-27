import { validateQuotableDataApproval } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-820
  test('商談ステータスが成約済み以外のとき、該当データを不承認と判定する', () => {
    const nonFinalStatuses = [
      '提案中',
      '失注',
      '保留中',
      '初期段階',
    ];

    nonFinalStatuses.forEach((status) => {
      const dealRecord = {
        dealId: 'DEAL-001',
        customerName: 'テスト顧客A',
        amount: 100000,
        status: status,
      };

      const result = validateQuotableDataApproval(dealRecord);

      expect(result.isApproved).toBe(false);
      expect(result.reason).toMatch(/商談ステータスが成約済み/);
    });
  });
});