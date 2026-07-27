import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-127: [normal] 請求書承認検証機能 - 全ての検証項目が成功したとき、承認結果として「承認可能」を返す
  test('全ての検証項目が成功したとき、承認結果として「承認可能」を返す', () => {
    // 検証対象の請求書データを準備（金額、税額、支払期限、顧客情報が全て正常値）
    const invoiceData = {
      id: 'INV-20240115-001',
      customerId: 'CUST-12345',
      customerName: 'テスト顧客有限会社',
      customerEmail: 'customer@example.com',
      subtotalAmount: 100000,
      taxAmount: 10000,
      totalAmount: 110000,
      taxRate: 0.1,
      dueDate: new Date('2024-02-15T00:00:00Z'),
      status: 'PENDING_APPROVAL',
      issueDate: new Date('2024-01-15T10:00:00Z'),
    };

    // 金額検証モジュールをスタブ化
    const amountValidatorStub = jest.fn().mockReturnValue({
      isValid: true,
      message: '金額フォーマットが正当',
    });

    // 税額検証モジュールをスタブ化
    const taxValidatorStub = jest.fn().mockReturnValue({
      isValid: true,
      message: '税額計算が正当',
    });

    // 支払期限検証モジュールをスタブ化
    const dueDateValidatorStub = jest.fn().mockReturnValue({
      isValid: true,
      message: '支払期限が有効',
    });

    // 顧客情報検証モジュールをスタブ化
    const customerInfoValidatorStub = jest.fn().mockReturnValue({
      isValid: true,
      message: '顧客情報が完全',
    });

    // 請求書ステータス検証モジュールをスタブ化
    const statusValidatorStub = jest.fn().mockReturnValue({
      isValid: true,
      message: '請求書ステータスが承認対象',
    });

    // 検証スタブを含むバリデータオブジェクト
    const validators = {
      amountValidator: amountValidatorStub,
      taxValidator: taxValidatorStub,
      dueDateValidator: dueDateValidatorStub,
      customerInfoValidator: customerInfoValidatorStub,
      statusValidator: statusValidatorStub,
    };

    // 準備した請求書データを承認検証機能に送信
    const result = validateInvoiceForApproval(invoiceData, validators);

    // 承認検証機能が全ての検証項目に対して検証を実行したことを確認
    expect(amountValidatorStub).toHaveBeenCalledWith(invoiceData);
    expect(taxValidatorStub).toHaveBeenCalledWith(invoiceData);
    expect(dueDateValidatorStub).toHaveBeenCalledWith(invoiceData);
    expect(customerInfoValidatorStub).toHaveBeenCalledWith(invoiceData);
    expect(statusValidatorStub).toHaveBeenCalledWith(invoiceData);

    // 承認検証機能の戻り値を取得し、『承認可能』という結果を返すことを検証
    expect(result).toEqual({
      canApprove: true,
      status: 'APPROVABLE',
      validationResults: {
        amount: {
          isValid: true,
          message: '金額フォーマットが正当',
        },
        tax: {
          isValid: true,
          message: '税額計算が正当',
        },
        dueDate: {
          isValid: true,
          message: '支払期限が有効',
        },
        customerInfo: {
          isValid: true,
          message: '顧客情報が完全',
        },
        invoiceStatus: {
          isValid: true,
          message: '請求書ステータスが承認対象',
        },
      },
      allValidationsPassed: true,
    });
  });
});