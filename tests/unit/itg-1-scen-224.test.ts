import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  generateRealtimeRevenueReport,
  verifyDealStatusAndInvoiceDateAlignment,
} from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-224: [normal] 未請求案件と遅延案件への対応完了後、商談ステータスと請求書発行日が完全に一致することが確認される

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('未請求案件・遅延案件の対応後、リアルタイム集計レポート生成時に商談ステータスと請求書発行日が完全に一致する', () => {
    // 前提: 営業管理システムに未請求案件と遅延案件が存在し、対応が完了している状態

    // 未請求案件対応データ
    const unInvoicedDealAfterAction = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealStatus: 'completed', // 完了ステータスに更新済み
      dealAmount: 500000,
      dealName: '未請求案件対応済み',
      invoiceStatus: 'invoiced', // 「未請求」から「請求対象」に変更済み
      invoiceIssuedDate: new Date('2024-04-15T10:30:00Z'),
      invoiceAmount: 500000,
    };

    // 遅延案件対応データ
    const delayedDealAfterAction = {
      dealId: 'DEAL-002',
      customerId: 'CUST-002',
      dealStatus: 'completed', // 完了ステータスに更新済み
      dealAmount: 300000,
      dealName: '遅延案件対応済み',
      invoiceStatus: 'invoiced', // 請求状況が確認済み
      invoiceIssuedDate: new Date('2024-04-16T14:45:00Z'),
      invoiceAmount: 300000,
      resolutionNotes: 'お客様から支払い予定日の確認が取れた',
    };

    // 対応済み案件リスト
    const processedDealsData = [unInvoicedDealAfterAction, delayedDealAfterAction];

    // リアルタイム集計レポート生成の実行
    const generatedReport = generateRealtimeRevenueReport({
      dealsData: processedDealsData,
      reportGeneratedDate: new Date('2024-04-20T09:00:00Z'),
      includeProcessedItems: true,
    });

    // リアルタイム集計レポートが生成されたことを確認
    expect(generatedReport).toBeDefined();
    expect(generatedReport.reportType).toBe('realtime_revenue_report');
    expect(generatedReport.generatedAt).toEqual(new Date('2024-04-20T09:00:00Z'));
    expect(generatedReport.totalProcessedDeals).toBe(2);

    // リアルタイムレポートに含まれる案件の商談ステータスと請求書発行日の一致確認
    const reportedDeals = generatedReport.reportedDeals;
    expect(reportedDeals).toHaveLength(2);

    // 未請求案件対応後の商談ステータスと請求書発行日の一致を検証
    const reportedUnInvoicedDeal = reportedDeals.find(
      (d: { dealId: string }) => d.dealId === 'DEAL-001'
    );
    expect(reportedUnInvoicedDeal).toBeDefined();
    expect(reportedUnInvoicedDeal.dealStatus).toBe('completed');
    expect(reportedUnInvoicedDeal.invoiceIssuedDate).toEqual(
      new Date('2024-04-15T10:30:00Z')
    );
    expect(reportedUnInvoicedDeal.invoiceAmount).toBe(500000);
    expect(reportedUnInvoicedDeal.alignmentStatus).toBe('aligned');

    // 遅延案件対応後の商談ステータスと請求書発行日の一致を検証
    const reportedDelayedDeal = reportedDeals.find(
      (d: { dealId: string }) => d.dealId === 'DEAL-002'
    );
    expect(reportedDelayedDeal).toBeDefined();
    expect(reportedDelayedDeal.dealStatus).toBe('completed');
    expect(reportedDelayedDeal.invoiceIssuedDate).toEqual(
      new Date('2024-04-16T14:45:00Z')
    );
    expect(reportedDelayedDeal.invoiceAmount).toBe(300000);
    expect(reportedDelayedDeal.alignmentStatus).toBe('aligned');

    // 商談ステータスと請求書発行日の整合性を個別に検証
    const alignmentCheckResult1 = verifyDealStatusAndInvoiceDateAlignment({
      dealId: 'DEAL-001',
      dealStatus: 'completed',
      invoiceIssuedDate: new Date('2024-04-15T10:30:00Z'),
      invoiceAmount: 500000,
    });
    expect(alignmentCheckResult1.isAligned).toBe(true);
    expect(alignmentCheckResult1.statusCode).toBe(200);

    const alignmentCheckResult2 = verifyDealStatusAndInvoiceDateAlignment({
      dealId: 'DEAL-002',
      dealStatus: 'completed',
      invoiceIssuedDate: new Date('2024-04-16T14:45:00Z'),
      invoiceAmount: 300000,
    });
    expect(alignmentCheckResult2.isAligned).toBe(true);
    expect(alignmentCheckResult2.statusCode).toBe(200);

    // リアルタイム集計レポートの集計値を検証
    expect(generatedReport.totalRevenueAmount).toBe(800000); // 500000 + 300000
    expect(generatedReport.totalInvoicedAmount).toBe(800000);
    expect(generatedReport.unInvoicedAmount).toBe(0);
    expect(generatedReport.alignedDealsCount).toBe(2);
    expect(generatedReport.misalignedDealsCount).toBe(0);

    // リアルタイム集計レポートの生成タイムスタンプが正確であることを検証
    expect(generatedReport.reportPeriodStart).toEqual(new Date('2024-04-01T00:00:00Z'));
    expect(generatedReport.reportPeriodEnd).toEqual(new Date('2024-04-30T23:59:59Z'));
    expect(generatedReport.dataRefreshTimestamp).toEqual(
      new Date('2024-04-20T09:00:00Z')
    );
  });
});