import { generateMonthlyReportWithZeroSales } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 月次営業成績報告書生成機能', () => {
  // SCEN-047: [edge] 月次営業成績報告書生成機能 - 売上0円・件数0件の場合も正常に報告書が生成される
  test('売上0円・件数0件の場合でも報告書が正常に生成されること', () => {
    const input_customer_id = 'CUST-999';
    const input_period_year = 2024;
    const input_period_month = 1;
    const input_sales_amount = 0;
    const input_deal_count = 0;
    const input_progress_rate = 0;
    const input_timestamp = new Date('2024-01-31T23:59:59Z');

    const result = generateMonthlyReportWithZeroSales({
      customer_id: input_customer_id,
      period_year: input_period_year,
      period_month: input_period_month,
      sales_amount: input_sales_amount,
      deal_count: input_deal_count,
      progress_rate: input_progress_rate,
      generated_at: input_timestamp,
    });

    // 報告書が正常に生成されること
    expect(result).toBeDefined();
    expect(result.report_id).toBeDefined();
    expect(result.report_id).toMatch(/^REPORT-/);

    // 報告書メタデータが正しく設定されること
    expect(result.customer_id).toBe(input_customer_id);
    expect(result.period_year).toBe(2024);
    expect(result.period_month).toBe(1);
    expect(result.generated_at).toEqual(input_timestamp);

    // 売上0円・件数0件が正しく反映されること
    expect(result.sales_amount).toBe(0);
    expect(result.deal_count).toBe(0);
    expect(result.progress_rate).toBe(0);

    // レポート内容が生成されること
    expect(result.report_content).toBeDefined();
    expect(typeof result.report_content).toBe('string');
    expect(result.report_content.length).toBeGreaterThan(0);

    // レイアウトが正常であること（ヘッダー・フッター・本体の存在確認）
    expect(result.report_content).toContain('REPORT_HEADER');
    expect(result.report_content).toContain('REPORT_BODY');
    expect(result.report_content).toContain('REPORT_FOOTER');

    // 0の値が正しく表示されていること
    expect(result.report_content).toMatch(/売上：\s*0\s*円/);
    expect(result.report_content).toMatch(/件数：\s*0\s*件/);
    expect(result.report_content).toMatch(/進捗率：\s*0\s*%/);

    // ファイル形式がダウンロード可能な形式であること
    expect(result.file_format).toBe('PDF');
    expect(result.file_size_bytes).toBeGreaterThan(0);
    expect(result.is_downloadable).toBe(true);

    // エラーフラグがないこと
    expect(result.has_error).toBe(false);
    expect(result.error_message).toBeNull();

    // 報告書のバリデーション状態が成功であること
    expect(result.validation_status).toBe('SUCCESS');
    expect(result.validation_passed).toBe(true);
  });
});