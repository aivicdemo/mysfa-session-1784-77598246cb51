import {
  detectUnbilledAndDelayedCasesWithSLA,
} from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-191
  test("月次決算時の未請求・遅延案件の段階的検出と対応SLA管理機能 - 営業担当者への対応指示SLA（期限1営業日前）に従って指示が発行される", () => {
    // 対応期限の1営業日前のタイムスタンプ（2024-04-29は月次決算期限2024-04-30の1営業日前）
    const current_date_iso = "2024-04-29T09:00:00Z";
    const response_deadline_iso = "2024-04-30T23:59:59Z";
    const business_days_before_deadline = 1;

    // テストデータ: 未請求案件
    const unbilled_case = {
      case_id: "CASE-20240429-001",
      customer_id: "CUST-12345",
      customer_name: "サンプル企業A",
      contract_status: "受注",
      invoice_issued: false,
      invoice_issue_date: null,
      contract_amount: 500000,
      salesperson_id: "SALES-001",
      salesperson_name: "営業太郎",
      contract_date_iso: "2024-04-20T10:00:00Z",
      expected_invoice_date_iso: "2024-04-30T23:59:59Z",
    };

    const input = {
      current_date_iso,
      response_deadline_iso,
      business_days_before_deadline,
      cases: [unbilled_case],
      system_timezone: "Asia/Tokyo",
    };

    const result = detectUnbilledAndDelayedCasesWithSLA(input);

    // 対応指示が発行されたことを確認
    expect(result.instruction_issued).toBe(true);

    // 対応指示の件数が1件であることを確認
    expect(result.issued_instructions.length).toBe(1);

    // 発行された対応指示の内容を検証
    const issued_instruction = result.issued_instructions[0];
    expect(issued_instruction.instruction_id).toBeDefined();
    expect(issued_instruction.case_id).toBe("CASE-20240429-001");
    expect(issued_instruction.salesperson_id).toBe("SALES-001");
    expect(issued_instruction.salesperson_name).toBe("営業太郎");
    expect(issued_instruction.instruction_type).toBe("unbilled");
    expect(issued_instruction.instruction_content).toContain("未請求案件");
    expect(issued_instruction.customer_name).toBe("サンプル企業A");
    expect(issued_instruction.contract_amount).toBe(500000);

    // 対応指示の発行日時がシステム現在日時と一致することを確認
    expect(issued_instruction.issued_date_iso).toBe("2024-04-29T09:00:00Z");

    // SLA期限1営業日前のタイミングで指示が発行されたことを確認
    expect(issued_instruction.sla_timing_days_before_deadline).toBe(1);

    // 対応期限がレスポンス期限と同じであることを確認
    expect(issued_instruction.sla_response_deadline_iso).toBe(
      "2024-04-30T23:59:59Z"
    );

    // 対応指示が営業担当者に割り当てられていることを確認
    expect(issued_instruction.assigned_to_salesperson).toBe(true);

    // 通知履歴が記録されていることを確認
    expect(result.notification_records.length).toBe(1);
    const notification = result.notification_records[0];
    expect(notification.instruction_id).toBe(
      issued_instruction.instruction_id
    );
    expect(notification.recipient_id).toBe("SALES-001");
    expect(notification.notification_type).toBe("assignment");
    expect(notification.sent_date_iso).toBe("2024-04-29T09:00:00Z");
    expect(notification.status).toBe("sent");

    // 検出対象の案件がリストに含まれていることを確認
    expect(result.detected_cases.length).toBe(1);
    expect(result.detected_cases[0].case_id).toBe("CASE-20240429-001");
    expect(result.detected_cases[0].category).toBe("unbilled");
  });
});