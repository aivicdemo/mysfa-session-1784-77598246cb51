import { extractBillingTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-776
  test('請求対象データ抽出機能 - ステータス条件が空のとき、エラーが発生する', () => {
    const extraction_condition_with_empty_status = {
      status_condition: '',
      extraction_period_start: '2024-04-01',
      extraction_period_end: '2024-04-30',
      customer_id: 'CUST001',
    };

    expect(() =>
      extractBillingTargetData(extraction_condition_with_empty_status)
    ).toThrow(/ステータス条件/);
  });
});