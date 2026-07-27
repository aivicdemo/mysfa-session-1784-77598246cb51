import { describe, test, expect, beforeEach } from '@jest/globals';

interface Deal {
  dealId: string;
  customerName: string;
  status: string;
  statusUpdatedAt: Date;
}

interface Invoice {
  invoiceId: string;
  dealId: string;
  issuedAt: Date;
}

interface ReconciliationResult {
  dealId: string;
  discrepancyType: string;
  invoiceIssuedDate: Date;
  dealStatusUpdatedDate: Date;
  daysDifference: number;
  status: string;
  detectionDateTime: Date;
  severity: string;
}

interface ReconciliationService {
  startMonthlyReconciliation(
    monthlyDeadline: Date,
    executionDate: Date,
    deals: Deal[],
    invoices: Invoice[]
  ): Promise<ReconciliationResult[]>;
}

// Mock implementation for testing
const createReconciliationService = (): ReconciliationService => {
  return {
    async startMonthlyReconciliation(
      monthlyDeadline: Date,
      executionDate: Date,
      deals: Deal[],
      invoices: Invoice[]
    ): Promise<ReconciliationResult[]> {
      const results: ReconciliationResult[] = [];

      for (const deal of deals) {
        const correspondingInvoice = invoices.find(
          (inv) => inv.dealId === deal.dealId
        );

        if (
          correspondingInvoice &&
          deal.status === '受注'
        ) {
          const issuedTime = correspondingInvoice.issuedAt.getTime();
          const statusUpdatedTime = deal.statusUpdatedAt.getTime();
          const daysDiff = Math.floor(
            (issuedTime - statusUpdatedTime) / (1000 * 60 * 60 * 24)
          );

          if (issuedTime < statusUpdatedTime) {
            results.push({
              dealId: deal.dealId,
              discrepancyType: 'INVOICE_ISSUED_BEFORE_DEAL_STATUS_UPDATE',
              invoiceIssuedDate: correspondingInvoice.issuedAt,
              dealStatusUpdatedDate: deal.statusUpdatedAt,
              daysDifference: daysDiff,
              status: 'DETECTED_AS_DELAY',
              detectionDateTime: executionDate,
              severity: 'HIGH',
            });
          }
        }
      }

      return results;
    },
  };
};

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-691
  test('月次決算期限3営業日前に照合開始時、請求書発行日が商談ステータス更新日より早い案件は遅延として検出される', async () => {
    const reconciliationService = createReconciliationService();

    const dealStatusUpdatedAt = new Date('2024-01-15T09:00:00Z');
    const invoiceIssuedAt = new Date('2024-01-10T14:30:00Z');
    const monthlyDeadline = new Date('2024-01-31T23:59:59Z');
    const executionDate = new Date('2024-01-28T00:00:00Z');

    const testDeal: Deal = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      status: '受注',
      statusUpdatedAt: dealStatusUpdatedAt,
    };

    const testInvoice: Invoice = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      issuedAt: invoiceIssuedAt,
    };

    const results = await reconciliationService.startMonthlyReconciliation(
      monthlyDeadline,
      executionDate,
      [testDeal],
      [testInvoice]
    );

    expect(results).toHaveLength(1);

    const reconciliationResult = results[0];
    expect(reconciliationResult.dealId).toBe('DEAL-001');
    expect(reconciliationResult.discrepancyType).toBe(
      'INVOICE_ISSUED_BEFORE_DEAL_STATUS_UPDATE'
    );
    expect(reconciliationResult.invoiceIssuedDate).toEqual(invoiceIssuedAt);
    expect(reconciliationResult.dealStatusUpdatedDate).toEqual(dealStatusUpdatedAt);
    expect(reconciliationResult.daysDifference).toBe(-5);
    expect(reconciliationResult.status).toBe('DETECTED_AS_DELAY');
    expect(reconciliationResult.detectionDateTime).toEqual(executionDate);
    expect(reconciliationResult.severity).toBe('HIGH');
  });
});