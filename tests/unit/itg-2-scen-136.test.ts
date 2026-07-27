import { ApprovalAuthorizationValidator } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-136
  test('請求書金額が承認者の承認限度額以下のとき、承認権限チェックを成功させる', () => {
    const invoiceAmount = 100000;
    const approverApprovalLimit = 500000;

    const result = ApprovalAuthorizationValidator.validateApprovalAuthority(
      invoiceAmount,
      approverApprovalLimit
    );

    expect(result).toBe(true);
  });
});