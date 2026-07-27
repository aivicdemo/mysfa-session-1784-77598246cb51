import { reconcileDealStatusAndInvoicing } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-688
  test('月次決算期限3営業日前に照合開始時、ステータスと請求書が完全に一致する案件は検出結果に含まれない', () => {
    // Arrange: 決算期限を基準に3営業日前を照合開始日時として設定
    const settlementDeadline = new Date('2024-04-30T23:59:59Z');
    const reconciliationStartDatetime = new Date('2024-04-25T09:00:00Z'); // 3営業日前（木曜日）

    // ステータスと請求書が完全に一致する案件3件
    const matchingDeal1 = {
      dealId: 'DEAL-001',
      customerId: 'CUST-A',
      dealStatus: '受注済み',
      contractAmount: 100000,
      salesRecognitionDate: new Date('2024-04-20T00:00:00Z'),
      invoiceId: 'INV-001',
      invoiceStatus: '発行済み',
      invoiceAmount: 100000,
      invoiceIssuanceDate: new Date('2024-04-20T00:00:00Z'),
    };

    const matchingDeal2 = {
      dealId: 'DEAL-002',
      customerId: 'CUST-B',
      dealStatus: '受注済み',
      contractAmount: 250000,
      salesRecognitionDate: new Date('2024-04-18T00:00:00Z'),
      invoiceId: 'INV-002',
      invoiceStatus: '発行済み',
      invoiceAmount: 250000,
      invoiceIssuanceDate: new Date('2024-04-18T00:00:00Z'),
    };

    const matchingDeal3 = {
      dealId: 'DEAL-003',
      customerId: 'CUST-C',
      dealStatus: '受注済み',
      contractAmount: 75000,
      salesRecognitionDate: new Date('2024-04-15T00:00:00Z'),
      invoiceId: 'INV-003',
      invoiceStatus: '発行済み',
      invoiceAmount: 75000,
      invoiceIssuanceDate: new Date('2024-04-15T00:00:00Z'),
    };

    // ステータスと請求書が不一致の案件2件
    const mismatchedDeal1 = {
      dealId: 'DEAL-004',
      customerId: 'CUST-D',
      dealStatus: '受注済み',
      contractAmount: 150000,
      salesRecognitionDate: new Date('2024-04-10T00:00:00Z'),
      invoiceId: null,
      invoiceStatus: '未発行',
      invoiceAmount: null,
      invoiceIssuanceDate: null,
    };

    const mismatchedDeal2 = {
      dealId: 'DEAL-005',
      customerId: 'CUST-E',
      dealStatus: '受注済み',
      contractAmount: 200000,
      salesRecognitionDate: new Date('2024-04-12T00:00:00Z'),
      invoiceId: 'INV-005',
      invoiceStatus: '発行済み',
      invoiceAmount: 180000,
      invoiceIssuanceDate: new Date('2024-04-13T00:00:00Z'),
    };

    const allDeals = [
      matchingDeal1,
      matchingDeal2,
      matchingDeal3,
      mismatchedDeal1,
      mismatchedDeal2,
    ];

    // モック化されたDocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentUrl: 'https://example.com/doc' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Act: 商談ステータスと請求書発行状況の自動照合を実行
    const result = reconcileDealStatusAndInvoicing(
      allDeals,
      reconciliationStartDatetime,
      settlementDeadline,
      mockDocumentStorageAdapter,
    );

    // Assert: ズレ検出結果レポートを検証
    expect(result).toBeDefined();
    expect(result.reconciliationStartDatetime).toEqual(reconciliationStartDatetime);
    expect(result.settlementDeadline).toEqual(settlementDeadline);

    // ズレなし案件はレポートに含まれるが、ズレ検出件数には計上されない
    expect(result.matchedDeals).toHaveLength(3);
    expect(result.matchedDeals).toContainEqual(
      expect.objectContaining({
        dealId: 'DEAL-001',
        matchStatus: 'ズレなし',
      }),
    );
    expect(result.matchedDeals).toContainEqual(
      expect.objectContaining({
        dealId: 'DEAL-002',
        matchStatus: 'ズレなし',
      }),
    );
    expect(result.matchedDeals).toContainEqual(
      expect.objectContaining({
        dealId: 'DEAL-003',
        matchStatus: 'ズレなし',
      }),
    );

    // ズレあり案件は明確に識別され、不一致詳細とともに記載
    expect(result.mismatchedDeals).toHaveLength(2);

    const mismatchResult1 = result.mismatchedDeals.find((d) => d.dealId === 'DEAL-004');
    expect(mismatchResult1).toBeDefined();
    expect(mismatchResult1?.matchStatus).toBe('ズレあり');
    expect(mismatchResult1?.discrepancies).toContain('請求書未発行');

    const mismatchResult2 = result.mismatchedDeals.find((d) => d.dealId === 'DEAL-005');
    expect(mismatchResult2).toBeDefined();
    expect(mismatchResult2?.matchStatus).toBe('ズレあり');
    expect(mismatchResult2?.discrepancies).toEqual(
      expect.arrayContaining(['金額相違', '発行日ズレ']),
    );

    // 結果サマリーの検証
    expect(result.summary).toBeDefined();
    expect(result.summary.totalDealsProcessed).toBe(5);
    expect(result.summary.matchedDealsCount).toBe(3);
    expect(result.summary.mismatchedDealsCount).toBe(2);
    expect(result.summary.discrepancyDetectionCount).toBe(2);
  });
});