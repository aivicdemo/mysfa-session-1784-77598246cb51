import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  reconcileSalesAndInvoice
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-932
  it('月初（1日）に売上計上予定日と請求日が一致する場合、照合成功として処理される', () => {
    // Arrange
    const reconciliationDate = new Date('2025-01-01T00:00:00Z');
    const salesRecordTXN001 = {
      transactionId: 'TXN001',
      customerId: 'CUST001',
      plannedRevenueDate: new Date('2025-01-01T00:00:00Z'),
      amount: 100000,
      isReconciled: false
    };

    const invoiceRecordINV001 = {
      invoiceId: 'INV001',
      customerId: 'CUST001',
      invoiceDate: new Date('2025-01-01T00:00:00Z'),
      amount: 100000
    };

    const reconciliationLog: Array<{
      reconciliationDate: Date;
      customerId: string;
      amount: number;
      status: string;
    }> = [];

    // Act
    const result = reconcileSalesAndInvoice(
      salesRecordTXN001,
      invoiceRecordINV001,
      reconciliationDate,
      reconciliationLog
    );

    // Assert
    expect(result.reconciliationStatus).toBe('照合成功');
    expect(result.salesRecord.isReconciled).toBe(true);
    expect(result.invoiceRecord.isReconciled).toBe(true);
    expect(result.reconciliationMatchFlag).toBe(true);

    expect(reconciliationLog).toHaveLength(1);
    expect(reconciliationLog[0]).toEqual({
      reconciliationDate: new Date('2025-01-01T00:00:00Z'),
      customerId: 'CUST001',
      amount: 100000,
      status: '成功'
    });
  });
});