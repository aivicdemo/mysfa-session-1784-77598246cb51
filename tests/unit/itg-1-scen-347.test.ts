import {
  generateMonthlySettlementReport,
  type MonthlySettlementReportInput,
  type MonthlySettlementReportOutput,
  type Invoice,
  type Deal,
} from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-347
  test('月次決算レポート生成機能 - 複数の商談から請求書が複数発行されたとき、各請求書金額の合計が正確に請求金額として集計される', async () => {
    // テストデータ準備: 同一の商談に紐づく3件の請求書
    const invoices: Invoice[] = [
      {
        id: 'INV-001',
        dealId: 'DEAL-2024-001',
        customerId: 'CUST-A',
        amount: 100000,
        issuedDate: new Date('2024-04-10T09:00:00Z'),
        dueDate: new Date('2024-05-10T23:59:59Z'),
        status: 'issued',
      },
      {
        id: 'INV-002',
        dealId: 'DEAL-2024-001',
        customerId: 'CUST-A',
        amount: 250000,
        issuedDate: new Date('2024-04-15T14:30:00Z'),
        dueDate: new Date('2024-05-15T23:59:59Z'),
        status: 'issued',
      },
      {
        id: 'INV-003',
        dealId: 'DEAL-2024-001',
        customerId: 'CUST-A',
        amount: 150000,
        issuedDate: new Date('2024-04-20T11:15:00Z'),
        dueDate: new Date('2024-05-20T23:59:59Z'),
        status: 'issued',
      },
    ];

    const deal: Deal = {
      id: 'DEAL-2024-001',
      customerId: 'CUST-A',
      dealName: 'Enterprise Solution Package',
      status: 'won',
      amount: 500000,
      createdDate: new Date('2024-03-01T08:00:00Z'),
      expectedClosureDate: new Date('2024-04-30T23:59:59Z'),
    };

    // スタブ化: DocumentStorageAdapter
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-REPORT-2024-04',
        fileName: 'monthly_settlement_report_2024_04.pdf',
        uploadedAt: new Date('2024-04-30T18:00:00Z').toISOString(),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/monthly_settlement_report_2024_04',
        expiresAt: new Date('2024-05-07T18:00:00Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // スタブ化: NotificationServiceAdapter
    const notificationServiceAdapterStub = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-INV-001',
        status: 'sent',
        sentAt: new Date('2024-04-10T09:05:00Z').toISOString(),
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({}),
      sendOrderNotification: jest.fn().mockResolvedValue({}),
      getDeliveryStatus: jest.fn().mockResolvedValue({ opened: true }),
    };

    // スタブ化: PaymentGatewayAdapter
    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'PLINK-INV-001',
        paymentUrl: 'https://payment.example.com/pay/PLINK-INV-001',
        expiresAt: new Date('2024-05-10T23:59:59Z').toISOString(),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: 'TXN-INV-001',
        status: 'completed',
        verifiedAt: new Date('2024-04-12T15:30:00Z').toISOString(),
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'TXN-INV-001',
        status: 'completed',
      }),
    };

    // 入力データ準備
    const reportInput: MonthlySettlementReportInput = {
      targetPeriodStart: new Date('2024-04-01T00:00:00Z'),
      targetPeriodEnd: new Date('2024-04-30T23:59:59Z'),
      invoices,
      deals: [deal],
      documentStorageAdapter: documentStorageAdapterStub,
      notificationServiceAdapter: notificationServiceAdapterStub,
      paymentGatewayAdapter: paymentGatewayAdapterStub,
    };

    // 月次決算レポート生成処理を実行
    const result: MonthlySettlementReportOutput = await generateMonthlySettlementReport(reportInput);

    // 検証: 生成されたレポートから請求金額集計額を確認
    expect(result.reportId).toBeDefined();
    expect(result.reportId).toMatch(/^REPORT-/);

    // 検証: 対象商談の請求金額集計額が¥500,000と正確に計算されていること
    expect(result.settlementsByDeal).toBeDefined();
    expect(result.settlementsByDeal.length).toBe(1);

    const dealSettlement = result.settlementsByDeal[0];
    expect(dealSettlement.dealId).toBe('DEAL-2024-001');
    expect(dealSettlement.totalBilledAmount).toBe(500000);
    expect(dealSettlement.invoiceCount).toBe(3);

    // 検証: 各請求書の金額内訳がレポート内に正確に記録されていること
    expect(dealSettlement.invoiceDetails).toBeDefined();
    expect(dealSettlement.invoiceDetails.length).toBe(3);

    const invoiceDetail1 = dealSettlement.invoiceDetails.find(
      (inv) => inv.invoiceId === 'INV-001'
    );
    expect(invoiceDetail1).toBeDefined();
    expect(invoiceDetail1?.amount).toBe(100000);
    expect(invoiceDetail1?.status).toBe('issued');

    const invoiceDetail2 = dealSettlement.invoiceDetails.find(
      (inv) => inv.invoiceId === 'INV-002'
    );
    expect(invoiceDetail2).toBeDefined();
    expect(invoiceDetail2?.amount).toBe(250000);
    expect(invoiceDetail2?.status).toBe('issued');

    const invoiceDetail3 = dealSettlement.invoiceDetails.find(
      (inv) => inv.invoiceId === 'INV-003'
    );
    expect(invoiceDetail3).toBeDefined();
    expect(invoiceDetail3?.amount).toBe(150000);
    expect(invoiceDetail3?.status).toBe('issued');

    // 検証: レポート全体の集計額
    expect(result.totalBilledAmountForPeriod).toBe(500000);
    expect(result.generatedAt).toBeDefined();
    expect(result.targetPeriodStart.toISOString()).toBe(
      new Date('2024-04-01T00:00:00Z').toISOString()
    );
    expect(result.targetPeriodEnd.toISOString()).toBe(
      new Date('2024-04-30T23:59:59Z').toISOString()
    );

    // 検証: DocumentStorageAdapterが正常に呼び出されたこと
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalled();

    // 検証: NotificationServiceAdapterが正常に呼び出されたこと
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalled();

    // 検証: PaymentGatewayAdapterが正常に呼び出されたこと
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalled();
  });
});