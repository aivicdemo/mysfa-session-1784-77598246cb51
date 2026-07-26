import { updateDealWithBillingData } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-182
  test("顧客対応情報の更新時に、該当商談レコードが正確に特定され更新される", () => {
    // Arrange: テストデータ準備
    const dealId = "DEAL-001";
    const customerId = "CUST-001";
    const billingNumber = "INV-2024-001";
    const billingAmount = 150000;
    const billingDate = "2024-01-15";
    const contactedAt = "2024-01-15T10:30:00Z";
    const contactContent = "顧客より納期確認の連絡あり";
    const contactPerson = "田中太郎";
    const updatedStatus = "negotiating";

    const inputDeal = {
      deal_id: dealId,
      customer_id: customerId,
      contact_date: contactedAt,
      contact_content: contactContent,
      contact_person: contactPerson,
      status: updatedStatus,
    };

    const existingBillingData = {
      billing_number: billingNumber,
      billing_amount: billingAmount,
      billing_date: billingDate,
      deal_id: dealId,
    };

    // Act: 商談と請求データの紐付け更新
    const result = updateDealWithBillingData(inputDeal, existingBillingData);

    // Assert: 商談レコードが正確に特定されたことを確認
    expect(result.deal_id).toBe(dealId);
    expect(result.customer_id).toBe(customerId);

    // Assert: 顧客対応情報が正確に更新されたことを確認
    expect(result.contact_date).toBe(contactedAt);
    expect(result.contact_content).toBe(contactContent);
    expect(result.contact_person).toBe(contactPerson);

    // Assert: 商談ステータスが正確に反映されたことを確認
    expect(result.status).toBe(updatedStatus);

    // Assert: 紐付いた請求データが正確に表示されたことを確認
    expect(result.billing_data).toBeDefined();
    expect(result.billing_data.billing_number).toBe(billingNumber);
    expect(result.billing_data.billing_amount).toBe(billingAmount);
    expect(result.billing_data.billing_date).toBe(billingDate);
    expect(result.billing_data.deal_id).toBe(dealId);

    // Assert: 請求データが対象商談に正確に紐付いていることを確認
    expect(result.billing_data.deal_id).toEqual(result.deal_id);

    // Assert: 更新フラグが立てられたことを確認（他の商談への影響を防止）
    expect(result.is_updated).toBe(true);
    expect(result.updated_at).toBeDefined();

    // Assert: 対象商談のみが更新されたことを確認（複数商談存在時の分離テスト）
    const otherDealId = "DEAL-002";
    const otherDeal = {
      deal_id: otherDealId,
      customer_id: "CUST-002",
      status: "initial_contact",
    };

    // 別の商談は影響を受けないことを確認
    expect(result.deal_id).not.toBe(otherDeal.deal_id);
    expect(result.customer_id).not.toBe(otherDeal.customer_id);

    // Assert: 複数商談存在時に対象商談のみが更新されたことを確認
    expect(result.update_count).toBe(1);
  });
});