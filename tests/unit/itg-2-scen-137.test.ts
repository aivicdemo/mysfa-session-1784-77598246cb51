import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-137: [error] 請求書承認検証機能 - 請求書金額が承認者の承認限度額を超えるとき、承認権限エラーが発生する
  test('承認者の承認限度額を超える金額の請求書は承認権限エラーを発生させる', () => {
    // 承認者Aの情報
    const approverData = {
      approverId: 'APPROVER_A_001',
      approverName: '承認者A',
      approvalLimit: 500000, // 承認限度額: 500,000円
    };

    // 請求書データ: 金額が承認限度額(500,000円)を超える(600,000円)
    const invoiceData = {
      invoiceId: 'INV_20240115_001',
      customerId: 'CUST_001',
      invoiceAmount: 600000, // 請求書金額: 600,000円
      invoiceStatus: '承認待ち',
      createdAt: '2024-01-15T10:00:00Z',
    };

    // 監査ログ記録用のスタブ
    const auditLogExporter = {
      logPermissionChange: jest.fn(),
    };

    // 承認権限エラーが発生することを検証
    expect(() =>
      validateInvoiceApproval(approverData, invoiceData, auditLogExporter)
    ).toThrow(/承認限度額/);

    // 権限超過アクション試行がシステム監査ログに記録されることを検証
    expect(auditLogExporter.logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        approverId: 'APPROVER_A_001',
        actionType: '承認権限超過試行',
        invoiceId: 'INV_20240115_001',
        invoiceAmount: 600000,
        approvalLimit: 500000,
        timestamp: expect.any(String),
      })
    );

    // 呼び出し回数の検証（1回だけ呼ばれる）
    expect(auditLogExporter.logPermissionChange).toHaveBeenCalledTimes(1);
  });
});