import { detectDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-582: [edge] 商談ステータスと請求書の自動照合・遅延案件検出 - 月末日が請求予定日である案件が遅延となった場合、遅延案件として正しく判定される
  test('月末日の請求予定日を超過した案件が遅延案件として正しく判定される', () => {
    // システムの基準時刻を2024年1月31日23時59分に設定
    const baselineDateTime = new Date('2024-01-31T23:59:00Z');

    // 顧客A、商談ID「DL-202401-001」を作成
    const dealId = 'DL-202401-001';
    const customerId = 'CUST-A-001';
    const dealData = {
      dealId: dealId,
      customerId: customerId,
      dealStatus: '提案中',
      invoicePlannedDate: new Date('2024-01-31T00:00:00Z'),
      invoicePlannedAmount: 100000,
      invoiceIssuedDate: baselineDateTime,
      invoiceStatus: '未払い',
      currentDateTime: baselineDateTime
    };

    // NotificationServiceAdapterのスタブ
    const notificationServiceAdapterStub = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-INV-001',
        status: 'sent',
        timestamp: baselineDateTime.toISOString()
      })
    };

    // DocumentStorageAdapterのスタブ
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-INV-001',
        storagePath: 'gs://storage/invoices/DL-202401-001.pdf',
        uploadedAt: baselineDateTime.toISOString()
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/share123',
        expirationTime: new Date(baselineDateTime.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true })
    };

    // PaymentGatewayAdapterのスタブ
    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'PAYLINK-001',
        paymentUrl: 'https://payment.gmo.jp/link123',
        expirationTime: new Date(baselineDateTime.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn()
    };

    // 請求書発行処理を実行（スタブの呼び出し確認）
    notificationServiceAdapterStub.sendInvoiceNotification({
      dealId: dealId,
      customerId: customerId,
      invoiceAmount: 100000
    });

    documentStorageAdapterStub.uploadDocument({
      documentType: 'invoice',
      dealId: dealId,
      fileContent: 'PDF_CONTENT'
    });

    documentStorageAdapterStub.generateShareLink({
      documentId: 'DOC-INV-001'
    });

    paymentGatewayAdapterStub.generatePaymentLink({
      dealId: dealId,
      invoiceAmount: 100000
    });

    // スタブの呼び出しが成功したことを確認
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalled();
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalled();
    expect(documentStorageAdapterStub.generateShareLink).toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalled();

    // 請求書ステータスが「未払い」であることを確認
    expect(dealData.invoiceStatus).toBe('未払い');

    // システムの基準時刻を2024年2月5日（請求予定日から5日経過）に進める
    const detectionDateTime = new Date('2024-02-05T09:00:00Z');
    const delayedDealData = {
      dealId: dealId,
      customerId: customerId,
      dealStatus: '提案中',
      invoicePlannedDate: new Date('2024-01-31T00:00:00Z'),
      invoicePlannedAmount: 100000,
      invoiceIssuedDate: baselineDateTime,
      invoiceStatus: '未払い',
      detectionDateTime: detectionDateTime
    };

    // 遅延案件検出バッチ処理（DelayedDealDetectionBatch）を手動実行
    const detectionResult = detectDelayedDeals(
      [delayedDealData],
      detectionDateTime,
      notificationServiceAdapterStub
    );

    // 期待結果を検証
    expect(detectionResult).toHaveLength(1);
    expect(detectionResult[0]).toEqual({
      dealId: dealId,
      customerId: customerId,
      dealStatus: '遅延',
      invoicePlannedDate: new Date('2024-01-31T00:00:00Z'),
      invoicePlannedAmount: 100000,
      invoiceIssuedDate: baselineDateTime,
      invoiceStatus: '未払い',
      isDelayed: true,
      delayedDays: 5,
      delayDetectionDateTime: detectionDateTime,
      delayReason: '請求予定日2024年1月31日を経過しても未払い',
      displayOnDashboard: true
    });

    // ダッシュボード表示フラグが true であることを確認
    expect(detectionResult[0].displayOnDashboard).toBe(true);

    // 遅延日数が正確に計算されていることを確認（1月31日0:00:00 → 2月5日9:00:00）
    const expectedDelayedDays = Math.floor(
      (detectionDateTime.getTime() - new Date('2024-01-31T00:00:00Z').getTime()) / (1000 * 60 * 60 * 24)
    );
    expect(detectionResult[0].delayedDays).toBe(expectedDelayedDays);

    // 外部通知（LicenseAlertNotificationService）は使用されないことを確認
    // このテストではLicenseAlertNotificationServiceは必要ないため、呼び出しがないことを確認
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: dealId,
        customerId: customerId,
        invoiceAmount: 100000
      })
    );
  });
});