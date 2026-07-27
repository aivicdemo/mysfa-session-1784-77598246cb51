import { generateMonthlyDecisionReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-314: 月次決算レポート生成機能 - 商談ステータスが「受注確定」のレコードのみが集計対象として含まれる', async () => {
    // Arrange: テストデータの準備
    const targetMonth = '2024-04';
    const dealDataList = [
      {
        deal_id: 'DEAL_A',
        customer_name: 'Customer A',
        status: '受注確定',
        amount: 1000000,
        registered_date: '2024-04-10',
      },
      {
        deal_id: 'DEAL_B',
        customer_name: 'Customer B',
        status: '提案中',
        amount: 500000,
        registered_date: '2024-04-12',
      },
      {
        deal_id: 'DEAL_C',
        customer_name: 'Customer C',
        status: '受注確定',
        amount: 800000,
        registered_date: '2024-04-15',
      },
      {
        deal_id: 'DEAL_D',
        customer_name: 'Customer D',
        status: '失注',
        amount: 300000,
        registered_date: '2024-04-18',
      },
      {
        deal_id: 'DEAL_E',
        customer_name: 'Customer E',
        status: '受注確定',
        amount: 600000,
        registered_date: '2024-05-10',
      },
    ];

    // Mock DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'doc_123456',
        file_url: 'https://storage.example.com/monthly_report_2024_04.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://share.example.com/abc123def456',
        expires_at: '2024-05-04T23:59:59Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Act: レポート生成処理を実行
    const reportResult = await generateMonthlyDecisionReport(
      targetMonth,
      dealDataList,
      mockDocumentStorageAdapter
    );

    // Assert: 集計対象が正しく絞り込まれている
    expect(reportResult.aggregated_deals).toHaveLength(2);
    expect(reportResult.aggregated_deals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: 'DEAL_A',
          status: '受注確定',
          amount: 1000000,
        }),
        expect.objectContaining({
          deal_id: 'DEAL_C',
          status: '受注確定',
          amount: 800000,
        }),
      ])
    );

    // Assert: 集計合計金額が180万円であること
    expect(reportResult.total_amount).toBe(1800000);

    // Assert: 除外対象の商談が含まれていないこと
    expect(
      reportResult.aggregated_deals.some((deal) => deal.deal_id === 'DEAL_B')
    ).toBe(false);
    expect(
      reportResult.aggregated_deals.some((deal) => deal.deal_id === 'DEAL_D')
    ).toBe(false);
    expect(
      reportResult.aggregated_deals.some((deal) => deal.deal_id === 'DEAL_E')
    ).toBe(false);

    // Assert: DocumentStorageAdapter の uploadDocument が呼び出されていること
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        report_month: targetMonth,
        total_amount: 1800000,
        deal_count: 2,
      })
    );

    // Assert: レポートにアップロード結果が反映されている
    expect(reportResult.document_id).toBe('doc_123456');
    expect(reportResult.file_url).toBe(
      'https://storage.example.com/monthly_report_2024_04.pdf'
    );
  });
});