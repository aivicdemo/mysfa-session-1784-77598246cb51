import { expect, describe, test, beforeEach } from '@jest/globals';
import * as dealStatusLogic from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-547
  test('商談レコードのステータスフィールドが欠けているとき処理が失敗する', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      amount: 500000,
      status: undefined,
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const invoiceData = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      invoiceStatus: 'issued',
      invoiceAmount: 500000,
      issueDate: new Date('2024-01-15T14:00:00Z'),
    };

    expect(() => {
      dealStatusLogic.reconcileDealStatusWithInvoice(dealRecord, invoiceData);
    }).toThrow(/商談ステータス/);
  });
});