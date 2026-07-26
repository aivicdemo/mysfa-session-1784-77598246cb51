import { grantCustomerPortalAccess } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-111
  test("商談ステータスが受注に更新された時、該当顧客ユーザーにポータルアクセス権限が自動付与される", () => {
    const customerId = "CUST-20250101-001";
    const dealId = "DEAL-20250101-001";
    const userId = "USER-20250101-001";
    const userEmail = "contact@customer-company.jp";

    const initialDealData = {
      dealId,
      customerId,
      dealStatus: "検討中",
      dealAmount: 500000,
      dealName: "システム導入案件",
      closureDate: "2025-03-31",
    };

    const customerUserData = {
      userId,
      customerId,
      email: userEmail,
      userName: "山田太郎",
      hasPortalAccess: false,
    };

    // 初期状態: ステータスが「検討中」で、ユーザーがポータルアクセス権限を持たない
    expect(initialDealData.dealStatus).toBe("検討中");
    expect(customerUserData.hasPortalAccess).toBe(false);

    // 商談ステータスを「受注」に更新し、権限付与処理を実行
    const updatedDealData = {
      ...initialDealData,
      dealStatus: "受注",
    };

    const grantResult = grantCustomerPortalAccess({
      dealId: updatedDealData.dealId,
      customerId: updatedDealData.customerId,
      previousDealStatus: initialDealData.dealStatus,
      newDealStatus: updatedDealData.dealStatus,
      userIds: [userId],
    });

    // 権限付与の成功を確認
    expect(grantResult.success).toBe(true);
    expect(grantResult.grantedUserCount).toBe(1);
    expect(grantResult.grantedUserIds).toContain(userId);

    // 付与されたユーザーのアクセス権限を確認
    expect(grantResult.portalAccessStatus).toEqual({
      userId,
      hasAccess: true,
      accessLevel: "customer_portal_user",
      grantedAt: expect.any(String),
      customerId,
    });

    // 権限付与により、ユーザーがポータルにアクセス可能であることを検証
    expect(grantResult.portalAccessStatus.hasAccess).toBe(true);
    expect(grantResult.portalAccessStatus.accessLevel).toBe(
      "customer_portal_user"
    );
  });
});