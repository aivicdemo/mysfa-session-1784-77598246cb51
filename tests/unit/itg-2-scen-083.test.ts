import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { loginPortalUser } from "../../src/logic/it-1784969823049-2-1-3";

const fetchMock = require("jest-fetch-mock");

describe("顧客ポータルのアクセス制御と権限管理", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-083
  test("ユーザーライセンスが割り当てられていない場合、ポータルへのログインが拒否される", async () => {
    const userId = "user_no_license_001";
    const password = "test_password_123";

    const loginResponse = {
      success: false,
      error_code: "LICENSE_NOT_ASSIGNED",
      message: "ライセンスが割り当てられていません"
    };

    fetchMock.mockResponseOnce(JSON.stringify(loginResponse), { status: 403 });

    const result = await loginPortalUser({
      user_id: userId,
      password: password
    });

    expect(result.success).toBe(false);
    expect(result.error_code).toBe("LICENSE_NOT_ASSIGNED");
    expect(result.message).toMatch(/ライセンスが割り当てられていません/);
    expect(result.access_granted).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});