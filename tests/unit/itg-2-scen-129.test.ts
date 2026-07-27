import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('Invoice Approval Validation', () => {
  // SCEN-129: [normal] 請求書承認検証機能 - 検証項目の一部が警告レベルで、残りが成功したとき、承認結果として「条件付き承認」と警告一覧を返す
  test('should return CONDITIONAL_APPROVAL with warning list when some validations pass and others return warnings', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      amount: 100000,
      taxRate: 0.1,
      dueDate: '2024-02-15',
      vendorInfo: {
        vendorId: 'VENDOR-001',
        name: 'Test Vendor',
        lastUpdated: '2023-12-01',
      },
    };

    const validationStubs = {
      validateAmount: () => ({
        status: 'SUCCESS',
        code: null,
        message: null,
        severity: null,
      }),
      validateTaxRate: () => ({
        status: 'WARNING',
        code: 'TAX_001',
        message: '税率計算に誤差が検出されました',
        severity: 'WARNING',
      }),
      validateDueDate: () => ({
        status: 'SUCCESS',
        code: null,
        message: null,
        severity: null,
      }),
      validateVendorInfo: () => ({
        status: 'WARNING',
        code: 'VENDOR_002',
        message: '取引先の登録情報が最新でない可能性があります',
        severity: 'WARNING',
      }),
    };

    const result = validateInvoiceApproval(invoiceData, validationStubs);

    expect(result.approvalStatus).toBe('CONDITIONAL_APPROVAL');
    expect(result.warnings).toEqual([
      {
        code: 'TAX_001',
        message: '税率計算に誤差が検出されました',
        severity: 'WARNING',
      },
      {
        code: 'VENDOR_002',
        message: '取引先の登録情報が最新でない可能性があります',
        severity: 'WARNING',
      },
    ]);
    expect(result.errors).toEqual([]);
  });
});