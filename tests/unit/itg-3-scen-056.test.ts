import { validateMigrationPlan } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('段階的移行計画の定義・検証機能', () => {
  // SCEN-056
  test('移行フェーズが1つのみの場合、計画が有効と判定される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-001',
      planName: '段階的移行計画-2024年Q1',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-03-31T23:59:59Z'),
          targetLicenseCount: 50,
          targetUserCount: 45,
          migrationScope: 'Core team and pilot users',
          riskFactors: ['Data consistency validation', 'User adoption'],
          mitigationStrategies: ['Parallel run for 2 weeks', 'Comprehensive training'],
          completionCriteria: 'All users trained and data verified',
          alternativePlan: 'Rollback to Salesforce if critical issues detected',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    const validationResult = validateMigrationPlan(migrationPlan);

    expect(validationResult).toEqual({
      isValid: true,
      planStatus: '有効',
      phaseCount: 1,
      validationMessages: [],
      errors: [],
      savedAt: expect.any(Date),
    });

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.planStatus).toBe('有効');
    expect(validationResult.phaseCount).toBe(1);
    expect(Array.isArray(validationResult.validationMessages)).toBe(true);
    expect(validationResult.validationMessages.length).toBe(0);
    expect(Array.isArray(validationResult.errors)).toBe(true);
    expect(validationResult.errors.length).toBe(0);
    expect(validationResult.savedAt).toBeInstanceOf(Date);
  });

  test('移行フェーズが複数の場合、計画が有効と判定される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-002',
      planName: '段階的移行計画-2024年複数フェーズ',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-03-31T23:59:59Z'),
          targetLicenseCount: 25,
          targetUserCount: 20,
          migrationScope: 'Pilot team',
          riskFactors: ['User adoption'],
          mitigationStrategies: ['Early training'],
          completionCriteria: 'Pilot phase completion',
          alternativePlan: 'Extend timeline',
        },
        {
          phaseId: 'PHASE-002',
          phaseName: '拡大段階',
          startDate: new Date('2024-04-01T00:00:00Z'),
          endDate: new Date('2024-06-30T23:59:59Z'),
          targetLicenseCount: 50,
          targetUserCount: 45,
          migrationScope: 'Department expansion',
          riskFactors: ['Performance', 'Integration'],
          mitigationStrategies: ['Load testing', 'Integration validation'],
          completionCriteria: 'All departments migrated',
          alternativePlan: 'Phased rollback',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    const validationResult = validateMigrationPlan(migrationPlan);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.planStatus).toBe('有効');
    expect(validationResult.phaseCount).toBe(2);
    expect(validationResult.errors.length).toBe(0);
  });

  test('フェーズが0個の場合、計画は無効と判定される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-003',
      planName: '段階的移行計画-フェーズなし',
      phases: [],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    expect(() => validateMigrationPlan(migrationPlan)).toThrow(/フェーズ/);
  });

  test('フェーズの期間設定が不正な場合、エラーが返される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-004',
      planName: '段階的移行計画-期間不正',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-03-31T23:59:59Z'),
          endDate: new Date('2024-01-01T00:00:00Z'),
          targetLicenseCount: 50,
          targetUserCount: 45,
          migrationScope: 'Core team',
          riskFactors: [],
          mitigationStrategies: [],
          completionCriteria: 'Phase complete',
          alternativePlan: 'Rollback',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    expect(() => validateMigrationPlan(migrationPlan)).toThrow(/期間/);
  });

  test('対象ユーザー数が負数の場合、エラーが返される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-005',
      planName: '段階的移行計画-ユーザー数不正',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-03-31T23:59:59Z'),
          targetLicenseCount: 50,
          targetUserCount: -5,
          migrationScope: 'Core team',
          riskFactors: [],
          mitigationStrategies: [],
          completionCriteria: 'Phase complete',
          alternativePlan: 'Rollback',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    expect(() => validateMigrationPlan(migrationPlan)).toThrow(/ユーザー数/);
  });

  test('ライセンス数が対象ユーザー数を下回る場合、警告メッセージが返される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-006',
      planName: '段階的移行計画-ライセンス不足警告',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-03-31T23:59:59Z'),
          targetLicenseCount: 30,
          targetUserCount: 45,
          migrationScope: 'Core team',
          riskFactors: ['License shortage'],
          mitigationStrategies: ['License procurement'],
          completionCriteria: 'Phase complete',
          alternativePlan: 'Adjust scope',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    const validationResult = validateMigrationPlan(migrationPlan);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.planStatus).toBe('有効');
    expect(validationResult.validationMessages.length).toBeGreaterThan(0);
    expect(validationResult.validationMessages.some((msg: string) => /ライセンス/.test(msg))).toBe(true);
  });

  test('完了判定基準が空の場合、エラーが返される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-007',
      planName: '段階的移行計画-完了判定基準なし',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-03-31T23:59:59Z'),
          targetLicenseCount: 50,
          targetUserCount: 45,
          migrationScope: 'Core team',
          riskFactors: [],
          mitigationStrategies: [],
          completionCriteria: '',
          alternativePlan: 'Rollback',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    expect(() => validateMigrationPlan(migrationPlan)).toThrow(/完了判定基準/);
  });

  test('リスク対応策がリスク要因を網羅していない場合、警告メッセージが返される', () => {
    const migrationPlan = {
      planId: 'PLAN-20240115-008',
      planName: '段階的移行計画-対応策不足',
      phases: [
        {
          phaseId: 'PHASE-001',
          phaseName: '初期段階',
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-03-31T23:59:59Z'),
          targetLicenseCount: 50,
          targetUserCount: 45,
          migrationScope: 'Core team',
          riskFactors: ['Data migration', 'User adoption', 'Integration'],
          mitigationStrategies: ['Data validation', 'Training program'],
          completionCriteria: 'Phase complete',
          alternativePlan: 'Rollback',
        },
      ],
      createdAt: new Date('2024-01-15T10:00:00Z'),
      createdBy: 'admin001',
      status: 'DRAFT',
    };

    const validationResult = validateMigrationPlan(migrationPlan);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.planStatus).toBe('有効');
    expect(validationResult.validationMessages.length).toBeGreaterThan(0);
  });
});