import { reconcileSalesAndBillingData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-940: [error] 売上実績・請求データ照合機能 - 請求日が空文字列の場合、照合不可エラーが返される', () => {
    // 照合対象となる売上実績データを準備する
    const salesData = {
      sales_date: '2024-01-15',
      sales_amount: 100000,
      customer_id: 'CUST-001',
    };

    // 照合対象となる請求データを準備する
    const billingData = {
      billing_amount: 100000,
      customer_id: 'CUST-001',
      billing_date: '',
    };

    // 照合実行メソッドに売上実績データと請求データを入力パラメータとして渡す
    const result = reconcileSalesAndBillingData(salesData, billingData);

    // 照合処理の戻り値を検証する
    expect(result.status).toBe('UNMATCHABLE');
    expect(result.error_code).toBe('INVALID_BILLING_DATE');
    expect(result.error_message).toContain('請求日が未設定です');
    expect(result.error_message).toContain('照合を実行する前に請求日を入力してください');
  });
});