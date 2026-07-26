import { describe, test, expect, beforeEach } from "@jest/globals";
import { getCustomerPortalInvoices } from "../../src/logic/it-1784969823049-2-1-2";

const fetchMock = require("jest-fetch-mock");

describe("顧客向けポータルでの商談情報参照機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-116
  test("請求書ポータル反映タイムラインコントロール - ポータル反映処理が開始されない場合、顧客は請求書を確認できない状態が続く", async () => {
    const customer_id = "CUST-00123";
    const portal_user_id = "USER-PORT-456";
    const invoice_id_001 = "INV-2024-001";
    const invoice_id_002 = "INV-2024-002";
    const invoice_amount_001 = 150000;
    const invoice_amount_002 = 75000;
    const invoice_issue_date_001 = "2024-01-15T10:30:00Z";
    const invoice_issue_date_002 = "2024-01-16T14:45:00Z";
    const portal_reflection_status_pending = "PENDING";
    const portal_reflection_status_not_started = "NOT_STARTED";
    const expected_invoice_count_when_not_reflected = 0;
    const expected_message_data_loading = "データ取得中";
    const expected_message_reflection_not_started = "ポータル反映処理が開始されていません";
    const expected_retry_interval_seconds = 30;
    const max_retry_attempts = 5;

    // ケース 1: ポータル反映処理が開始されていない場合、請求書が表示されない
    fetchMock.mockResponseOnce(
      JSON.stringify({
        customer_id: customer_id,
        portal_user_id: portal_user_id,
        invoices: [],
        reflection_status: portal_reflection_status_not_started,
        status_message: expected_message_reflection_not_started,
        is_data_available: false,
        last_reflection_attempt: null,
      }),
      { status: 200 }
    );

    const result_not_started = await getCustomerPortalInvoices({
      customer_id: customer_id,
      portal_user_id: portal_user_id,
    });

    expect(result_not_started.invoices).toEqual([]);
    expect(result_not_started.invoices.length).toBe(expected_invoice_count_when_not_reflected);
    expect(result_not_started.reflection_status).toBe(portal_reflection_status_not_started);
    expect(result_not_started.status_message).toMatch(/ポータル反映処理/);
    expect(result_not_started.is_data_available).toBe(false);

    // ケース 2: ポータル反映処理が進行中（PENDING）の場合、データ取得中メッセージが表示される
    fetchMock.mockResponseOnce(
      JSON.stringify({
        customer_id: customer_id,
        portal_user_id: portal_user_id,
        invoices: [],
        reflection_status: portal_reflection_status_pending,
        status_message: expected_message_data_loading,
        is_data_available: false,
        last_reflection_attempt: "2024-01-16T15:00:00Z",
      }),
      { status: 200 }
    );

    const result_pending = await getCustomerPortalInvoices({
      customer_id: customer_id,
      portal_user_id: portal_user_id,
    });

    expect(result_pending.invoices).toEqual([]);
    expect(result_pending.invoices.length).toBe(expected_invoice_count_when_not_reflected);
    expect(result_pending.reflection_status).toBe(portal_reflection_status_pending);
    expect(result_pending.status_message).toMatch(/データ取得中/);
    expect(result_pending.is_data_available).toBe(false);

    // ケース 3: ポータル反映処理が完了した場合、請求書が表示される
    fetchMock.mockResponseOnce(
      JSON.stringify({
        customer_id: customer_id,
        portal_user_id: portal_user_id,
        invoices: [
          {
            invoice_id: invoice_id_001,
            amount: invoice_amount_001,
            issue_date: invoice_issue_date_001,
            status: "ISSUED",
          },
          {
            invoice_id: invoice_id_002,
            amount: invoice_amount_002,
            issue_date: invoice_issue_date_002,
            status: "ISSUED",
          },
        ],
        reflection_status: "COMPLETED",
        status_message: "請求書データを取得しました",
        is_data_available: true,
        last_reflection_attempt: "2024-01-16T15:05:00Z",
      }),
      { status: 200 }
    );

    const result_completed = await getCustomerPortalInvoices({
      customer_id: customer_id,
      portal_user_id: portal_user_id,
    });

    expect(result_completed.invoices.length).toBe(2);
    expect(result_completed.invoices[0].invoice_id).toBe(invoice_id_001);
    expect(result_completed.invoices[0].amount).toBe(invoice_amount_001);
    expect(result_completed.invoices[1].invoice_id).toBe(invoice_id_002);
    expect(result_completed.invoices[1].amount).toBe(invoice_amount_002);
    expect(result_completed.reflection_status).toBe("COMPLETED");
    expect(result_completed.is_data_available).toBe(true);
    expect(result_completed.status_message).toMatch(/取得/);

    // ケース 4: エラー - ユーザー権限がない場合、エラーメッセージを表示
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: true,
        error_code: "UNAUTHORIZED",
        error_message: "ユーザーに請求書閲覧権限がありません",
      }),
      { status: 403 }
    );

    await expect(async () => {
      await getCustomerPortalInvoices({
        customer_id: customer_id,
        portal_user_id: "USER-INVALID",
      });
    }).rejects.toThrow(/権限/);

    // ケース 5: エラー - 顧客IDが不正な場合、エラーを発生
    fetchMock.mockResponseOnce(
      JSON.stringify({
        error: true,
        error_code: "INVALID_CUSTOMER",
        error_message: "顧客IDが見つかりません",
      }),
      { status: 404 }
    );

    await expect(async () => {
      await getCustomerPortalInvoices({
        customer_id: "CUST-INVALID",
        portal_user_id: portal_user_id,
      });
    }).rejects.toThrow(/顧客/);

    // ケース 6: リトライロジック検証 - 最大リトライ回数に達した場合のエラー
    for (let i = 0; i < max_retry_attempts; i++) {
      fetchMock.mockResponseOnce(
        JSON.stringify({
          customer_id: customer_id,
          portal_user_id: portal_user_id,
          invoices: [],
          reflection_status: portal_reflection_status_pending,
          status_message: expected_message_data_loading,
          is_data_available: false,
          last_reflection_attempt: new Date(
            Date.now() - expected_retry_interval_seconds * 1000 * i
          ).toISOString(),
        }),
        { status: 200 }
      );
    }

    const retry_result = await getCustomerPortalInvoices({
      customer_id: customer_id,
      portal_user_id: portal_user_id,
      max_retries: max_retry_attempts,
      retry_interval_ms: expected_retry_interval_seconds * 1000,
    });

    expect(retry_result.invoices).toEqual([]);
    expect(retry_result.reflection_status).toBe(portal_reflection_status_pending);
  });
});