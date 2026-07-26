import { updateDealRecord } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-220
  test("営業担当者が顧客対応状況を商談レコードに記録すると、記録内容が正しく保存される", () => {
    const deal_id = "DEAL-001";
    const customer_id = "CUST-2024-0001";
    const sales_rep_id = "USER-00123";
    const status_before = "初期接触";
    const status_after = "提案中";
    const proposal_content = "製品A導入による業務効率化提案";
    const saved_at = new Date("2024-04-15T14:30:00Z");
    const updated_at = new Date("2024-04-15T14:30:00Z");

    const input = {
      deal_id: deal_id,
      customer_id: customer_id,
      sales_rep_id: sales_rep_id,
      status: status_after,
      proposal_content: proposal_content,
      updated_at: updated_at
    };

    const result = updateDealRecord(input);

    // 進捗ステータスが正しく更新されている
    expect(result.status).toBe(status_after);

    // 提案内容が正確に保存されている
    expect(result.proposal_content).toBe(proposal_content);

    // 商談IDが変わらず保持されている
    expect(result.deal_id).toBe(deal_id);

    // 顧客IDが変わらず保持されている
    expect(result.customer_id).toBe(customer_id);

    // 営業担当者IDが変わらず保持されている
    expect(result.sales_rep_id).toBe(sales_rep_id);

    // 更新日時が記録されている
    expect(result.updated_at).toEqual(updated_at);

    // 保存が成功したことを示すフラグ
    expect(result.saved).toBe(true);

    // 保存メッセージが返却されている
    expect(result.message).toMatch(/保存/);

    // ステータス変更が記録されている
    expect(result.status_changed).toBe(true);

    // 提案内容が空ではない
    expect(result.proposal_content.length).toBeGreaterThan(0);

    // ページリロード後も同じデータが返却される（キャッシュ整合性）
    const reload_result = updateDealRecord(input);
    expect(reload_result.status).toBe(status_after);
    expect(reload_result.proposal_content).toBe(proposal_content);
    expect(reload_result.deal_id).toBe(deal_id);

    // データベースに正しく永続化されたことを確認
    expect(result.persisted).toBe(true);
  });
});