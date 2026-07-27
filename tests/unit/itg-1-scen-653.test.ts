import { reconcileSalesAndInvoices } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-653
  test('対象売上実績が複数件のとき、全件の照合結果が返される', () => {
    // Arrange
    const sales_records = [
      {
        id: 'sales_001',
        amount: 100000,
        transaction_date: '2024-01-15',
      },
      {
        id: 'sales_002',
        amount: 150000,
        transaction_date: '2024-01-16',
      },
      {
        id: 'sales_003',
        amount: 200000,
        transaction_date: '2024-01-17',
      },
    ];

    const invoice_records = [
      {
        id: 'invoice_001',
        sales_id: 'sales_001',
        amount: 100000,
      },
      {
        id: 'invoice_002',
        sales_id: 'sales_002',
        amount: 145000,
      },
      {
        id: 'invoice_003',
        sales_id: 'sales_003',
        amount: 200000,
      },
    ];

    // Act
    const result = reconcileSalesAndInvoices(sales_records, invoice_records);

    // Assert
    expect(result).toHaveLength(3);

    // 1件目: 完全一致
    expect(result[0]).toEqual({
      sales_id: 'sales_001',
      invoice_id: 'invoice_001',
      sales_amount: 100000,
      invoice_amount: 100000,
      difference_amount: 0,
      status: '一致',
    });

    // 2件目: ズレあり（請求書が5,000円少ない）
    expect(result[1]).toEqual({
      sales_id: 'sales_002',
      invoice_id: 'invoice_002',
      sales_amount: 150000,
      invoice_amount: 145000,
      difference_amount: 5000,
      status: '不一致',
    });

    // 3件目: 完全一致
    expect(result[2]).toEqual({
      sales_id: 'sales_003',
      invoice_id: 'invoice_003',
      sales_amount: 200000,
      invoice_amount: 200000,
      difference_amount: 0,
      status: '一致',
    });
  });
});