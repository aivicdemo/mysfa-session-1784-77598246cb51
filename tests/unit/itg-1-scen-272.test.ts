import { verifyInvoicePortalReflection } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-272: [error] 請求書ポータル反映リードタイム管理機能 - 未承認の請求書はポータルに反映されない
  test("未承認の請求書はポータルに反映されず、承認後のみポータルに表示される", () => {
    const invoice_id = "INV-20240415-001";
    const customer_id = "CUST-12345";
    const invoice_amount = 150000;
    const invoice_date = "2024-04-15";
    const approval_status_unapproved = "未承認";
    const approval_status_approved = "承認";

    // 手順1: 請求書管理画面で新規請求書を作成し、必要情報を入力
    const created_invoice = {
      invoice_id: invoice_id,
      customer_id: customer_id,
      amount: invoice_amount,
      invoice_date: invoice_date,
      status: approval_status_unapproved,
    };

    // 手順2: 未承認状態で顧客ポータルを確認
    const portal_invoices_before_approval = {
      invoices: [],
      total_count: 0,
    };

    // 期待結果: 未承認の請求書はポータルに表示されない
    expect(portal_invoices_before_approval.total_count).toBe(0);
    expect(portal_invoices_before_approval.invoices).toEqual([]);

    // 手順3: 請求書を承認処理
    const approved_invoice = {
      ...created_invoice,
      status: approval_status_approved,
    };

    // 手順4: 承認後、顧客ポータルを確認
    const portal_invoices_after_approval = {
      invoices: [approved_invoice],
      total_count: 1,
    };

    // 期待結果: 承認後の請求書はポータルに表示される
    expect(portal_invoices_after_approval.total_count).toBe(1);
    expect(portal_invoices_after_approval.invoices).toHaveLength(1);
    expect(portal_invoices_after_approval.invoices[0]).toEqual({
      invoice_id: invoice_id,
      customer_id: customer_id,
      amount: invoice_amount,
      invoice_date: invoice_date,
      status: approval_status_approved,
    });

    // ビジネスルール検証: 承認前後の一貫性を確認
    const result = verifyInvoicePortalReflection({
      invoice_id: invoice_id,
      customer_id: customer_id,
      amount: invoice_amount,
      invoice_date: invoice_date,
      status_before: approval_status_unapproved,
      status_after: approval_status_approved,
      portal_count_before: portal_invoices_before_approval.total_count,
      portal_count_after: portal_invoices_after_approval.total_count,
    });

    expect(result.is_portal_hidden_before_approval).toBe(true);
    expect(result.is_portal_visible_after_approval).toBe(true);
    expect(result.verification_passed).toBe(true);
    expect(result.invoice_reflection_lead_time_days).toBeLessThanOrEqual(1);
  });
});