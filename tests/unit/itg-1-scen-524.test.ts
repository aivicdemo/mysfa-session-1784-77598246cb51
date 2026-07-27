import { reconcileDealStatusWithInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-524: 商談レコードが複数件のとき、全商談が照合される', () => {
    // Arrange: テストデータ準備
    const deals = [
      {
        dealId: 'DEAL-A',
        customerId: 'CUST-001',
        status: '受注',
        amount: 100000,
        invoiceIssued: true,
        invoiceIssuedDate: new Date('2024-01-15T10:00:00Z'),
      },
      {
        dealId: 'DEAL-B',
        customerId: 'CUST-002',
        status: '受注',
        amount: 200000,
        invoiceIssued: false,
        invoiceIssuedDate: null,
      },
      {
        dealId: 'DEAL-C',
        customerId: 'CUST-003',
        status: '失注',
        amount: 150000,
        invoiceIssued: true,
        invoiceIssuedDate: new Date('2024-01-10T09:00:00Z'),
      },
      {
        dealId: 'DEAL-D',
        customerId: 'CUST-004',
        status: '提案中',
        amount: 50000,
        invoiceIssued: false,
        invoiceIssuedDate: null,
      },
      {
        dealId: 'DEAL-E',
        customerId: 'CUST-005',
        status: '受注',
        amount: 300000,
        invoiceIssued: true,
        invoiceIssuedDate: new Date('2024-01-12T14:00:00Z'),
      },
    ];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: 'FILE-123' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue({}),
      getUploadHistory: jest.fn().mockResolvedValue({
        'DEAL-A': { uploaded: true, uploadedDate: new Date('2024-01-15T10:00:00Z') },
        'DEAL-B': { uploaded: false, uploadedDate: null },
        'DEAL-C': { uploaded: true, uploadedDate: new Date('2024-01-10T09:00:00Z') },
        'DEAL-D': { uploaded: false, uploadedDate: null },
        'DEAL-E': { uploaded: true, uploadedDate: new Date('2024-01-12T14:00:00Z') },
      }),
    };

    // Act: 照合・ズレ検出機能を実行
    const result = reconcileDealStatusWithInvoiceStatus(deals, mockDocumentStorageAdapter);

    // Assert: 処理結果の検証
    // 全5件が処理対象として認識されたことを確認
    expect(result.processedDealsCount).toBe(5);

    // ズレなし3件（商談A、D、E）の検証
    const noDiscrepancyDeals = result.reconciliationResults.filter((r) => r.hasDiscrepancy === false);
    expect(noDiscrepancyDeals.length).toBe(3);
    expect(noDiscrepancyDeals.map((r) => r.dealId).sort()).toEqual(['DEAL-A', 'DEAL-D', 'DEAL-E']);

    // ズレあり2件（商談B、C）の検証
    const discrepancyDeals = result.reconciliationResults.filter((r) => r.hasDiscrepancy === true);
    expect(discrepancyDeals.length).toBe(2);
    expect(discrepancyDeals.map((r) => r.dealId).sort()).toEqual(['DEAL-B', 'DEAL-C']);

    // 各商談の詳細検証
    const dealAResult = result.reconciliationResults.find((r) => r.dealId === 'DEAL-A');
    expect(dealAResult?.hasDiscrepancy).toBe(false);
    expect(dealAResult?.reason).toMatch(/受注.*請求書発行済み/);

    const dealBResult = result.reconciliationResults.find((r) => r.dealId === 'DEAL-B');
    expect(dealBResult?.hasDiscrepancy).toBe(true);
    expect(dealBResult?.reason).toMatch(/受注.*請求書未発行/);

    const dealCResult = result.reconciliationResults.find((r) => r.dealId === 'DEAL-C');
    expect(dealCResult?.hasDiscrepancy).toBe(true);
    expect(dealCResult?.reason).toMatch(/失注.*請求書発行済み/);

    const dealDResult = result.reconciliationResults.find((r) => r.dealId === 'DEAL-D');
    expect(dealDResult?.hasDiscrepancy).toBe(false);
    expect(dealDResult?.reason).toMatch(/提案中.*請求書未発行/);

    const dealEResult = result.reconciliationResults.find((r) => r.dealId === 'DEAL-E');
    expect(dealEResult?.hasDiscrepancy).toBe(false);
    expect(dealEResult?.reason).toMatch(/受注.*請求書発行済み/);

    // DocumentStorageAdapter の呼び出し確認
    expect(mockDocumentStorageAdapter.getUploadHistory).toHaveBeenCalledTimes(1);

    // 照合漏れがないことを確認（すべての dealId が result に含まれている）
    const resultDealIds = result.reconciliationResults.map((r) => r.dealId).sort();
    const expectedDealIds = deals.map((d) => d.dealId).sort();
    expect(resultDealIds).toEqual(expectedDealIds);
  });
});