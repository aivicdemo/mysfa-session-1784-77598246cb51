import { validateInvoiceApprovalAuthority } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-138
  test("請求書金額が承認者の承認限度額とちょうど一致するとき、承認権限チェックを成功させる", () => {
    const approverUserId = "user-approver-001";
    const approvalLimitAmount = 50000;
    const invoiceAmount = 50000;

    const invoiceData = {
      invoiceId: "INV-2024-001",
      customerId: "CUST-001",
      amount: invoiceAmount,
      currency: "JPY",
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      status: "pending_approval",
    };

    const approverUser = {
      userId: approverUserId,
      name: "Approver User",
      role: "approval_manager",
      approvalLimitAmount: approvalLimitAmount,
    };

    const result = validateInvoiceApprovalAuthority(
      invoiceData,
      approverUser
    );

    expect(result).toBe(true);
  });
});