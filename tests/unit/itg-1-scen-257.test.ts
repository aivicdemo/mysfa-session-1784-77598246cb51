import { detectUnbilledDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-257: 受注ステータスかつ請求書未発行の商談が未請求案件として検出される", () => {
    // 【前提】営業管理システムに商談レコードが存在し、ステータスと請求書発行状況が記録されている状態
    // 【トリガー】月次決算期限到来時に、経理担当者が商談ステータスと請求書発行状況を照合する処理を実行
    // 【期待結果】ステータスが『受注』かつ請求書が未発行の案件を『未請求案件』として特定し、リスト化する

    const test_deal_id_1 = "DEAL-001";
    const test_deal_name_1 = "顧客A 提案商談";
    const test_customer_id_1 = "CUST-001";
    const test_customer_name_1 = "顧客A";
    const test_amount_1 = 500000;

    const test_deal_id_2 = "DEAL-002";
    const test_deal_name_2 = "顧客B 提案商談";
    const test_customer_id_2 = "CUST-002";
    const test_customer_name_2 = "顧客B";
    const test_amount_2 = 800000;

    const test_deal_id_3 = "DEAL-003";
    const test_deal_name_3 = "顧客C 完了商談";
    const test_customer_id_3 = "CUST-003";
    const test_customer_name_3 = "顧客C";
    const test_amount_3 = 300000;

    // テストデータ: 商談レコード配列
    const deals = [
      {
        dealId: test_deal_id_1,
        dealName: test_deal_name_1,
        customerId: test_customer_id_1,
        customerName: test_customer_name_1,
        status: "受注",
        amount: test_amount_1,
        invoiceIssuedDate: null, // 未発行
      },
      {
        dealId: test_deal_id_2,
        dealName: test_deal_name_2,
        customerId: test_customer_id_2,
        customerName: test_customer_name_2,
        status: "提案中",
        amount: test_amount_2,
        invoiceIssuedDate: null, // 未発行（但し提案中なので検出対象外）
      },
      {
        dealId: test_deal_id_3,
        dealName: test_deal_name_3,
        customerId: test_customer_id_3,
        customerName: test_customer_name_3,
        status: "受注",
        amount: test_amount_3,
        invoiceIssuedDate: "2024-01-15", // 発行済み（検出対象外）
      },
    ];

    // 売上請求ズレ検出機能を実行
    const result = detectUnbilledDeals(deals);

    // 【検証】未請求案件として検出されるべき件数
    // 受注ステータスかつ請求書未発行: DEAL-001 のみ
    expect(result.unbilledDeals).toHaveLength(1);

    // 【検証】検出された未請求案件の詳細情報
    const detected_unbilled = result.unbilledDeals[0];
    expect(detected_unbilled.dealId).toBe(test_deal_id_1);
    expect(detected_unbilled.dealName).toBe(test_deal_name_1);
    expect(detected_unbilled.customerId).toBe(test_customer_id_1);
    expect(detected_unbilled.customerName).toBe(test_customer_name_1);
    expect(detected_unbilled.status).toBe("受注");
    expect(detected_unbilled.amount).toBe(test_amount_1);
    expect(detected_unbilled.invoiceIssuedDate).toBeNull();

    // 【検証】結果の総額計算
    const expected_total_unbilled_amount = test_amount_1;
    expect(result.totalUnbilledAmount).toBe(expected_total_unbilled_amount);

    // 【検証】検出ステータス
    expect(result.hasUnbilledDeals).toBe(true);
  });
});