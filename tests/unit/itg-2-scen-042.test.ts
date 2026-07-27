import { issuePurchaseOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータル - 商談情報参照機能', () => {
  // SCEN-042
  test('[normal] 帳票発行・履歴管理機能 - 注文書を顧客に発行したとき、発行日時が自動付与され、発行履歴が記録される', () => {
    const issuance_date = new Date('2024-01-15T11:00:00Z');
    const purchase_order_id = 'PO-2024-001';
    const customer_id = 'CUST-12345';
    const customer_name = 'テスト顧客株式会社';
    const total_amount = 150000;

    const result = issuePurchaseOrder({
      purchase_order_id: purchase_order_id,
      customer_id: customer_id,
      customer_name: customer_name,
      total_amount: total_amount,
      issuance_date_utc: issuance_date,
    });

    // (1) 注文書に現在の日時が自動付与されている
    expect(result.purchase_order.issuance_date_utc).toEqual(
      new Date('2024-01-15T11:00:00Z'),
    );

    // (2) 帳票履歴管理画面に新規の発行履歴レコードが記録されている
    expect(result.issuance_history).toBeDefined();
    expect(result.issuance_history.issuance_history_id).toBeDefined();
    expect(result.issuance_history.issuance_history_id.length).toBeGreaterThan(0);

    // (3) 履歴には注文書ID、発行日時、顧客情報、ステータスが正確に記録されている
    expect(result.issuance_history.purchase_order_id).toBe(purchase_order_id);
    expect(result.issuance_history.issuance_date_utc).toEqual(
      new Date('2024-01-15T11:00:00Z'),
    );
    expect(result.issuance_history.customer_id).toBe(customer_id);
    expect(result.issuance_history.customer_name).toBe(customer_name);
    expect(result.issuance_history.status).toBe('issued');
    expect(result.issuance_history.total_amount).toBe(total_amount);
  });
});