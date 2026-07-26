import { planStagedMigration } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-306
  test('段階的移行計画策定機能 - リスク要因の入力が空または不完全な場合、処理がエラー値を返す', () => {
    // ケース1: リスク要因が完全に空の場合
    const input_empty_risk = {
      project_name: 'Salesforce to In-House Migration',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      migration_phases: [
        {
          phase_name: 'Phase 1: Data Extraction',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          deliverables: ['Data mapping document', 'Extract scripts']
        }
      ],
      risk_factors: [
        {
          risk_name: '',
          risk_description: '',
          mitigation_strategy: 'TBD'
        }
      ]
    };

    expect(() => planStagedMigration(input_empty_risk)).toThrow(/リスク要因/);
  });

  test('段階的移行計画策定機能 - リスク要因の説明が空の場合、エラーを返す', () => {
    // ケース2: リスク名は入力されているが説明が空の場合
    const input_incomplete_risk = {
      project_name: 'Salesforce to In-House Migration',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      migration_phases: [
        {
          phase_name: 'Phase 1: Data Extraction',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          deliverables: ['Data mapping document']
        }
      ],
      risk_factors: [
        {
          risk_name: 'Data Loss During Migration',
          risk_description: '',
          mitigation_strategy: 'Implement backup and rollback procedures'
        }
      ]
    };

    expect(() => planStagedMigration(input_incomplete_risk)).toThrow(/リスク要因/);
  });

  test('段階的移行計画策定機能 - 複数リスク要因の一部が不完全な場合、エラーを返す', () => {
    // ケース3: 複数のリスク要因がある中で、一つが不完全な場合
    const input_partial_incomplete_risks = {
      project_name: 'Salesforce to In-House Migration',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      migration_phases: [
        {
          phase_name: 'Phase 1: Data Extraction',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          deliverables: ['Data mapping document']
        }
      ],
      risk_factors: [
        {
          risk_name: 'Data Loss During Migration',
          risk_description: 'Potential loss of customer data during ETL process',
          mitigation_strategy: 'Implement backup and rollback procedures'
        },
        {
          risk_name: 'Performance Degradation',
          risk_description: '',
          mitigation_strategy: 'Load testing and optimization'
        }
      ]
    };

    expect(() => planStagedMigration(input_partial_incomplete_risks)).toThrow(/リスク要因/);
  });

  test('段階的移行計画策定機能 - すべてのリスク要因が完全な場合、正常に完了する', () => {
    // ケース4: すべてのリスク要因が完全に入力された場合（成功ケース）
    const input_complete_risks = {
      project_name: 'Salesforce to In-House Migration',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      migration_phases: [
        {
          phase_name: 'Phase 1: Data Extraction',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          deliverables: ['Data mapping document', 'Extract scripts'],
          completion_criteria: 'All data successfully extracted and validated'
        },
        {
          phase_name: 'Phase 2: System Testing',
          start_date: '2024-08-01',
          end_date: '2024-10-31',
          deliverables: ['Test cases', 'UAT results'],
          completion_criteria: 'UAT approval obtained from stakeholders'
        }
      ],
      risk_factors: [
        {
          risk_name: 'Data Loss During Migration',
          risk_description: 'Potential loss of customer data during ETL process',
          mitigation_strategy: 'Implement backup and rollback procedures'
        },
        {
          risk_name: 'Performance Degradation',
          risk_description: 'System response time may increase during migration period',
          mitigation_strategy: 'Load testing and optimization before go-live'
        },
        {
          risk_name: 'User Adoption Resistance',
          risk_description: 'Sales team may resist switching to new system',
          mitigation_strategy: 'Comprehensive training and change management program'
        }
      ]
    };

    const result = planStagedMigration(input_complete_risks);

    expect(result).toEqual(
      expect.objectContaining({
        project_name: 'Salesforce to In-House Migration',
        start_date: '2024-06-01',
        end_date: '2024-12-31',
        phase_count: 2,
        risk_count: 3,
        status: 'planned'
      })
    );
    expect(result.migration_phases).toHaveLength(2);
    expect(result.migration_phases[0]).toEqual(
      expect.objectContaining({
        phase_name: 'Phase 1: Data Extraction',
        start_date: '2024-06-01',
        end_date: '2024-07-31'
      })
    );
    expect(result.risk_factors).toHaveLength(3);
    expect(result.risk_factors[0]).toEqual(
      expect.objectContaining({
        risk_name: 'Data Loss During Migration',
        risk_description: 'Potential loss of customer data during ETL process'
      })
    );
  });

  test('段階的移行計画策定機能 - リスク要因が null の場合、エラーを返す', () => {
    // ケース5: リスク要因の値が null の場合
    const input_null_risk = {
      project_name: 'Salesforce to In-House Migration',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      migration_phases: [
        {
          phase_name: 'Phase 1: Data Extraction',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          deliverables: ['Data mapping document']
        }
      ],
      risk_factors: null
    };

    expect(() => planStagedMigration(input_null_risk)).toThrow(/リスク要因/);
  });

  test('段階的移行計画策定機能 - リスク要因が空配列の場合、エラーを返す', () => {
    // ケース6: リスク要因が空配列の場合
    const input_empty_array_risk = {
      project_name: 'Salesforce to In-House Migration',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      migration_phases: [
        {
          phase_name: 'Phase 1: Data Extraction',
          start_date: '2024-06-01',
          end_date: '2024-07-31',
          deliverables: ['Data mapping document']
        }
      ],
      risk_factors: []
    };

    expect(() => planStagedMigration(input_empty_array_risk)).toThrow(/リスク要因/);
  });
});