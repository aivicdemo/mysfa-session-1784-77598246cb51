import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('月次決算レポート生成機能 - 対象期間が同日のエッジケース', () => {
  test('SCEN-320: 対象期間の開始日と終了日が同日のとき、その1日分のレコードが正確に集計される', () => {
    // Arrange: テスト用の売上レコード
    const targetDate = new Date('2024-01-15T00:00:00Z');
    const salesRecords = [
      {
        customer_id: 'CUST_A',
        customer_name: 'Customer A',
        sales_amount: 100000,
        recorded_date: new Date('2024-01-15T09:30:00Z'),
        deal_status: 'closed_won',
        invoice_id: 'INV_001',
      },
      {
        customer_id: 'CUST_B',
        customer_name: 'Customer B',
        sales_amount: 50000,
        recorded_date: new Date('2024-01-15T14:15:00Z'),
        deal_status: 'closed_won',
        invoice_id: 'INV_002',
      },
      {
        customer_id: 'CUST_C',
        customer_name: 'Customer C',
        sales_amount: 25000,
        recorded_date: new Date('2024-01-15T16:45:00Z'),
        deal_status: 'closed_won',
        invoice_id: 'INV_003',
      },
    ];

    // スタブ: DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC_STUB_001',
        storage_path: '/stub/reports/settlement_2024_01_15.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_url: 'https://stub.example.com/share/DOC_STUB_001',
        expiry_time: new Date('2024-01-16T00:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    // スタブ: NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ sent: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ sent: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        opened: true,
      }),
    };

    // スタブ: データソース（売上レコード取得）
    const mockDataSource = {
      fetchSalesRecords: jest.fn().mockResolvedValue(salesRecords),
      fetchInvoiceDetails: jest.fn().mockResolvedValue([
        {
          invoice_id: 'INV_001',
          customer_id: 'CUST_A',
          amount: 100000,
          issued_date: new Date('2024-01-15T09:30:00Z'),
        },
        {
          invoice_id: 'INV_002',
          customer_id: 'CUST_B',
          amount: 50000,
          issued_date: new Date('2024-01-15T14:15:00Z'),
        },
        {
          invoice_id: 'INV_003',
          customer_id: 'CUST_C',
          amount: 25000,
          issued_date: new Date('2024-01-15T16:45:00Z'),
        },
      ]),
    };

    // Act: 月次決算レポート生成関数を実行
    // 対象期間: 2024-01-15 ～ 2024-01-15（同日）
    const report = generateMonthlySettlementReport(
      {
        period_start_date: new Date('2024-01-15T00:00:00Z'),
        period_end_date: new Date('2024-01-15T23:59:59Z'),
        report_type: 'monthly_settlement',
      },
      mockDataSource,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // Assert: 集計結果の検証
    // 1. 売上合計: 175,000円（100,000 + 50,000 + 25,000）
    expect(report.aggregated_sales_total).toBe(175000);

    // 2. レコード件数: 3件
    expect(report.record_count).toBe(3);

    // 3. 顧客別の売上が正確に集計されている
    expect(report.sales_by_customer).toEqual([
      {
        customer_id: 'CUST_A',
        customer_name: 'Customer A',
        total_sales: 100000,
        record_count: 1,
      },
      {
        customer_id: 'CUST_B',
        customer_name: 'Customer B',
        total_sales: 50000,
        record_count: 1,
      },
      {
        customer_id: 'CUST_C',
        customer_name: 'Customer C',
        total_sales: 25000,
        record_count: 1,
      },
    ]);

    // 4. 対象期間が1日のため、日次集計と月次集計の結果が同一
    expect(report.daily_aggregation_total).toBe(report.aggregated_sales_total);
    expect(report.daily_aggregation_total).toBe(175000);

    // 5. レポート生成の基本情報が正確
    expect(report.report_period_start).toEqual(
      new Date('2024-01-15T00:00:00Z')
    );
    expect(report.report_period_end).toEqual(
      new Date('2024-01-15T23:59:59Z')
    );

    // 6. 外部サービスが呼び出された（スタブが正常に動作）
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // 7. データソースから正しく売上レコードが取得されたことを確認
    expect(mockDataSource.fetchSalesRecords).toHaveBeenCalledWith({
      period_start_date: new Date('2024-01-15T00:00:00Z'),
      period_end_date: new Date('2024-01-15T23:59:59Z'),
    });
  });
});