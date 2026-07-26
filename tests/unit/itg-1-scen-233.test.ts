import { validateDealStatusTransition } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-233
  test('月次決算時の商談ステータスと請求データ照合において業務ルール違反の遷移が拒否される', () => {
    const current_deal_status = 'completed';
    const target_deal_status = 'order_confirmed';
    const invoice_amount = 50000;
    const deal_amount = 100000;

    expect(() =>
      validateDealStatusTransition({
        currentStatus: current_deal_status,
        targetStatus: target_deal_status,
        invoiceAmount: invoice_amount,
        dealAmount: deal_amount,
      })
    ).toThrow(/ステータス遷移/);
  });
});