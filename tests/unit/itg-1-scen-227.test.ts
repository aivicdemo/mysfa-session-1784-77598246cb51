import { createMigrationPlan } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-227
  test('移行マイルストーンが1つのみの最小構成の移行計画が成立する', () => {
    const migration_plan_input = {
      plan_name: 'Salesforce to Custom System Migration',
      description: 'Phase-based migration from Salesforce to self-developed CRM',
      migration_start_date: '2024-06-01',
      migration_end_date: '2024-12-31',
      milestones: [
        {
          milestone_id: 'M001',
          milestone_name: '初期データ移行完了',
          planned_date: '2024-07-15',
          assigned_person: 'admin_user_001',
          completion_criteria: 'All historical transaction data transferred and validated'
        }
      ],
      risk_factors: [
        {
          risk_id: 'R001',
          risk_description: 'Data inconsistency during transfer',
          mitigation_strategy: 'Implement double validation and reconciliation process'
        }
      ],
      contingency_plans: [
        {
          contingency_id: 'C001',
          contingency_description: 'Rollback to Salesforce if critical issues detected',
          trigger_condition: 'Migration failure rate exceeds 5%'
        }
      ]
    };

    const result = createMigrationPlan(migration_plan_input);

    expect(result).toBeDefined();
    expect(result.plan_id).toBeDefined();
    expect(result.plan_name).toBe('Salesforce to Custom System Migration');
    expect(result.description).toBe('Phase-based migration from Salesforce to self-developed CRM');
    expect(result.migration_start_date).toBe('2024-06-01');
    expect(result.migration_end_date).toBe('2024-12-31');
    expect(result.status).toBe('drafted');
    expect(result.milestones).toHaveLength(1);
    expect(result.milestones[0]).toEqual({
      milestone_id: 'M001',
      milestone_name: '初期データ移行完了',
      planned_date: '2024-07-15',
      assigned_person: 'admin_user_001',
      completion_criteria: 'All historical transaction data transferred and validated',
      status: 'pending'
    });
    expect(result.risk_factors).toHaveLength(1);
    expect(result.risk_factors[0]).toEqual({
      risk_id: 'R001',
      risk_description: 'Data inconsistency during transfer',
      mitigation_strategy: 'Implement double validation and reconciliation process'
    });
    expect(result.contingency_plans).toHaveLength(1);
    expect(result.contingency_plans[0]).toEqual({
      contingency_id: 'C001',
      contingency_description: 'Rollback to Salesforce if critical issues detected',
      trigger_condition: 'Migration failure rate exceeds 5%'
    });
    expect(result.created_at).toBeDefined();
    expect(result.created_by).toBe('admin_user_001');
  });
});