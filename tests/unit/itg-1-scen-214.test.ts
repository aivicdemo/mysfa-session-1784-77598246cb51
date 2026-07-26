import { detectInvoiceDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-214: [edge] 請求予定日が当日の案件は遅延案件として判定されない
  test('請求予定日が当日の案件は遅延案件として判定されず、対象外として除外される', () => {
    const today = new Date('2024-04-15');
    
    const dealRecords = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        customerName: '顧客A企業',
        dealStatus: '受注',
        dealAmount: 1000000,
        invoiceScheduledDate: today,
        invoiceIssuedDate: null,
        invoiceStatus: '未発行',
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        customerName: '顧客B企業',
        dealStatus: '受注',
        dealAmount: 500000,
        invoiceScheduledDate: new Date('2024-04-14'),
        invoiceIssuedDate: null,
        invoiceStatus: '未発行',
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST003',
        customerName: '顧客C企業',
        dealStatus: '受注',
        dealAmount: 750000,
        invoiceScheduledDate: new Date('2024-04-16'),
        invoiceIssuedDate: null,
        invoiceStatus: '未発行',
      },
    ];

    const detectionResult = detectInvoiceDelayedCases(dealRecords, today);

    expect(detectionResult).toEqual({
      totalDealsChecked: 3,
      delayedCases: [
        {
          dealId: 'DEAL002',
          customerId: 'CUST002',
          customerName: '顧客B企業',
          dealStatus: '受注',
          dealAmount: 500000,
          invoiceScheduledDate: new Date('2024-04-14'),
          invoiceIssuedDate: null,
          invoiceStatus: '未発行',
          delayDays: 1,
          delayReason: '請求予定日超過',
        },
      ],
      nonDelayedCases: [
        {
          dealId: 'DEAL001',
          customerId: 'CUST001',
          customerName: '顧客A企業',
          dealStatus: '受注',
          dealAmount: 1000000,
          invoiceScheduledDate: today,
          invoiceIssuedDate: null,
          invoiceStatus: '未発行',
          delayStatus: '遅延なし',
          reason: '請求予定日が当日のため対象外',
        },
        {
          dealId: 'DEAL003',
          customerId: 'CUST003',
          customerName: '顧客C企業',
          dealStatus: '受注',
          dealAmount: 750000,
          invoiceScheduledDate: new Date('2024-04-16'),
          invoiceIssuedDate: null,
          invoiceStatus: '未発行',
          delayStatus: '遅延なし',
          reason: '請求予定日が未来のため対象外',
        },
      ],
      delayedCaseCount: 1,
      totalDelayedAmount: 500000,
      alertNotificationRequired: true,
      notificationRecipient: 'management',
      detectionTimestamp: new Date('2024-04-15T00:00:00Z'),
    });

    expect(detectionResult.delayedCases.length).toBe(1);
    expect(detectionResult.nonDelayedCases.length).toBe(2);
    expect(
      detectionResult.nonDelayedCases.find(
        (c) => c.dealId === 'DEAL001'
      )?.delayStatus
    ).toBe('遅延なし');
    expect(
      detectionResult.nonDelayedCases.find(
        (c) => c.dealId === 'DEAL001'
      )?.reason
    ).toBe('請求予定日が当日のため対象外');
    expect(detectionResult.alertNotificationRequired).toBe(true);
    expect(detectionResult.notificationRecipient).toBe('management');
  });
});