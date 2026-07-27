import { updateDealStatusToContracted } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-224
  test('商談ステータスを成約に変更した場合、売上実績の金額が商談金額と一致する', () => {
    const deal_id = 'DEAL-001';
    const customer_name = 'テスト太郎';
    const deal_amount = 1000000;
    const current_status = '提案中';
    const new_status = '成約';
    const expected_sales_amount = 1000000;

    const input_deal = {
      deal_id: deal_id,
      customer_name: customer_name,
      amount: deal_amount,
      status: current_status,
    };

    const result = updateDealStatusToContracted(input_deal);

    expect(result.deal_status).toBe(new_status);
    expect(result.sales_record_created).toBe(true);
    expect(result.sales_amount).toBe(expected_sales_amount);
    expect(result.sales_deal_id).toBe(deal_id);
  });
});