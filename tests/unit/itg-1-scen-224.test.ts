import { defineMigrationPlan } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-224
  test('[normal] システム移行計画策定 - 移行フェーズ・マイルストーン・リスク要因・対応策が全て定義されて移行計画が成立する', () => {
    const migrationPhases = [
      {
        phaseId: 'phase_1',
        phaseName: 'フェーズ1：準備期間',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
        milestone: '要件定義完了',
      },
      {
        phaseId: 'phase_2',
        phaseName: 'フェーズ2：構築期間',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        milestone: '構築完了',
      },
      {
        phaseId: 'phase_3',
        phaseName: 'フェーズ3：テスト期間',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        milestone: 'UAT完了',
      },
      {
        phaseId: 'phase_4',
        phaseName: 'フェーズ4：本番移行',
        startDate: '2024-11-01',
        endDate: '2024-11-15',
        milestone: '本番稼働',
      },
    ];

    const riskFactors = [
      {
        riskId: 'risk_1',
        riskName: 'データ移行エラー',
        severity: 'high',
        countermeasure: '事前の包括的なテスト実施',
      },
      {
        riskId: 'risk_2',
        riskName: 'システムダウンタイム',
        severity: 'high',
        countermeasure: '段階的な移行スケジュール',
      },
      {
        riskId: 'risk_3',
        riskName: 'ユーザーの習熟遅延',
        severity: 'medium',
        countermeasure: '研修プログラムの強化',
      },
    ];

    const migrationPlanInput = {
      planId: 'migration_plan_001',
      projectName: 'Salesforce から自社開発システムへの移行',
      phases: migrationPhases,
      riskFactors: riskFactors,
      createdAt: '2024-05-15T10:00:00Z',
      createdBy: 'manager_001',
    };

    const result = defineMigrationPlan(migrationPlanInput);

    expect(result.planId).toBe('migration_plan_001');
    expect(result.status).toBe('approved');
    expect(result.phases).toHaveLength(4);
    expect(result.phases[0].phaseName).toBe('フェーズ1：準備期間');
    expect(result.phases[0].milestone).toBe('要件定義完了');
    expect(result.phases[1].phaseName).toBe('フェーズ2：構築期間');
    expect(result.phases[1].milestone).toBe('構築完了');
    expect(result.phases[2].phaseName).toBe('フェーズ3：テスト期間');
    expect(result.phases[2].milestone).toBe('UAT完了');
    expect(result.phases[3].phaseName).toBe('フェーズ4：本番移行');
    expect(result.phases[3].milestone).toBe('本番稼働');

    expect(result.riskFactors).toHaveLength(3);
    expect(result.riskFactors[0].riskName).toBe('データ移行エラー');
    expect(result.riskFactors[0].countermeasure).toBe('事前の包括的なテスト実施');
    expect(result.riskFactors[1].riskName).toBe('システムダウンタイム');
    expect(result.riskFactors[1].countermeasure).toBe('段階的な移行スケジュール');
    expect(result.riskFactors[2].riskName).toBe('ユーザーの習熟遅延');
    expect(result.riskFactors[2].countermeasure).toBe('研修プログラムの強化');

    expect(result.isValidated).toBe(true);
    expect(result.completionCriteria.allPhasesDefinedCorrectly).toBe(true);
    expect(result.completionCriteria.allMilestonesAssigned).toBe(true);
    expect(result.completionCriteria.allRiskFactorsIdentified).toBe(true);
    expect(result.completionCriteria.allCountermeasuresLinked).toBe(true);
    expect(result.approvalTimestamp).toBe('2024-05-15T10:00:00Z');
  });
});