import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-193: [edge] 月次決算時の未請求・遅延案件の段階的検出と対応SLA管理機能 - 期限当日（SLA境界値）の案件は正しいSLAレベルに分類される
  test('SLA期限日が本日（当日）の未請求・遅延案件は、正しいSLAレベル（境界値）に分類され、一貫性が保たれる', () => {
    const today = new Date('2024-04-15T09:00:00Z');
    const systemCurrentDate = new Date('2024-04-15T09:00:00Z');

    // テスト対象データ: SLA期限が本日（当日）の未請求案件
    const unbilledDealOnBoundary = {
      deal_id: 'DEAL001',
      customer_id: 'CUST001',
      status: '受注',
      amount: 500000,
      invoice_issued: false,
      invoice_due_date: today,
      sla_deadline_date: today,
      invoice_issue_date: null,
      customer_name: 'テスト顧客A',
    };

    // テスト対象データ: SLA期限が本日（当日）の遅延案件
    const delayedDealOnBoundary = {
      deal_id: 'DEAL002',
      customer_id: 'CUST002',
      status: '受注',
      amount: 300000,
      invoice_issued: true,
      invoice_due_date: new Date('2024-04-14T09:00:00Z'),
      sla_deadline_date: today,
      invoice_issue_date: new Date('2024-04-12T09:00:00Z'),
      customer_name: 'テスト顧客B',
    };

    // テスト対象データ: 既に期限を過ぎた遅延案件（比較用）
    const delayedDealPastDeadline = {
      deal_id: 'DEAL003',
      customer_id: 'CUST003',
      status: '受注',
      amount: 200000,
      invoice_issued: true,
      invoice_due_date: new Date('2024-04-13T09:00:00Z'),
      sla_deadline_date: new Date('2024-04-14T09:00:00Z'),
      invoice_issue_date: new Date('2024-04-10T09:00:00Z'),
      customer_name: 'テスト顧客C',
    };

    const deals = [
      unbilledDealOnBoundary,
      delayedDealOnBoundary,
      delayedDealPastDeadline,
    ];

    // 第1回実行: 月次決算時の段階的検出処理
    const detectionResult1 = detectUnbilledAndDelayedDeals(
      deals,
      systemCurrentDate,
    );

    // 未請求案件が正しく検出される
    const unbilledDeals1 = detectionResult1.unbilled_deals;
    expect(unbilledDeals1.length).toBe(1);
    expect(unbilledDeals1[0].deal_id).toBe('DEAL001');
    expect(unbilledDeals1[0].sla_level).toBe('警告段階');

    // 遅延案件が正しく分類される
    const delayedDeals1 = detectionResult1.delayed_deals;
    expect(delayedDeals1.length).toBe(2);

    // SLA期限が本日（当日）の遅延案件は「警告段階」
    const onBoundaryDelayed = delayedDeals1.find(
      (d) => d.deal_id === 'DEAL002',
    );
    expect(onBoundaryDelayed).toBeDefined();
    expect(onBoundaryDelayed?.sla_level).toBe('警告段階');

    // SLA期限を超過している遅延案件は「超過段階」
    const pastDeadlineDelayed = delayedDeals1.find(
      (d) => d.deal_id === 'DEAL003',
    );
    expect(pastDeadlineDelayed).toBeDefined();
    expect(pastDeadlineDelayed?.sla_level).toBe('超過段階');

    // 第2回実行: 一貫性を確認（複数回実行による分類結果の一貫性）
    const detectionResult2 = detectUnbilledAndDelayedDeals(
      deals,
      systemCurrentDate,
    );

    const unbilledDeals2 = detectionResult2.unbilled_deals;
    expect(unbilledDeals2.length).toBe(1);
    expect(unbilledDeals2[0].deal_id).toBe('DEAL001');
    expect(unbilledDeals2[0].sla_level).toBe('警告段階');

    const delayedDeals2 = detectionResult2.delayed_deals;
    expect(delayedDeals2.length).toBe(2);

    const onBoundaryDelayed2 = delayedDeals2.find(
      (d) => d.deal_id === 'DEAL002',
    );
    expect(onBoundaryDelayed2?.sla_level).toBe('警告段階');

    const pastDeadlineDelayed2 = delayedDeals2.find(
      (d) => d.deal_id === 'DEAL003',
    );
    expect(pastDeadlineDelayed2?.sla_level).toBe('超過段階');

    // SLA対応履歴ログが正確に記録されている
    expect(detectionResult1.sla_audit_log).toBeDefined();
    expect(detectionResult1.sla_audit_log.length).toBeGreaterThan(0);

    // 期限当日時点での判定ロジックが正確に記録
    const onBoundaryAuditLog = detectionResult1.sla_audit_log.find(
      (log) => log.deal_id === 'DEAL001',
    );
    expect(onBoundaryAuditLog).toBeDefined();
    expect(onBoundaryAuditLog?.judgment_date).toEqual(systemCurrentDate);
    expect(onBoundaryAuditLog?.sla_deadline_date).toEqual(today);
    expect(onBoundaryAuditLog?.sla_level_determined).toBe('警告段階');
    expect(onBoundaryAuditLog?.days_remaining).toBe(0);

    // 上位段階への誤分類がされていない（未請求案件が「超過段階」に分類されない）
    expect(unbilledDeals1.every((d) => d.sla_level !== '超過段階')).toBe(true);

    // 下位段階への誤分類がされていない（遅延案件DEAL003が「警告段階」に分類されない）
    expect(pastDeadlineDelayed?.sla_level).not.toBe('警告段階');

    // 第3回実行: 複数回の処理実行で分類結果の一貫性を確認
    const detectionResult3 = detectUnbilledAndDelayedDeals(
      deals,
      systemCurrentDate,
    );

    expect(detectionResult3.unbilled_deals[0].sla_level).toBe(
      detectionResult1.unbilled_deals[0].sla_level,
    );
    expect(detectionResult3.delayed_deals[0].sla_level).toBe(
      detectionResult1.delayed_deals[0].sla_level,
    );
    expect(detectionResult3.delayed_deals[1].sla_level).toBe(
      detectionResult1.delayed_deals[1].sla_level,
    );
  });
});