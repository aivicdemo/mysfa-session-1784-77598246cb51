import { getUnbilledDeals } from '../../src/logic/it-1784969823049-1-1-1';

interface Deal {
  dealId: string;
  status: string;
  customerName: string;
}

interface Invoice {
  invoiceId: string;
  dealId: string;
  issuanceStatus: string;
  issuanceDate: string;
}

interface DocumentStorageAdapter {
  uploadDocument: (dealId: string, pdfContent: Buffer) => Promise<boolean>;
  generateShareLink: (documentId: string) => Promise<string>;
  deleteDocument: (documentId: string) => Promise<boolean>;
}

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-542
  test('ステータスが「受注」かつ請求書が発行済みの案件は「未請求案件」リストに含まれない', async () => {
    // Mock DocumentStorageAdapter
    const mockDocumentStorageAdapter: DocumentStorageAdapter = {
      uploadDocument: jest.fn(async (dealId: string, pdfContent: Buffer) => {
        return true;
      }),
      generateShareLink: jest.fn(async (documentId: string) => {
        return 'https://share.example.com/doc-' + documentId;
      }),
      deleteDocument: jest.fn(async (documentId: string) => {
        return true;
      }),
    };

    // Register deal data
    const deal: Deal = {
      dealId: 'DEAL-001',
      status: '受注',
      customerName: 'テスト顧客A',
    };

    // Register invoice data
    const today = new Date('2024-12-15').toISOString().split('T')[0];
    const invoice: Invoice = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      issuanceStatus: '発行済み',
      issuanceDate: today,
    };

    // Confirm DocumentStorageAdapter uploadDocument is called successfully
    const pdfBuffer = Buffer.from('test pdf content');
    const uploadResult = await mockDocumentStorageAdapter.uploadDocument(
      deal.dealId,
      pdfBuffer
    );
    expect(uploadResult).toBe(true);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      'DEAL-001',
      pdfBuffer
    );

    // Execute getUnbilledDeals function with deal and invoice data
    const deals: Deal[] = [deal];
    const invoices: Invoice[] = [invoice];

    const unbilledDeals = getUnbilledDeals(deals, invoices);

    // Verify that deal 'DEAL-001' with status '受注' and invoice '発行済み' is NOT in the unbilled deals list
    const isIncludedInUnbilledList = unbilledDeals.some(
      (unbilledDeal) => unbilledDeal.dealId === 'DEAL-001'
    );
    expect(isIncludedInUnbilledList).toBe(false);
  });
});