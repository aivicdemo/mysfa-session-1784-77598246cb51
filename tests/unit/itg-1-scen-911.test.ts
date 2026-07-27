import { validateInvoiceApprover } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証機能', () => {
  // SCEN-911
  test('請求書の承認者情報が設定されているとき検証が合格する', () => {
    const invoice_data = {
      invoice_id: 'INV-2024-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト',
      amount: 100000,
      issue_date: '2024-01-15',
      approver_id: 'USR-001',
      approver_name: '営業管理者 太郎',
      approver_email: 'approver@example.com',
      approval_status: 'pending'
    };

    const result = validateInvoiceApprover(invoice_data);

    expect(result).toEqual({
      isValid: true,
      validationErrors: []
    });
  });
});