import { detectStagedRoutingReportingCandidates } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-699: [edge] 段階的対応ルーティング機能 - 照合結果が確定後、営業管理者への報告期限が2営業日前より遅い場合、報告対象に含まれない
  test('SCEN-699: 報告期限が基準期限と同日時の案件は報告対象リストに含まれない', () => {
    // ========== 準備フェーズ ==========
    // 照合確定日を「本日」として設定
    const reconciliationConfirmedDate = new Date('2024-01-15T00:00:00Z');
    
    // 営業日カレンダー: 2024-01-15(月) が本日
    // 営業日: 月火水木金（土日は非営業日）
    // 2024-01-15(月) → 1営業日前：2024-01-12(金)
    // 2024-01-15(月) → 2営業日前：2024-01-11(木)
    const businessDaysBefore2Date = new Date('2024-01-11T00:00:00Z');
    
    // ========== ステップ1: 照合結果が確定した案件を作成 ==========
    // テスト対象の案件：報告期限が基準期限と同日時に設定
    const dealUnderTest = {
      dealId: 'DEAL-001',
      dealStatus: 'received', // 受注ステータス
      dealAmount: 500000,
      invoiceIssuedDate: new Date('2024-01-15T00:00:00Z'),
      reconciliationConfirmedDate: reconciliationConfirmedDate,
      reportingDeadlineToManager: businessDaysBefore2Date, // 基準期限と同日時
    };
    
    // 報告対象となるべき案件：報告期限が基準期限より遅い
    const dealInReportingScope = {
      dealId: 'DEAL-002',
      dealStatus: 'received',
      dealAmount: 300000,
      invoiceIssuedDate: new Date('2024-01-15T00:00:00Z'),
      reconciliationConfirmedDate: reconciliationConfirmedDate,
      reportingDeadlineToManager: new Date('2024-01-12T00:00:00Z'), // 2024-01-12(金) = 基準期限より遅い
    };
    
    // 報告対象外の案件1：報告期限が基準期限より早い
    const dealOutOfScope1 = {
      dealId: 'DEAL-003',
      dealStatus: 'received',
      dealAmount: 200000,
      invoiceIssuedDate: new Date('2024-01-15T00:00:00Z'),
      reconciliationConfirmedDate: reconciliationConfirmedDate,
      reportingDeadlineToManager: new Date('2024-01-10T00:00:00Z'), // 2024-01-10(水) = 基準期限より早い
    };
    
    const dealRecords = [dealUnderTest, dealInReportingScope, dealOutOfScope1];
    
    // ========== ステップ2・3・4: 段階的対応ルーティング機能を実行 ==========
    const reportingCandidates = detectStagedRoutingReportingCandidates({
      deals: dealRecords,
      reconciliationConfirmedDate: reconciliationConfirmedDate,
      reportingBaselineDate: businessDaysBefore2Date,
      businessCalendar: {
        nonBusinessDays: [
          new Date('2024-01-06T00:00:00Z'), // 土曜日
          new Date('2024-01-07T00:00:00Z'), // 日曜日
          new Date('2024-01-13T00:00:00Z'), // 土曜日
          new Date('2024-01-14T00:00:00Z'), // 日曜日
        ],
      },
    });
    
    // ========== ステップ5: 期待結果を検証 ==========
    // 報告対象リストに含まれるべき案件
    const reportingDealIds = reportingCandidates.map((candidate) => candidate.dealId);
    
    // DEAL-001: 報告期限が基準期限と同日時 → 「2営業日前より遅い」条件を満たさない → 含まれない
    expect(reportingDealIds).not.toContain('DEAL-001');
    
    // DEAL-002: 報告期限が基準期限より遅い (2024-01-12 > 2024-01-11) → 「2営業日前より遅い」条件を満たす → 含まれる
    expect(reportingDealIds).toContain('DEAL-002');
    
    // DEAL-003: 報告期限が基準期限より早い (2024-01-10 < 2024-01-11) → 含まれない
    expect(reportingDealIds).not.toContain('DEAL-003');
    
    // 報告対象リストの件数が正確であることを確認
    expect(reportingCandidates).toHaveLength(1);
    expect(reportingCandidates[0].dealId).toBe('DEAL-002');
  });
});