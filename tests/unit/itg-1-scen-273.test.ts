import { reflectInvoiceToPortalWithLeadTime } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-273: [edge] 請求書ポータル反映リードタイム管理機能 - 金曜日承認の請求書が月曜日までにポータルに反映される（営業日ベース計算）
  test('金曜日に承認された請求書が営業日ベース計算で月曜日までにポータルに完全に反映されること', () => {
    // 承認日時: 2024-01-12 (金曜日) 14:30
    const approval_date = new Date('2024-01-12T14:30:00Z');
    
    // 請求書データ
    const invoice_data = {
      invoice_id: 'INV-2024-001',
      customer_id: 'CUST-001',
      customer_name: 'テスト顧客株式会社',
      invoice_amount: 500000,
      invoice_date: '2024-01-12',
      due_date: '2024-02-12',
      line_items: [
        {
          item_id: 'ITEM-001',
          description: 'コンサルティングサービス',
          quantity: 1,
          unit_price: 300000,
          tax_rate: 0.1,
          subtotal: 300000,
          tax_amount: 30000,
          total: 330000
        },
        {
          item_id: 'ITEM-002',
          description: 'システム導入支援',
          quantity: 1,
          unit_price: 170000,
          tax_rate: 0.1,
          subtotal: 170000,
          tax_amount: 17000,
          total: 187000
        }
      ],
      approval_status: 'approved',
      approval_datetime: approval_date.toISOString(),
      business_days_to_reflect: 2
    };

    // ポータル反映確認日時: 2024-01-15 (月曜日) 09:00
    const portal_check_datetime = new Date('2024-01-15T09:00:00Z');

    // 営業日計算: 金曜日 2024-01-12 から営業日ベースで +2日 = 月曜日 2024-01-15
    const expected_reflection_date = new Date('2024-01-15T00:00:00Z');

    const result = reflectInvoiceToPortalWithLeadTime({
      invoice_data,
      approval_date,
      portal_check_datetime,
      business_days_to_reflect: 2
    });

    // 期待結果: ポータル反映が完了し、すべての詳細情報が正確に反映されていること
    expect(result).toEqual({
      is_reflected: true,
      invoice_id: 'INV-2024-001',
      customer_id: 'CUST-001',
      customer_name: 'テスト顧客株式会社',
      invoice_amount: 500000,
      invoice_date: '2024-01-12',
      due_date: '2024-02-12',
      approval_status: 'approved',
      approval_datetime: '2024-01-12T14:30:00Z',
      portal_reflection_datetime: expect.any(String),
      line_items_count: 2,
      total_tax_amount: 47000,
      total_with_tax: 517000,
      lead_time_business_days: 2,
      lead_time_completed: true,
      lead_time_check_result: {
        approval_date_day_of_week: 'Friday',
        target_reflection_date_day_of_week: 'Monday',
        actual_reflection_date_day_of_week: 'Monday',
        reflection_completed_within_lead_time: true
      },
      line_items_details: [
        {
          item_id: 'ITEM-001',
          description: 'コンサルティングサービス',
          quantity: 1,
          unit_price: 300000,
          tax_rate: 0.1,
          subtotal: 300000,
          tax_amount: 30000,
          total: 330000
        },
        {
          item_id: 'ITEM-002',
          description: 'システム導入支援',
          quantity: 1,
          unit_price: 170000,
          tax_rate: 0.1,
          subtotal: 170000,
          tax_amount: 17000,
          total: 187000
        }
      ]
    });

    // ポータル反映がリードタイム内に完了していることを検証
    expect(result.is_reflected).toBe(true);
    expect(result.lead_time_completed).toBe(true);
    expect(result.lead_time_check_result.reflection_completed_within_lead_time).toBe(true);

    // 請求書情報が完全に反映されているか検証
    expect(result.invoice_id).toBe('INV-2024-001');
    expect(result.customer_name).toBe('テスト顧客株式会社');
    expect(result.invoice_amount).toBe(500000);

    // 明細行データが正確に反映されているか検証
    expect(result.line_items_count).toBe(2);
    expect(result.total_tax_amount).toBe(47000);
    expect(result.total_with_tax).toBe(517000);

    // 営業日ベース計算検証: 金曜日から月曜日への遷移
    expect(result.lead_time_check_result.approval_date_day_of_week).toBe('Friday');
    expect(result.lead_time_check_result.target_reflection_date_day_of_week).toBe('Monday');
    expect(result.lead_time_check_result.actual_reflection_date_day_of_week).toBe('Monday');

    // 承認ステータスが正確に反映されているか検証
    expect(result.approval_status).toBe('approved');
    expect(result.approval_datetime).toBe('2024-01-12T14:30:00Z');
  });
});