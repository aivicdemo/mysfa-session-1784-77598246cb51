import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoiceData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-947: [edge] 売上実績・請求データ照合機能 - 月次決算期間の開始日と終了日が同日の場合、その日付のデータのみ対象となる
  test('should extract only records matching the same start and end date when reconciling sales and invoice data', () => {
    const salesRecords = [
      {
        id: 'sales_A',
        date: new Date('2024-01-15T00:00:00Z'),
        amount: 100000,
      },
      {
        id: 'sales_B',
        date: new Date('2024-01-15T00:00:00Z'),
        amount: 50000,
      },
      {
        id: 'sales_C',
        date: new Date('2024-01-16T00:00:00Z'),
        amount: 75000,
      },
    ];

    const invoiceRecords = [
      {
        id: 'invoice_D',
        date: new Date('2024-01-15T00:00:00Z'),
        amount: 150000,
      },
      {
        id: 'invoice_E',
        date: new Date('2024-01-15T00:00:00Z'),
        amount: 50000,
      },
      {
        id: 'invoice_F',
        date: new Date('2024-01-16T00:00:00Z'),
        amount: 100000,
      },
    ];

    const startDate = new Date('2024-01-15T00:00:00Z');
    const endDate = new Date('2024-01-15T00:00:00Z');

    const result = reconcileSalesAndInvoiceData({
      salesRecords,
      invoiceRecords,
      startDate,
      endDate,
    });

    expect(result.extractedSalesRecords).toHaveLength(2);
    expect(result.extractedSalesRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sales_A',
          date: new Date('2024-01-15T00:00:00Z'),
          amount: 100000,
        }),
        expect.objectContaining({
          id: 'sales_B',
          date: new Date('2024-01-15T00:00:00Z'),
          amount: 50000,
        }),
      ])
    );

    expect(result.extractedInvoiceRecords).toHaveLength(2);
    expect(result.extractedInvoiceRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'invoice_D',
          date: new Date('2024-01-15T00:00:00Z'),
          amount: 150000,
        }),
        expect.objectContaining({
          id: 'invoice_E',
          date: new Date('2024-01-15T00:00:00Z'),
          amount: 50000,
        }),
      ])
    );

    expect(result.excludedSalesRecords).toHaveLength(1);
    expect(result.excludedSalesRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sales_C',
          date: new Date('2024-01-16T00:00:00Z'),
          amount: 75000,
        }),
      ])
    );

    expect(result.excludedInvoiceRecords).toHaveLength(1);
    expect(result.excludedInvoiceRecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'invoice_F',
          date: new Date('2024-01-16T00:00:00Z'),
          amount: 100000,
        }),
      ])
    );

    expect(result.totalSalesAmountExtracted).toBe(150000);
    expect(result.totalInvoiceAmountExtracted).toBe(200000);
  });
});