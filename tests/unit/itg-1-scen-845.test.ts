import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-845: [error] 請求書承認検証機能 - 請求書の顧客情報が商談に紐付く顧客と異なるとき検証が不合格になる', () => {
    // テストデータ: 商談に紐付く顧客（CUST-001）
    const dealCustomerId = 'CUST-001';
    const dealId = 'OPP-001';
    const dealAmount = 100000;

    // テストデータ: 請求書に設定された異なる顧客（CUST-002）
    const invoiceCustomerId = 'CUST-002';
    const invoiceData = {
      dealId: dealId,
      customerId: invoiceCustomerId,
      amount: dealAmount,
      approvalStatus: '検証待ち',
    };

    // 商談データ（顧客ID: CUST-001）
    const dealData = {
      dealId: dealId,
      customerId: dealCustomerId,
      amount: dealAmount,
    };

    // 検証実行
    const result = validateInvoiceApproval(invoiceData, dealData);

    // 期待結果: 検証が不合格となり、エラーメッセージが返される
    expect(result.isValid).toBe(false);
    expect(result.approvalStatus).toBe('検証失敗');
    expect(result.errorMessage).toMatch(/請求書の顧客情報が商談に紐付く顧客と一致しません/);
    expect(result.errorMessage).toMatch(/CUST-001/);
    expect(result.errorMessage).toMatch(/CUST-002/);
  });
});