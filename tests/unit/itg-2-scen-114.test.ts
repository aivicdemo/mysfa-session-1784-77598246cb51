import { validateInvoiceCustomerInfo } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-114
  test('請求書承認検証機能 - 請求書の顧客情報が商談の顧客情報と一致するとき、整合性検証を成功させる', async () => {
    const dealId = 'DEAL-001';
    const customerId = 'CUST-001';
    const customerName = '株式会社テスト';
    const address = '東京都渋谷区';

    const dealData = {
      dealId: dealId,
      customerId: customerId,
      customerName: customerName,
      address: address,
    };

    const invoiceData = {
      customerId: customerId,
      customerName: customerName,
      address: address,
    };

    const result = await validateInvoiceCustomerInfo(dealData, invoiceData);

    expect(result.validationStatus).toBe('success');
    expect(result.customerId.matched).toBe(true);
    expect(result.customerId.dealValue).toBe(customerId);
    expect(result.customerId.invoiceValue).toBe(customerId);
    expect(result.customerName.matched).toBe(true);
    expect(result.customerName.dealValue).toBe(customerName);
    expect(result.customerName.invoiceValue).toBe(customerName);
    expect(result.address.matched).toBe(true);
    expect(result.address.dealValue).toBe(address);
    expect(result.address.invoiceValue).toBe(address);
    expect(result.validationLog).toContain('顧客情報検証: OK');
  });
});