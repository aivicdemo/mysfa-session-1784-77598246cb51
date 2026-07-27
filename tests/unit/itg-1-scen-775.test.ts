import { extractBillingData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成 - 請求対象データ抽出', () => {
  // SCEN-775
  test('期間開始日と終了日が同日のとき、その日付のデータのみ抽出される', () => {
    const start_date = '2024-01-15';
    const end_date = '2024-01-15';
    const status_filter = 'confirmed';
    const customer_category_filter = 'all';

    const test_data = [
      {
        id: 1,
        transaction_date: '2024-01-14',
        amount: 50000,
        status: 'confirmed',
        customer_category: 'corporate',
      },
      {
        id: 2,
        transaction_date: '2024-01-15',
        amount: 75000,
        status: 'confirmed',
        customer_category: 'corporate',
      },
      {
        id: 3,
        transaction_date: '2024-01-15',
        amount: 75000,
        status: 'confirmed',
        customer_category: 'corporate',
      },
      {
        id: 4,
        transaction_date: '2024-01-16',
        amount: 60000,
        status: 'confirmed',
        customer_category: 'corporate',
      },
    ];

    const result = extractBillingData(
      test_data,
      start_date,
      end_date,
      status_filter,
      customer_category_filter
    );

    expect(result.extracted_records.length).toBe(2);
    expect(result.extracted_records[0].id).toBe(2);
    expect(result.extracted_records[0].transaction_date).toBe('2024-01-15');
    expect(result.extracted_records[0].amount).toBe(75000);
    expect(result.extracted_records[1].id).toBe(3);
    expect(result.extracted_records[1].transaction_date).toBe('2024-01-15');
    expect(result.extracted_records[1].amount).toBe(75000);
    expect(result.total_count).toBe(2);
  });
});