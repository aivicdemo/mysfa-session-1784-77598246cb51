import { checkAccessPermission } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  test("SCEN-082: ユーザー権限に無い機能へのアクセス要求時、アクセス拒否が返却される", () => {
    const login_user_id = "user_123";
    const login_user_role = "general";
    const requested_feature_id = "admin_report_export";
    const current_timestamp = new Date("2024-01-15T11:00:00Z");

    const result = checkAccessPermission({
      login_user_id: login_user_id,
      login_user_role: login_user_role,
      requested_feature_id: requested_feature_id,
      timestamp: current_timestamp,
    });

    expect(result.status_code).toBe(403);
    expect(result.error_message).toMatch(/アクセス権限/);
    expect(result.is_session_active).toBe(true);
    expect(result.access_granted).toBe(false);
  });
});