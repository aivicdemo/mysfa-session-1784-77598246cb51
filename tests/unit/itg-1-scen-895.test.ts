import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-895
  test('請求書の金額が商談の契約金額と一致するとき検証が合格する', () => {
    const dealAmount = 500000;
    const invoiceAmount = 500000;
    const dealId = 'DEAL-001';
    const invoiceId = 'INV-001';

    const validationInput = {
      dealId,
      contractAmount: dealAmount,
      invoiceId,
      invoiceAmount,
    };

    const result = validateInvoiceApproval(validationInput);

    expect(result.status).toBe('PASSED');
    expect(result.message).toMatch(/一致/);
    expect(result.validationLogs).toBeDefined();
    expect(result.validationLogs.length).toBeGreaterThan(0);
    expect(result.validationLogs[0]).toMatch(/請求書金額.*契約金額.*一致/);
  });
});