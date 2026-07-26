import { grantAccessPermissionOnDealCreation } from "../../src/logic/it-1784969823049-2-1-3";

describe("顧客ポータルのアクセス制御と権限管理", () => {
  // SCEN-112: [error] 顧客ポータルアクセス権限自動付与機能 - 顧客企業未登録の状態で商談作成を試みた場合、権限付与が失敗し適切なエラーが返される
  test("should fail to grant access permission and reject deal creation when customer is not registered", () => {
    const dealData = {
      dealId: "DEAL-20250226-001",
      dealName: "New Deal",
      customerId: "CUST-NOT-EXIST",
      dealAmount: 500000,
      dealStatus: "成約",
      dealDescription: "Product purchase negotiation",
    };

    const inputPayload = {
      deal: dealData,
      dealCreatorUserId: "USER-SALES-001",
      customerRegistrationStatus: "not_registered",
    };

    expect(() =>
      grantAccessPermissionOnDealCreation(inputPayload)
    ).toThrow(/顧客企業未登録/);
  });
});