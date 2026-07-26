import { validateBillingTargetDataValidity } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-211: 請求対象データ妥当性検証 - 金額が0円の請求対象データが異常フラグで検出される", () => {
    // 前提: 請求対象データが営業管理システムに存在し、
    // 必須項目（顧客名、請求日、商品情報）が正常な値で入力されている状態
    // 金額フィールドに0円が入力されている
    const billing_target_data = {
      customer_name: "テスト顧客A",
      billing_date: "2024-01-15",
      product_info: "商品A",
      billing_amount: 0,
      billing_details: "請求明細",
    };

    // 発生条件: 営業担当者が妥当性検証機能を実行する
    const validation_result = validateBillingTargetDataValidity(
      billing_target_data
    );

    // 期待結果: 異常フラグが true で立てられ、
    // エラーメッセージに「請求金額」というキーワードが含まれる
    expect(validation_result.is_valid).toBe(false);
    expect(validation_result.has_error_flag).toBe(true);
    expect(validation_result.error_message).toMatch(/請求金額/);
  });
});