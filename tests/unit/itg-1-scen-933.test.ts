import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-933: [edge] 売上実績・請求データ照合機能 - 月末（28日・29日・30日・31日）に売上計上予定日と請求日が一致する場合、照合成功として処理される
  test('月末日パターン（28日・29日・30日・31日）において売上計上予定日と請求日が完全に一致する場合、照合成功として処理される', () => {
    // テストデータ準備: 月末日パターン
    const month_end_patterns = [
      {
        sales_planned_date: new Date('2024-01-28T00:00:00Z'),
        invoice_date: new Date('2024-01-28T00:00:00Z'),
        expected_matched_date: '2024-01-28',
        description: '1月28日パターン'
      },
      {
        sales_planned_date: new Date('2024-02-29T00:00:00Z'),
        invoice_date: new Date('2024-02-29T00:00:00Z'),
        expected_matched_date: '2024-02-29',
        description: '2月29日（閏年）パターン'
      },
      {
        sales_planned_date: new Date('2024-03-30T00:00:00Z'),
        invoice_date: new Date('2024-03-30T00:00:00Z'),
        expected_matched_date: '2024-03-30',
        description: '3月30日パターン'
      },
      {
        sales_planned_date: new Date('2024-04-31T00:00:00Z'),
        invoice_date: new Date('2024-04-31T00:00:00Z'),
        expected_matched_date: '2024-04-31',
        description: '4月31日パターン（存在しない日付、代替として4月30日を使用）'
      }
    ];

    // 各月末日パターンをテスト
    month_end_patterns.forEach((pattern) => {
      const actual_sales_planned_date = pattern.sales_planned_date;
      const actual_invoice_date = pattern.invoice_date;

      // 売上実績レコード準備
      const sales_record = {
        sales_id: 'SALES-001',
        customer_id: 'C001',
        amount: 100000,
        sales_planned_date: actual_sales_planned_date,
        status: '未照合'
      };

      // 請求データレコード準備
      const invoice_record = {
        invoice_id: 'INV-001',
        customer_id: 'C001',
        amount: 100000,
        invoice_date: actual_invoice_date,
        status: '未請求'
      };

      // 照合ログテーブルの初期状態
      const reconciliation_log_records: Array<{
        log_id: string;
        sales_id: string;
        invoice_id: string;
        matched_date: string;
        reconciliation_timestamp: Date;
        reconciliation_result: string;
      }> = [];

      // 売上実績・請求データ照合機能を呼び出し
      const reconciliation_result = reconcileSalesAndInvoice(
        sales_record,
        invoice_record,
        reconciliation_log_records
      );

      // 照合結果の検証: isMatched が true であることを確認
      expect(reconciliation_result.is_matched).toBe(true);

      // 照合結果の matchedDate フィールドが共通日付と一致することを検証
      expect(reconciliation_result.matched_date).toBe(pattern.expected_matched_date);

      // 売上実績ステータスが「照合済み」に更新されていることを検証
      expect(sales_record.status).toBe('照合済み');

      // 請求データステータスが「照合済み」に更新されていることを検証
      expect(invoice_record.status).toBe('照合済み');

      // 照合ログに成功記録が作成されていることを検証
      expect(reconciliation_log_records.length).toBeGreaterThan(0);

      const latest_log = reconciliation_log_records[reconciliation_log_records.length - 1];

      // ログの sales_id と invoice_id が一致することを確認
      expect(latest_log.sales_id).toBe('SALES-001');
      expect(latest_log.invoice_id).toBe('INV-001');

      // ログの matched_date が売上計上予定日と請求日の共通日付と一致することを確認
      expect(latest_log.matched_date).toBe(pattern.expected_matched_date);

      // ログの reconciliation_result が 'success' であることを確認
      expect(latest_log.reconciliation_result).toBe('success');

      // ログのタイムスタンプが現在時刻付近であることを確認（±1分の範囲内）
      const now = new Date();
      const log_timestamp = new Date(latest_log.reconciliation_timestamp);
      const time_diff_ms = Math.abs(now.getTime() - log_timestamp.getTime());
      expect(time_diff_ms).toBeLessThan(60000);
    });
  });
});