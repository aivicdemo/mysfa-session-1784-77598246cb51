import { updateBillingStatusWithPaymentSchedule } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  test("SCEN-179: 顧客からの請求支払い予定日の連絡が反映され、請求ステータスが『予定有り』に更新される", () => {
    // Arrange: 商談レコードと顧客からの支払い予定日情報を準備
    const deal_id = "DEAL-2024-001";
    const customer_id = "CUST-00123";
    const customer_name = "株式会社テスト";
    const billing_amount = 1500000;
    const deal_status = "成約";
    const scheduled_payment_date = "2024-02-28";
    const contact_date = "2024-02-15T14:30:00Z";
    const billing_status_before = "未確認";

    const deal_record = {
      deal_id,
      customer_id,
      customer_name,
      billing_amount,
      deal_status,
      billing_data: {
        billing_status: billing_status_before,
        scheduled_payment_date: null,
        last_contact_date: null,
      },
    };

    const payment_schedule_input = {
      deal_id,
      customer_id,
      scheduled_payment_date,
      contact_date,
      contact_source: "phone",
    };

    // Act: 請求ステータスと支払い予定日を更新
    const updated_deal = updateBillingStatusWithPaymentSchedule(
      deal_record,
      payment_schedule_input
    );

    // Assert: 請求ステータスが『予定有り』に更新され、支払い予定日が正しく紐付けられていることを確認
    expect(updated_deal.billing_data.billing_status).toBe("予定有り");
    expect(updated_deal.billing_data.scheduled_payment_date).toBe(
      "2024-02-28"
    );
    expect(updated_deal.billing_data.last_contact_date).toBe(
      "2024-02-15T14:30:00Z"
    );
    expect(updated_deal.deal_id).toBe(deal_id);
    expect(updated_deal.customer_id).toBe(customer_id);
    expect(updated_deal.customer_name).toBe(customer_name);
    expect(updated_deal.billing_amount).toBe(1500000);
    expect(updated_deal.deal_status).toBe("成約");

    // Assert: 請求データが商談レコードに正しく紐付けられていることを確認
    expect(updated_deal.billing_data).toBeDefined();
    expect(typeof updated_deal.billing_data.billing_status).toBe("string");
    expect(typeof updated_deal.billing_data.scheduled_payment_date).toBe(
      "string"
    );
    expect(typeof updated_deal.billing_data.last_contact_date).toBe("string");

    // Assert: 支払い予定日のフォーマット検証（YYYY-MM-DD形式）
    const date_format_regex = /^\d{4}-\d{2}-\d{2}$/;
    expect(date_format_regex.test(updated_deal.billing_data.scheduled_payment_date)).toBe(true);

    // Assert: 連絡日時のISO 8601フォーマット検証
    const iso_datetime_regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
    expect(iso_datetime_regex.test(updated_deal.billing_data.last_contact_date)).toBe(true);

    // Assert: 元のdeal_recordが変更されていないことを確認（イミュータビリティ）
    expect(deal_record.billing_data.billing_status).toBe(billing_status_before);
    expect(deal_record.billing_data.scheduled_payment_date).toBeNull();
    expect(deal_record.billing_data.last_contact_date).toBeNull();
  });
});