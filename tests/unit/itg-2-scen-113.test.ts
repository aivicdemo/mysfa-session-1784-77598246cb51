import { grantPortalAccessPermissions } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-113: [edge] 顧客ポータルアクセス権限自動付与機能 - 複数の顧客担当者が同一商談に紐付く場合、全員に権限が付与される
  test("同一商談に紐付く複数の顧客担当者全員にアクセス権限が付与される", async () => {
    const dealId = "DEAL-20240115-001";
    const customerId = "CUST-20240115-001";

    const contactsData = [
      {
        contactId: "CONTACT-001",
        contactName: "担当者A",
        email: "contact-a@example.com",
        dealId: dealId,
        customerId: customerId,
      },
      {
        contactId: "CONTACT-002",
        contactName: "担当者B",
        email: "contact-b@example.com",
        dealId: dealId,
        customerId: customerId,
      },
      {
        contactId: "CONTACT-003",
        contactName: "担当者C",
        email: "contact-c@example.com",
        dealId: dealId,
        customerId: customerId,
      },
    ];

    const result = await grantPortalAccessPermissions({
      dealId: dealId,
      customerId: customerId,
      contacts: contactsData,
      grantedAt: new Date("2024-01-15T10:00:00Z"),
    });

    expect(result.totalContactsProcessed).toBe(3);
    expect(result.successfulGrants).toBe(3);
    expect(result.failedGrants).toBe(0);

    expect(result.grantedPermissions).toHaveLength(3);

    expect(result.grantedPermissions[0]).toEqual({
      contactId: "CONTACT-001",
      contactName: "担当者A",
      email: "contact-a@example.com",
      dealId: dealId,
      customerId: customerId,
      permissionGrantedAt: new Date("2024-01-15T10:00:00Z"),
      accessLevel: "PORTAL_USER",
      isDuplicate: false,
    });

    expect(result.grantedPermissions[1]).toEqual({
      contactId: "CONTACT-002",
      contactName: "担当者B",
      email: "contact-b@example.com",
      dealId: dealId,
      customerId: customerId,
      permissionGrantedAt: new Date("2024-01-15T10:00:00Z"),
      accessLevel: "PORTAL_USER",
      isDuplicate: false,
    });

    expect(result.grantedPermissions[2]).toEqual({
      contactId: "CONTACT-003",
      contactName: "担当者C",
      email: "contact-c@example.com",
      dealId: dealId,
      customerId: customerId,
      permissionGrantedAt: new Date("2024-01-15T10:00:00Z"),
      accessLevel: "PORTAL_USER",
      isDuplicate: false,
    });

    expect(result.accessLogRecords).toHaveLength(3);
    expect(result.accessLogRecords[0]).toEqual({
      contactId: "CONTACT-001",
      timestamp: new Date("2024-01-15T10:00:00Z"),
      action: "PERMISSION_GRANTED",
      dealId: dealId,
      customerId: customerId,
    });

    expect(result.accessLogRecords[1]).toEqual({
      contactId: "CONTACT-002",
      timestamp: new Date("2024-01-15T10:00:00Z"),
      action: "PERMISSION_GRANTED",
      dealId: dealId,
      customerId: customerId,
    });

    expect(result.accessLogRecords[2]).toEqual({
      contactId: "CONTACT-003",
      timestamp: new Date("2024-01-15T10:00:00Z"),
      action: "PERMISSION_GRANTED",
      dealId: dealId,
      customerId: customerId,
    });

    const newContactData = {
      contactId: "CONTACT-004",
      contactName: "担当者D",
      email: "contact-d@example.com",
      dealId: dealId,
      customerId: customerId,
    };

    const resultAfterAddition = await grantPortalAccessPermissions({
      dealId: dealId,
      customerId: customerId,
      contacts: [...contactsData, newContactData],
      grantedAt: new Date("2024-01-16T11:00:00Z"),
    });

    expect(resultAfterAddition.totalContactsProcessed).toBe(4);
    expect(resultAfterAddition.successfulGrants).toBe(4);
    expect(resultAfterAddition.failedGrants).toBe(0);

    expect(resultAfterAddition.grantedPermissions).toHaveLength(4);

    expect(resultAfterAddition.grantedPermissions[3]).toEqual({
      contactId: "CONTACT-004",
      contactName: "担当者D",
      email: "contact-d@example.com",
      dealId: dealId,
      customerId: customerId,
      permissionGrantedAt: new Date("2024-01-16T11:00:00Z"),
      accessLevel: "PORTAL_USER",
      isDuplicate: false,
    });

    expect(resultAfterAddition.accessLogRecords).toHaveLength(4);
    expect(resultAfterAddition.accessLogRecords[3]).toEqual({
      contactId: "CONTACT-004",
      timestamp: new Date("2024-01-16T11:00:00Z"),
      action: "PERMISSION_GRANTED",
      dealId: dealId,
      customerId: customerId,
    });
  });
});