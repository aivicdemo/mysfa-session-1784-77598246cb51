import { grantCustomerPortalAccess } from "../../src/logic/it-1784969823049-2-1-1";

describe("顧客ポータルアクセス権限自動付与機能", () => {
  // SCEN-267
  test("商談ステータスを『受注』に更新したとき、顧客担当者にポータルアクセス権限が自動付与される", () => {
    const negotiation_id = "NEGO-20240415-001";
    const customer_id = "CUST-12345";
    const customer_contact_email = "contact@customer.example.com";
    const customer_contact_name = "山田太郎";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T14:30:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    const result = grantCustomerPortalAccess(input_data);

    expect(result).toEqual({
      success: true,
      access_granted: true,
      portal_user_id: expect.any(String),
      customer_contact_email,
      permission_effective_timestamp: expect.any(Date),
      access_log_id: expect.any(String),
      message: "ポータルアクセス権限が正常に付与されました",
    });

    expect(result.success).toBe(true);
    expect(result.access_granted).toBe(true);
    expect(result.customer_contact_email).toBe(customer_contact_email);
    expect(result.portal_user_id).toMatch(/^PU-/);
    expect(result.access_log_id).toMatch(/^LOG-/);
    expect(result.permission_effective_timestamp).toBeInstanceOf(Date);
    expect(result.permission_effective_timestamp.getTime()).toBeGreaterThanOrEqual(
      update_timestamp.getTime()
    );
  });

  test("商談ステータスが『受注』以外に更新された場合、ポータルアクセス権限は付与されない", () => {
    const negotiation_id = "NEGO-20240415-002";
    const customer_id = "CUST-12346";
    const customer_contact_email = "contact2@customer.example.com";
    const customer_contact_name = "山田花子";
    const old_status = "提案中";
    const new_status = "失注";
    const update_timestamp = new Date("2024-04-15T15:00:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    const result = grantCustomerPortalAccess(input_data);

    expect(result.success).toBe(true);
    expect(result.access_granted).toBe(false);
    expect(result.message).toMatch(/権限付与対象外/);
  });

  test("顧客担当者メールアドレスが不正な場合、エラーが発生する", () => {
    const negotiation_id = "NEGO-20240415-003";
    const customer_id = "CUST-12347";
    const customer_contact_email = "invalid-email";
    const customer_contact_name = "山田次郎";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T15:30:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    expect(() => grantCustomerPortalAccess(input_data)).toThrow(/メールアドレス/);
  });

  test("商談IDが空の場合、エラーが発生する", () => {
    const negotiation_id = "";
    const customer_id = "CUST-12348";
    const customer_contact_email = "contact3@customer.example.com";
    const customer_contact_name = "山田三郎";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T16:00:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    expect(() => grantCustomerPortalAccess(input_data)).toThrow(/商談ID/);
  });

  test("顧客IDが空の場合、エラーが発生する", () => {
    const negotiation_id = "NEGO-20240415-004";
    const customer_id = "";
    const customer_contact_email = "contact4@customer.example.com";
    const customer_contact_name = "山田四郎";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T16:30:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    expect(() => grantCustomerPortalAccess(input_data)).toThrow(/顧客ID/);
  });

  test("顧客担当者名が空の場合、エラーが発生する", () => {
    const negotiation_id = "NEGO-20240415-005";
    const customer_id = "CUST-12349";
    const customer_contact_email = "contact5@customer.example.com";
    const customer_contact_name = "";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T17:00:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    expect(() => grantCustomerPortalAccess(input_data)).toThrow(/顧客担当者名/);
  });

  test("ステータス遷移が不正な場合（新ステータスが旧ステータスと同一）、権限は付与されない", () => {
    const negotiation_id = "NEGO-20240415-006";
    const customer_id = "CUST-12350";
    const customer_contact_email = "contact6@customer.example.com";
    const customer_contact_name = "山田五郎";
    const old_status = "受注";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T17:30:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    const result = grantCustomerPortalAccess(input_data);

    expect(result.success).toBe(true);
    expect(result.access_granted).toBe(false);
  });

  test("複数の顧客担当者がいる場合、全員にアクセス権限が付与される", () => {
    const negotiation_id = "NEGO-20240415-007";
    const customer_id = "CUST-12351";
    const customer_contact_list = [
      { email: "contact_a@customer.example.com", name: "山田一郎" },
      { email: "contact_b@customer.example.com", name: "山田二郎" },
      { email: "contact_c@customer.example.com", name: "山田三郎" },
    ];
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T18:00:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_list,
      old_status,
      new_status,
      update_timestamp,
    };

    const result = grantCustomerPortalAccess(input_data);

    expect(result.success).toBe(true);
    expect(result.access_granted).toBe(true);
    expect(result.granted_count).toBe(3);
    expect(result.access_log_ids).toHaveLength(3);
  });

  test("権限付与済みの顧客担当者に重複して権限付与を試みた場合、既存権限を保持して処理完了となる", () => {
    const negotiation_id = "NEGO-20240415-008";
    const customer_id = "CUST-12352";
    const customer_contact_email = "contact_existing@customer.example.com";
    const customer_contact_name = "山田六郎";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T18:30:00Z");
    const existing_portal_user_id = "PU-EXISTING-001";

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
      existing_portal_user_id,
    };

    const result = grantCustomerPortalAccess(input_data);

    expect(result.success).toBe(true);
    expect(result.access_granted).toBe(true);
    expect(result.portal_user_id).toBe(existing_portal_user_id);
    expect(result.message).toMatch(/既に権限|保持/);
  });

  test("権限付与処理のタイムスタンプがシステムで正確に記録される", () => {
    const negotiation_id = "NEGO-20240415-009";
    const customer_id = "CUST-12353";
    const customer_contact_email = "contact7@customer.example.com";
    const customer_contact_name = "山田七郎";
    const old_status = "提案中";
    const new_status = "受注";
    const update_timestamp = new Date("2024-04-15T19:00:00Z");

    const input_data = {
      negotiation_id,
      customer_id,
      customer_contact_email,
      customer_contact_name,
      old_status,
      new_status,
      update_timestamp,
    };

    const result = grantCustomerPortalAccess(input_data);

    expect(result.permission_effective_timestamp).toEqual(expect.any(Date));
    const timestamp_ms = result.permission_effective_timestamp.getTime();
    const update_ms = update_timestamp.getTime();
    expect(timestamp_ms).toBeGreaterThanOrEqual(update_ms);
    expect(timestamp_ms - update_ms).toBeLessThan(5000);
  });
});