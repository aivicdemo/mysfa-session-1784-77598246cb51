import { validateInvoiceContent } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-255
  test("顧客請求内容検証機能 - 税額計算結果が期待値から1円の誤差で異常フラグが立てられ営業に通知される", () => {
    const test_cases = [
      {
        description: "税額が期待値から1円少ない場合（999円）",
        input: {
          customer_id: "CUST-001",
          untaxed_amount: 10000,
          tax_rate: 0.1,
          calculated_tax: 999,
          invoiced_at: new Date("2024-01-15T10:00:00Z"),
        },
        expected_tax: 1000,
        expected_anomaly_flag: true,
        expected_notification_sent: true,
        expected_notification_message_includes: "999円",
      },
      {
        description: "税額が期待値から1円多い場合（1,001円）",
        input: {
          customer_id: "CUST-002",
          untaxed_amount: 10000,
          tax_rate: 0.1,
          calculated_tax: 1001,
          invoiced_at: new Date("2024-01-15T11:00:00Z"),
        },
        expected_tax: 1000,
        expected_anomaly_flag: true,
        expected_notification_sent: true,
        expected_notification_message_includes: "1,001円",
      },
      {
        description: "税額が期待値と正確に一致する場合（1,000円）",
        input: {
          customer_id: "CUST-003",
          untaxed_amount: 10000,
          tax_rate: 0.1,
          calculated_tax: 1000,
          invoiced_at: new Date("2024-01-15T12:00:00Z"),
        },
        expected_tax: 1000,
        expected_anomaly_flag: false,
        expected_notification_sent: false,
        expected_notification_message_includes: null,
      },
    ];

    test_cases.forEach((test_case) => {
      const result = validateInvoiceContent({
        customer_id: test_case.input.customer_id,
        untaxed_amount: test_case.input.untaxed_amount,
        tax_rate: test_case.input.tax_rate,
        calculated_tax: test_case.input.calculated_tax,
        invoiced_at: test_case.input.invoiced_at,
      });

      expect(result.expected_tax_amount).toBe(test_case.expected_tax);
      expect(result.anomaly_flag).toBe(test_case.expected_anomaly_flag);
      expect(result.notification_sent).toBe(test_case.expected_notification_sent);

      if (test_case.expected_anomaly_flag) {
        expect(result.notification_message).toContain(
          test_case.expected_notification_message_includes
        );
        expect(result.notification_message).toContain("税額");
        expect(result.notification_message).toContain("誤差");
        expect(result.notification_message).toContain(test_case.input.customer_id);
      } else {
        expect(result.notification_message).toBeNull();
      }

      expect(result.tax_difference).toBe(
        test_case.input.calculated_tax - test_case.expected_tax
      );
      expect(Math.abs(result.tax_difference)).toBeLessThanOrEqual(1);
    });

    // 複数顧客の検証結果が集約されることを確認
    const aggregated_results = test_cases.map((test_case) =>
      validateInvoiceContent({
        customer_id: test_case.input.customer_id,
        untaxed_amount: test_case.input.untaxed_amount,
        tax_rate: test_case.input.tax_rate,
        calculated_tax: test_case.input.calculated_tax,
        invoiced_at: test_case.input.invoiced_at,
      })
    );

    const anomaly_count = aggregated_results.filter(
      (r) => r.anomaly_flag === true
    ).length;
    expect(anomaly_count).toBe(2);

    const notification_count = aggregated_results.filter(
      (r) => r.notification_sent === true
    ).length;
    expect(notification_count).toBe(2);

    // 税額誤差が許容範囲（1円以内）外かどうかの境界値テスト
    const boundary_test_cases = [
      {
        description: "誤差が0円（正確）",
        calculated_tax: 1000,
        expected_within_tolerance: true,
      },
      {
        description: "誤差が0.5円未満（許容範囲内）",
        calculated_tax: 1000,
        expected_within_tolerance: true,
      },
      {
        description: "誤差が1円（許容範囲の限界）",
        calculated_tax: 1001,
        expected_within_tolerance: false,
      },
      {
        description: "誤差が-1円（許容範囲の限界）",
        calculated_tax: 999,
        expected_within_tolerance: false,
      },
    ];

    boundary_test_cases.forEach((boundary_case) => {
      const boundary_result = validateInvoiceContent({
        customer_id: "CUST-BOUNDARY",
        untaxed_amount: 10000,
        tax_rate: 0.1,
        calculated_tax: boundary_case.calculated_tax,
        invoiced_at: new Date("2024-01-15T13:00:00Z"),
      });

      const is_within_tolerance =
        Math.abs(boundary_result.tax_difference) === 0;

      if (!boundary_case.expected_within_tolerance && Math.abs(boundary_result.tax_difference) === 1) {
        expect(boundary_result.anomaly_flag).toBe(true);
      } else if (is_within_tolerance) {
        expect(boundary_result.anomaly_flag).toBe(false);
      }
    });

    // 通知内容の詳細検証
    const notification_detail_result = validateInvoiceContent({
      customer_id: "CUST-NOTIFY",
      untaxed_amount: 10000,
      tax_rate: 0.1,
      calculated_tax: 999,
      invoiced_at: new Date("2024-01-15T14:00:00Z"),
    });

    expect(notification_detail_result.notification_message).toMatch(/999円/);
    expect(notification_detail_result.notification_message).toMatch(
      /期待値.*1000円/
    );
    expect(notification_detail_result.notification_message).toMatch(
      /CUST-NOTIFY/
    );
  });
});