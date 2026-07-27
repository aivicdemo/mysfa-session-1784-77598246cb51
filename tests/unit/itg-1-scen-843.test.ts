import { validateInvoicingData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-843
  test('請求対象データ妥当性検証機能 - 年をまたぐ請求期日が異なる請求データのとき、それぞれを独立して検証する', () => {
    const invoiceDataA = {
      dataId: 'A',
      invoiceDate: '2024-12-31',
      amount: 100000,
      customerId: 'CUST001',
      customerName: 'Customer A Corp',
      invoiceNumber: 'INV-2024-001',
      items: [
        {
          itemId: 'ITEM-001',
          description: 'Product A',
          quantity: 2,
          unitPrice: 50000,
        },
      ],
    };

    const invoiceDataB = {
      dataId: 'B',
      invoiceDate: '2025-01-01',
      amount: 50000,
      customerId: 'CUST002',
      customerName: 'Customer B Inc',
      invoiceNumber: 'INV-2025-001',
      items: [
        {
          itemId: 'ITEM-002',
          description: 'Service B',
          quantity: 1,
          unitPrice: 50000,
        },
      ],
    };

    const validationResults = validateInvoicingData([invoiceDataA, invoiceDataB]);

    expect(validationResults).toHaveLength(2);

    const resultA = validationResults.find((r) => r.dataId === 'A');
    const resultB = validationResults.find((r) => r.dataId === 'B');

    expect(resultA).toBeDefined();
    expect(resultB).toBeDefined();

    expect(resultA!.status).toBe('VALID');
    expect(resultA!.invoiceDate).toBe('2024-12-31');
    expect(resultA!.amount).toBe(100000);
    expect(resultA!.customerId).toBe('CUST001');
    expect(resultA!.fiscalYear).toBe(2024);

    expect(resultB!.status).toBe('VALID');
    expect(resultB!.invoiceDate).toBe('2025-01-01');
    expect(resultB!.amount).toBe(50000);
    expect(resultB!.customerId).toBe('CUST002');
    expect(resultB!.fiscalYear).toBe(2025);

    expect(resultA!.validationErrors).toEqual([]);
    expect(resultB!.validationErrors).toEqual([]);

    expect(resultA!.itemsCount).toBe(1);
    expect(resultB!.itemsCount).toBe(1);

    expect(resultA!.totalItemAmount).toBe(100000);
    expect(resultB!.totalItemAmount).toBe(50000);

    const resultAIndex = validationResults.indexOf(resultA!);
    const resultBIndex = validationResults.indexOf(resultB!);
    expect(resultAIndex).not.toBe(resultBIndex);
  });
});