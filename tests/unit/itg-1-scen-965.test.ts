import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-965
  test('[normal] 売上実績・請求状況照合機能 - 請求書に紐付く売上実績が複数存在する場合、全売上実績と照合が実行される', () => {
    // 準備: テストデータ
    const customerId = 'CUST-A';
    const invoiceId = 'INV-001';
    
    // 売上実績3件
    const salesRecord1 = {
      salesRecordId: 'SR-001',
      invoiceId: invoiceId,
      customerId: customerId,
      amount: 100000,
      recordedDate: '2024-01-15T00:00:00Z',
      reconciliationStatus: 'pending' as const,
      reconciliationTimestamp: null as string | null,
    };
    
    const salesRecord2 = {
      salesRecordId: 'SR-002',
      invoiceId: invoiceId,
      customerId: customerId,
      amount: 50000,
      recordedDate: '2024-01-20T00:00:00Z',
      reconciliationStatus: 'pending' as const,
      reconciliationTimestamp: null as string | null,
    };
    
    const salesRecord3 = {
      salesRecordId: 'SR-003',
      invoiceId: invoiceId,
      customerId: customerId,
      amount: 30000,
      recordedDate: '2024-01-25T00:00:00Z',
      reconciliationStatus: 'pending' as const,
      reconciliationTimestamp: null as string | null,
    };
    
    const salesRecords = [salesRecord1, salesRecord2, salesRecord3];
    
    // 請求書
    const invoice = {
      invoiceId: invoiceId,
      customerId: customerId,
      totalAmount: 180000, // 3件売上実績の合計: 100,000 + 50,000 + 30,000
      issuedDate: '2024-01-30T00:00:00Z',
      reconciliationStatus: 'pending' as const,
      reconciliationLogDetails: [] as Array<{
        salesRecordId: string;
        reconciliationTimestamp: string;
        reconciliationDetails: { amount: number; recordedDate: string };
      }>,
    };
    
    // 実行: 照合機能を呼び出し
    const result = reconcileSalesAndInvoices({
      invoiceId: invoiceId,
      salesRecords: salesRecords,
      invoice: invoice,
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
    });
    
    // 検証: 3件全ての売上実績が照合済みステータスになっている
    expect(result.reconciliationResults).toHaveLength(3);
    
    expect(result.reconciliationResults[0]).toEqual({
      salesRecordId: 'SR-001',
      reconciliationStatus: 'reconciled',
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
      reconciliationDetails: {
        amount: 100000,
        recordedDate: '2024-01-15T00:00:00Z',
      },
    });
    
    expect(result.reconciliationResults[1]).toEqual({
      salesRecordId: 'SR-002',
      reconciliationStatus: 'reconciled',
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
      reconciliationDetails: {
        amount: 50000,
        recordedDate: '2024-01-20T00:00:00Z',
      },
    });
    
    expect(result.reconciliationResults[2]).toEqual({
      salesRecordId: 'SR-003',
      reconciliationStatus: 'reconciled',
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
      reconciliationDetails: {
        amount: 30000,
        recordedDate: '2024-01-25T00:00:00Z',
      },
    });
    
    // 検証: 請求書の照合ステータスが完全一致と表示される
    expect(result.invoiceReconciliationStatus).toBe('fully_matched');
    expect(result.invoiceReconciliationSummary).toBe('完全一致（3件/3件照合）');
    
    // 検証: 照合ログに3件全てが記録されている
    expect(result.reconciliationLog).toHaveLength(3);
    
    expect(result.reconciliationLog[0]).toEqual({
      salesRecordId: 'SR-001',
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
      reconciliationDetails: {
        amount: 100000,
        recordedDate: '2024-01-15T00:00:00Z',
      },
    });
    
    expect(result.reconciliationLog[1]).toEqual({
      salesRecordId: 'SR-002',
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
      reconciliationDetails: {
        amount: 50000,
        recordedDate: '2024-01-20T00:00:00Z',
      },
    });
    
    expect(result.reconciliationLog[2]).toEqual({
      salesRecordId: 'SR-003',
      reconciliationTimestamp: '2024-02-01T10:00:00Z',
      reconciliationDetails: {
        amount: 30000,
        recordedDate: '2024-01-25T00:00:00Z',
      },
    });
    
    // 検証: 合計金額が正しく照合されている
    expect(result.totalReconciliationAmount).toBe(180000);
    expect(result.reconciliationCount).toBe(3);
  });
});