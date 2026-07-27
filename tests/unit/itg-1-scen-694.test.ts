import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { reconcileDealStatusAndInvoicing } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-694
  test('月次決算期限3営業日前に照合開始時、商談ステータスマスタの参照値が不正な場合、処理は失敗する', () => {
    const monthlyDeadline = new Date('2024-01-31T00:00:00Z');
    const currentDateTime = new Date('2024-01-26T09:00:00Z');
    
    const invalidStatusMasterRecord = {
      statusId: 999,
      statusName: null,
      isValid: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };
    
    const dealWithInvalidStatusRef = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      statusId: 999,
      amount: 500000,
      dealName: 'テスト商談',
      createdAt: new Date('2024-01-20T10:00:00Z'),
      updatedAt: new Date('2024-01-25T14:30:00Z'),
    };
    
    const invoiceData = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      invoiceStatus: 'issued',
      invoiceAmount: 500000,
      invoiceIssuedDate: new Date('2024-01-25T15:00:00Z'),
      dueDate: new Date('2024-02-25T00:00:00Z'),
    };
    
    const statusMasterRecords = [
      {
        statusId: 1,
        statusName: '初期接触',
        isValid: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        statusId: 2,
        statusName: '提案中',
        isValid: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      invalidStatusMasterRecord,
    ];
    
    const dealRecords = [dealWithInvalidStatusRef];
    const invoiceRecords = [invoiceData];
    
    const result = reconcileDealStatusAndInvoicing(
      {
        monthlyDeadline: monthlyDeadline,
        currentDateTime: currentDateTime,
        statusMasterRecords: statusMasterRecords,
        dealRecords: dealRecords,
        invoiceRecords: invoiceRecords,
      }
    );
    
    expect(result.processStatus).toBe('失敗');
    expect(result.errorCode).toBe('INVALID_MASTER_DATA');
    expect(result.errorMessage).toMatch(/商談ステータスマスタ|ステータスID/);
    expect(result.invalidMasterDetails).toEqual(
      expect.objectContaining({
        statusId: 999,
        issue: expect.any(String),
      })
    );
    expect(result.processingLog).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(Date),
          message: expect.stringContaining('不正なマスタ参照'),
        }),
      ])
    );
    expect(result.reconciliationSkipped).toBe(true);
    expect(result.unmappedDeals).toEqual([]);
    expect(result.delayedDeals).toEqual([]);
  });
});