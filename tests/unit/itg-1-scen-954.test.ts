import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-954: 売上実績の金額がちょうど請求書の合計金額と一致する場合、金額差分が0と判定される', () => {
    const salesRecord = {
      id: 'sales_001',
      customerId: 'customer_001',
      amount: 50000,
      recordDate: '2024-01-15',
    };

    const invoiceRecords = [
      {
        id: 'invoice_001',
        customerId: 'customer_001',
        invoiceDetails: [
          {
            itemId: 'item_001',
            description: 'Product A',
            quantity: 2,
            unitPrice: 25000,
          },
        ],
      },
    ];

    const result = reconcileSalesAndInvoice(salesRecord, invoiceRecords);

    expect(result.amountDifference).toBe(0);
    expect(result.isMatched).toBe(true);
  });
});