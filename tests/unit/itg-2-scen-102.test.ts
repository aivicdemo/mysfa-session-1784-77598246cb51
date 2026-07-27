import { validatePaymentDeadline } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-102
  test('請求書の支払期限日が発行日より後のとき、期限チェックを成功させる', () => {
    const issuedDate = new Date('2024-01-10T00:00:00Z');
    const paymentDeadlineDate = new Date('2024-02-10T00:00:00Z');

    const result = validatePaymentDeadline(issuedDate, paymentDeadlineDate);

    expect(result).toBe(true);
  });
});