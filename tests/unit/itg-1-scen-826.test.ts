import { validateInvoiceTargetData } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-826
  test('請求対象データ妥当性検証機能 - 請求書未発行の商談データを検証するとき、承認可否を通常通り判定する', () => {
    const dealData = {
      dealId: 'DEAL-001',
      dealStatus: '成約',
      customerName: 'テスト顧客A',
      customerId: 'CUST-001',
      dealAmount: 500000,
      invoiceTargetFlag: true,
      invoiceIssuedFlag: false,
      invoiceIssuedDate: null,
      dueDate: new Date('2024-02-15'),
      paymentTerms: '月末締翌月末払い',
      productDetails: [
        {
          productId: 'PROD-001',
          productName: 'サービスA',
          quantity: 1,
          unitPrice: 500000,
          totalPrice: 500000,
        },
      ],
      customerCreditRating: 'A',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const validationResult = validateInvoiceTargetData(dealData);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.approvalDecision).toBe('承認');
    expect(validationResult.decisionReasonCode).toBe('APPROVED_STANDARD');
    expect(validationResult.checkItems).toEqual({
      formatValidation: { status: '合格', message: '金額、顧客情報、納期の形式は正常です' },
      amountRangeCheck: { status: '合格', message: '金額500000は許容範囲内です' },
      customerCreditCheck: { status: '合格', message: '顧客信用度Aは承認基準を満たします' },
      productDetailsCheck: { status: '合格', message: '商品明細は完全に入力されています' },
      invoiceStatusCheck: null,
    });
    expect(validationResult.invoiceIssueStatusError).toBeFalsy();
  });
});