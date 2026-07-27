import { detectUnbilledDeal } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  test('SCEN-274: 商談ステータスが受注に更新されたのに対応する請求書が0件のとき、未請求案件として検出される', () => {
    // Arrange: テスト用の商談データを準備
    const dealId = 'DEAL-001';
    const dealData = {
      deal_id: dealId,
      deal_name: 'テスト商談',
      customer_name: 'テスト顧客A',
      amount: 100000,
      status: '受注',
      invoice_count: 0,
    };

    // Act: 未請求案件検出機能を実行
    const result = detectUnbilledDeal(dealData);

    // Assert: 未請求案件として検出されることを確認
    expect(result).toEqual({
      is_unbilled: true,
      deal_id: 'DEAL-001',
      deal_name: 'テスト商談',
      customer_name: 'テスト顧客A',
      amount: 100000,
      status: '受注',
      detection_reason: '受注状態で請求書0件',
      detected_at: expect.any(String),
    });

    // Assert: 検出理由が正確に表示されていることを確認
    expect(result.detection_reason).toBe('受注状態で請求書0件');

    // Assert: 商談情報がすべて正確に表示されていることを確認
    expect(result.deal_name).toBe('テスト商談');
    expect(result.customer_name).toBe('テスト顧客A');
    expect(result.amount).toBe(100000);
  });
});