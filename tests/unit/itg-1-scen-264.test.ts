import { detectUnbilledAndDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-264
  test('未請求・遅延案件自動検出機能 - 請求対象データの妥当性確認が未完了の場合に案件が検出されない', () => {
    // 妥当性確認が未完了の案件
    const unverifiedCase = {
      caseId: 'CASE-001',
      customerId: 'CUST-100',
      customerName: '株式会社A',
      status: 'ordered',
      amount: 500000,
      expectedBillingDate: new Date('2024-04-15'),
      actualBillingDate: null,
      verificationStatus: 'incomplete',
      isBilled: false,
      isDelayed: false,
    };

    // 妥当性確認が完了した案件（未請求）
    const verifiedUnbilledCase = {
      caseId: 'CASE-002',
      customerId: 'CUST-101',
      customerName: '株式会社B',
      status: 'ordered',
      amount: 750000,
      expectedBillingDate: new Date('2024-04-10'),
      actualBillingDate: null,
      verificationStatus: 'completed',
      isBilled: false,
      isDelayed: false,
    };

    // 妥当性確認が完了した案件（遅延）
    const verifiedDelayedCase = {
      caseId: 'CASE-003',
      customerId: 'CUST-102',
      customerName: '株式会社C',
      status: 'ordered',
      amount: 1000000,
      expectedBillingDate: new Date('2024-03-31'),
      actualBillingDate: null,
      verificationStatus: 'completed',
      isBilled: false,
      isDelayed: true,
    };

    const allCases = [unverifiedCase, verifiedUnbilledCase, verifiedDelayedCase];
    const currentDate = new Date('2024-04-20T09:00:00Z');

    const result = detectUnbilledAndDelayedCases(allCases, currentDate);

    // 検出結果：妥当性確認完了案件のみが検出される
    expect(result.detectedCases.length).toBe(2);

    // 未請求案件が検出される
    const unbilledDetected = result.detectedCases.find(
      (c) => c.caseId === 'CASE-002'
    );
    expect(unbilledDetected).toBeDefined();
    expect(unbilledDetected?.caseId).toBe('CASE-002');
    expect(unbilledDetected?.customerName).toBe('株式会社B');
    expect(unbilledDetected?.detectionType).toBe('unbilled');
    expect(unbilledDetected?.verificationStatus).toBe('completed');

    // 遅延案件が検出される
    const delayedDetected = result.detectedCases.find(
      (c) => c.caseId === 'CASE-003'
    );
    expect(delayedDetected).toBeDefined();
    expect(delayedDetected?.caseId).toBe('CASE-003');
    expect(delayedDetected?.customerName).toBe('株式会社C');
    expect(delayedDetected?.detectionType).toBe('delayed');
    expect(delayedDetected?.verificationStatus).toBe('completed');

    // 妥当性確認未完了案件は検出されない
    const unverifiedDetected = result.detectedCases.find(
      (c) => c.caseId === 'CASE-001'
    );
    expect(unverifiedDetected).toBeUndefined();

    // 除外案件一覧に妥当性確認未完了案件が記載される
    expect(result.excludedCases.length).toBe(1);
    expect(result.excludedCases[0].caseId).toBe('CASE-001');
    expect(result.excludedCases[0].exclusionReason).toBe(
      'verification_incomplete'
    );

    // 集計結果の検証
    expect(result.summary.totalCasesAnalyzed).toBe(3);
    expect(result.summary.detectedCasesCount).toBe(2);
    expect(result.summary.excludedCasesCount).toBe(1);
    expect(result.summary.unbilledCasesCount).toBe(1);
    expect(result.summary.delayedCasesCount).toBe(1);
    expect(result.summary.totalUnbilledAmount).toBe(750000);
    expect(result.summary.totalDelayedAmount).toBe(1000000);
  });
});