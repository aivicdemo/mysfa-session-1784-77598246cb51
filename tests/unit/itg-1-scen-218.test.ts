import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談ステータス更新・請求データ紐付け機能", () => {
  // SCEN-218
  test("商談ステータスを成約に変更する際、必須項目チェックで顧客メールアドレスが欠けている場合にステータス更新が拒否される", () => {
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const currentStatus = "提案中";
    const customerName = "テスト顧客株式会社";
    const customerPhone = "090-1234-5678";
    const customerEmail = null;
    const newStatus = "成約";

    const dealRecord = {
      dealId: dealId,
      customerId: customerId,
      status: currentStatus,
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
    };

    const updateRequest = {
      dealId: dealId,
      newStatus: newStatus,
    };

    expect(() =>
      updateDealStatusToContracted(dealRecord, updateRequest)
    ).toThrow(/顧客メールアドレス/);
  });
});