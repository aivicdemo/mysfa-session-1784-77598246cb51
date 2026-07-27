import { generateMonthlyDecisionReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-323
  test('月次決算レポート生成機能 - 商談レコードに請求書が紐付いている場合、請求金額が正確に集計される', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-001',
        url: 'https://storage.example.com/doc-001',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const dealRecords = [
      {
        dealId: 'DEAL-001',
        customerName: 'テスト太郎',
        dealAmount: 1000000,
        status: '成約',
        invoices: [
          {
            invoiceId: 'INV-001',
            invoiceAmount: 1000000,
            invoiceDate: '2024-01-01',
            invoiceStatus: '発行済み',
          },
          {
            invoiceId: 'INV-002',
            invoiceAmount: 500000,
            invoiceDate: '2024-01-15',
            invoiceStatus: '発行済み',
          },
        ],
      },
      {
        dealId: 'DEAL-002',
        customerName: 'テスト花子',
        dealAmount: 500000,
        status: '成約',
        invoices: [
          {
            invoiceId: 'INV-003',
            invoiceAmount: 500000,
            invoiceDate: '2024-01-10',
            invoiceStatus: '発行済み',
          },
        ],
      },
    ];

    const reportMonth = '2024-01';

    const result = generateMonthlyDecisionReport(
      dealRecords,
      reportMonth,
      mockDocumentStorageAdapter
    );

    expect(result).toEqual({
      reportMonth: '2024-01',
      totalInvoiceAmount: 2000000,
      dealSummaries: [
        {
          dealId: 'DEAL-001',
          customerName: 'テスト太郎',
          dealAmount: 1000000,
          totalInvoicedAmount: 1500000,
          invoiceCount: 2,
        },
        {
          dealId: 'DEAL-002',
          customerName: 'テスト花子',
          dealAmount: 500000,
          totalInvoicedAmount: 500000,
          invoiceCount: 1,
        },
      ],
    });

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();
  });
});