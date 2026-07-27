import { verifyDealInvoiceLinkage } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-298: [normal] 商談ステータスと請求データの紐付け・可視化 - 請求金額に端数が含まれる場合（例：1,234.56円）、商談金額との比較が正常に実行される', () => {
    // テストデータ作成: 商談レコード
    const dealRecord = {
      dealId: 'DEAL-001',
      dealAmount: 100000.00,
      dealStatus: 'completed',
      customerId: 'CUST-123',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    // テストデータ作成: 請求レコード（端数を含む）
    const invoiceRecord = {
      invoiceId: 'INV-001',
      invoiceAmount: 1234.56,
      linkedDealId: 'DEAL-001',
      invoiceStatus: 'issued',
      issuedAt: new Date('2024-01-15T11:00:00Z'),
    };

    // DocumentStorageAdapter のモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        storageUrl: 'https://example.com/storage/DOC-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/token-abc123',
        expiresAt: new Date('2024-01-16T11:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // PaymentGatewayAdapter のモック化
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'PAYLINK-001',
        paymentUrl: 'https://payment.example.com/pay/PAYLINK-001',
        expiresAt: new Date('2024-01-22T11:00:00Z'),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'TXN-001',
        status: 'completed',
        verifiedAt: new Date('2024-01-15T12:00:00Z'),
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'TXN-001',
        status: 'completed',
      }),
    };

    // 期待される比較結果
    const expectedPercentage = (1234.56 / 100000.00) * 100;
    const expectedPercentageRounded = parseFloat(expectedPercentage.toFixed(2));

    // 関数実行
    const result = verifyDealInvoiceLinkage(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      mockPaymentGatewayAdapter
    );

    // アサーション: 紐付きデータが正確に返却される
    expect(result).toEqual({
      dealId: 'DEAL-001',
      invoiceId: 'INV-001',
      dealAmount: 100000.00,
      invoiceAmount: 1234.56,
      isLinked: true,
      linkageStatus: 'verified',
      comparisonResult: {
        invoiceAmountPercentage: expectedPercentageRounded,
        percentageFormatted: '1.23%',
        amountDifference: 98765.44,
        isAmountConsistent: true,
      },
      displayData: {
        invoiceId: 'INV-001',
        invoiceAmount: '1,234.56',
        dealAmount: '100,000.00',
        comparisonMessage: '請求額は商談額の1.23%',
      },
    });

    // アサーション: 小数第2位までの端数が正確に保持されている
    expect(result.invoiceAmount).toBe(1234.56);
    expect(result.comparisonResult.percentageFormatted).toBe('1.23%');

    // アサーション: DocumentStorageAdapter の generateShareLink が呼び出されたこと
    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalled();

    // アサーション: PaymentGatewayAdapter の generatePaymentLink が呼び出されたこと
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // アサーション: 比較ロジックにより端数を含めた正確な計算が実行されたこと
    expect(result.comparisonResult.amountDifference).toBe(98765.44);
  });
});