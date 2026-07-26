import { validateInvoiceDataBeforeDistribution } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-105
  test('請求書自動配信機能 - 請求対象データの妥当性確認未完了時に請求書配信が抑止される', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-12345',
      totalAmount: 150000,
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: '商品A',
          quantity: 2,
          unitPrice: 50000,
          amount: 100000,
        },
        {
          itemId: 'ITEM-002',
          description: '商品B',
          quantity: 1,
          unitPrice: 50000,
          amount: 50000,
        },
      ],
      validationCompleted: false,
      distributionStatus: '未配信',
    };

    const result = () =>
      validateInvoiceDataBeforeDistribution(invoiceData);

    expect(result).toThrow(/妥当性確認/);
  });
});