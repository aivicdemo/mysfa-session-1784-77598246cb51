import { reconcileDealStatusAndInvoiceIssueStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-206
  test('照合対象の商談または請求書が存在しない場合にエラーが発生する', () => {
    // Precondition: 営業管理システムにログイン済みで、存在しない商談IDまたは請求書IDを指定する状態

    // Trigger 1: 存在しない商談IDで照合機能を実行
    const nonExistentDealId = 'DEAL-99999';
    const invoiceId = 'INV-00001';

    expect(() =>
      reconcileDealStatusAndInvoiceIssueStatus({
        dealId: nonExistentDealId,
        invoiceId: invoiceId,
      })
    ).toThrow(/商談/);

    // Trigger 2: 存在しない請求書IDで照合機能を実行
    const dealId = 'DEAL-00001';
    const nonExistentInvoiceId = 'INV-99999';

    expect(() =>
      reconcileDealStatusAndInvoiceIssueStatus({
        dealId: dealId,
        invoiceId: nonExistentInvoiceId,
      })
    ).toThrow(/請求書/);

    // Outcome: 照合対象の商談が見つからない場合は「商談」を含むエラーメッセージが表示され、
    // 照合対象の請求書が見つからない場合は「請求書」を含むエラーメッセージが表示される。
    // 自動照合処理が中止されることが保証される。
    // (エラーがスロー後、以降の処理は実行されない)
  });
});