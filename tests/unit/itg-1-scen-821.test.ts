import { validateInvoiceTargetData } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-821
  test('請求対象データ妥当性検証機能 - 商談の契約金額と請求金額が一致するとき、該当項目を検証OK と判定する', () => {
    const deal_id = 'DEAL-0001';
    const deal_contract_amount = 500000;
    const invoice_amount = 500000;

    const deal_record = {
      id: deal_id,
      contract_amount: deal_contract_amount,
      status: 'won',
    };

    const invoice_record = {
      deal_id: deal_id,
      amount: invoice_amount,
      issued_date: '2024-04-15',
    };

    const validation_result = validateInvoiceTargetData(deal_record, invoice_record);

    expect(validation_result.status).toBe('OK');
    expect(validation_result.amount_mismatch_error).toBe(false);
    expect(validation_result.warning_messages).toEqual([]);
  });
});