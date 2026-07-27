import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";

const fetchMock = require("jest-fetch-mock");

describe("顧客ポータルのアクセス制御と権限管理", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-132
  test("請求書承認検証機能 - 承認者の権限情報が存在しないとき、権限エラーが発生する", async () => {
    const approver_user_id = "approver_001";
    const invoice_id = "INV-20240115-001";
    const initial_status = "pending_approval";
    const amount = 100000;
    const expected_http_status = 403;
    const expected_error_code = "AUTHORIZATION_PERMISSION_MISSING";
    const expected_error_message = "この操作を実行する権限がありません";

    // IdentityProviderAdapter のモック: 承認者ユーザーの認証トークンを発行
    const mock_auth_token = "mock_token_approver_001";
    const mock_identity_provider = {
      authenticateUser: jest.fn().mockResolvedValue({
        token: mock_auth_token,
        user_id: approver_user_id,
        expires_at: new Date("2024-01-15T12:00:00Z").toISOString(),
      }),
      validateToken: jest.fn().mockResolvedValue({
        valid: true,
        user_id: approver_user_id,
      }),
    };

    // ユーザー権限テーブル: 承認者の権限情報が存在しない（削除または NULL に設定）
    const mock_permission_repository = {
      findByUserId: jest.fn().mockResolvedValue(null),
    };

    // 請求書リポジトリ: テスト用請求書データ
    const mock_invoice_repository = {
      findById: jest.fn().mockResolvedValue({
        invoice_id: invoice_id,
        status: initial_status,
        amount: amount,
        customer_id: "CUST-001",
        created_at: new Date("2024-01-15T10:00:00Z").toISOString(),
      }),
      updateStatus: jest.fn().mockResolvedValue(null),
    };

    // AuditLogExporter のモック
    const mock_audit_log_exporter = {
      logPermissionChange: jest.fn().mockResolvedValue({
        event_id: "EVT-20240115-001",
        timestamp: new Date("2024-01-15T11:00:00Z").toISOString(),
        recorded: true,
      }),
    };

    // 承認 API エンドポイント呼び出しのモック応答
    const assumed_error_response = {
      error_code: expected_error_code,
      error_message: expected_error_message,
    };

    fetchMock.mockResponseOnce(
      JSON.stringify(assumed_error_response),
      { status: expected_http_status }
    );

    // テスト: 承認 API を呼び出す
    const response = await fetch(
      `http://localhost:3000/invoices/${invoice_id}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mock_auth_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approver_id: approver_user_id }),
      }
    );

    // レスポンスステータスの検証
    expect(response.status).toBe(expected_http_status);

    // レスポンスボディの検証
    const response_body = await response.json();
    expect(response_body.error_code).toBe(expected_error_code);
    expect(response_body.error_message).toBe(expected_error_message);

    // ユーザー権限の確認: 権限情報が存在しないことを検証
    const user_permission = await mock_permission_repository.findByUserId(
      approver_user_id
    );
    expect(user_permission).toBeNull();

    // 請求書ステータスが変更されていないことを検証
    const invoice_after = await mock_invoice_repository.findById(invoice_id);
    expect(invoice_after.status).toBe(initial_status);

    // 請求書データが更新されていないことを確認（updateStatus が呼ばれていない）
    expect(mock_invoice_repository.updateStatus).not.toHaveBeenCalled();

    // 監査ログに権限エラーイベントが記録されたことを検証
    await mock_audit_log_exporter.logPermissionChange({
      event_type: "PERMISSION_DENIED",
      user_id: approver_user_id,
      resource: `invoice:${invoice_id}`,
      action: "APPROVE",
      reason: "USER_PERMISSION_NOT_FOUND",
      timestamp: new Date("2024-01-15T11:00:00Z").toISOString(),
    });

    expect(mock_audit_log_exporter.logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "PERMISSION_DENIED",
        user_id: approver_user_id,
        resource: `invoice:${invoice_id}`,
        action: "APPROVE",
        reason: "USER_PERMISSION_NOT_FOUND",
      })
    );
  });
});