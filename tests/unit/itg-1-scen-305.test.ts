import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  defineMigrationPhases,
  validatePhaseCompletionCriteria,
  detectPhaseDelays,
  generateAlternativeProposals,
  selectAndApplyAlternative,
  validatePlanIntegrity,
} from '../../src/logic/it-1-3';

describe('段階的移行計画策定機能 - 各フェーズの完了判定基準と遅延時の代替案が正確に決定される', () => {
  // SCEN-305
  test('SCEN-305: 段階的移行計画策定機能 - フェーズ完了判定基準と遅延時代替案の正確な決定と適用', () => {
    // Step 1: 複数のフェーズ（Phase1、Phase2、Phase3）を定義
    const migration_plan_id = 'PLAN-20240601-001';
    const phase_definitions = [
      {
        phase_id: 'PHASE-1',
        phase_name: 'Phase1',
        planned_start_date: new Date('2024-06-01T00:00:00Z'),
        planned_end_date: new Date('2024-07-31T23:59:59Z'),
        phase_sequence: 1,
        dependency_phase_id: null,
      },
      {
        phase_id: 'PHASE-2',
        phase_name: 'Phase2',
        planned_start_date: new Date('2024-08-01T00:00:00Z'),
        planned_end_date: new Date('2024-09-30T23:59:59Z'),
        phase_sequence: 2,
        dependency_phase_id: 'PHASE-1',
      },
      {
        phase_id: 'PHASE-3',
        phase_name: 'Phase3',
        planned_start_date: new Date('2024-10-01T00:00:00Z'),
        planned_end_date: new Date('2024-11-30T23:59:59Z'),
        phase_sequence: 3,
        dependency_phase_id: 'PHASE-2',
      },
    ];

    const phases_created = defineMigrationPhases({
      migration_plan_id,
      phases: phase_definitions,
    });

    expect(phases_created.success).toBe(true);
    expect(phases_created.phases).toHaveLength(3);
    expect(phases_created.phases[0].phase_name).toBe('Phase1');
    expect(phases_created.phases[1].phase_name).toBe('Phase2');
    expect(phases_created.phases[2].phase_name).toBe('Phase3');

    // Step 2: 各フェーズに対して完了判定基準を設定
    const completion_criteria = [
      {
        phase_id: 'PHASE-1',
        criterion_id: 'CRIT-1-1',
        criterion_name: '顧客データ移行率100%',
        criterion_type: 'data_migration_rate',
        target_value: 100,
        unit: 'percentage',
        validation_rule: 'migration_rate >= 100',
        priority: 1,
      },
      {
        phase_id: 'PHASE-2',
        criterion_id: 'CRIT-2-1',
        criterion_name: '営業ツール導入完了',
        criterion_type: 'tool_deployment',
        target_value: 1,
        unit: 'binary',
        validation_rule: 'deployment_status == completed',
        priority: 1,
      },
      {
        phase_id: 'PHASE-3',
        criterion_id: 'CRIT-3-1',
        criterion_name: 'ユーザー習熟度確認',
        criterion_type: 'user_proficiency',
        target_value: 80,
        unit: 'percentage',
        validation_rule: 'proficiency_score >= 80',
        priority: 1,
      },
    ];

    const criteria_validation = validatePhaseCompletionCriteria({
      migration_plan_id,
      criteria: completion_criteria,
    });

    expect(criteria_validation.valid).toBe(true);
    expect(criteria_validation.criteria_count).toBe(3);
    expect(criteria_validation.criteria[0].criterion_name).toBe(
      '顧客データ移行率100%'
    );
    expect(criteria_validation.criteria[1].criterion_name).toBe(
      '営業ツール導入完了'
    );
    expect(criteria_validation.criteria[2].criterion_name).toBe(
      'ユーザー習熟度確認'
    );

    // Step 3: 各フェーズの完了判定基準がシステムに正確に保存されていることを確認
    expect(criteria_validation.saved_at).toBeDefined();
    expect(criteria_validation.migration_plan_id).toBe(migration_plan_id);

    // Step 4: Phase1の予定完了日を過去の日付に設定し、遅延シナリオをシミュレート
    const delayed_phase_state = {
      migration_plan_id,
      phase_id: 'PHASE-1',
      planned_end_date: new Date('2024-07-31T23:59:59Z'),
      current_date: new Date('2024-08-15T00:00:00Z'),
      actual_completion_date: null,
      completion_rate: 85,
      status: 'in_progress',
    };

    const delay_detection = detectPhaseDelays({
      migration_plan_id,
      phase_states: [delayed_phase_state],
    });

    expect(delay_detection.delayed).toBe(true);
    expect(delay_detection.delayed_phases).toHaveLength(1);
    expect(delay_detection.delayed_phases[0].phase_id).toBe('PHASE-1');
    expect(delay_detection.delayed_phases[0].days_overdue).toBe(15);
    expect(delay_detection.delayed_phases[0].completion_rate).toBe(85);

    // Step 5: 遅延時の代替案機能をトリガーし、自動提案される代替案を確認
    const alternative_proposals = generateAlternativeProposals({
      migration_plan_id,
      delayed_phase_id: 'PHASE-1',
      completion_rate: 85,
      days_overdue: 15,
      downstream_dependencies: ['PHASE-2'],
    });

    expect(alternative_proposals.proposal_count).toBeGreaterThanOrEqual(1);
    expect(alternative_proposals.proposals).toBeDefined();
    expect(alternative_proposals.proposals.length).toBeGreaterThan(0);

    // Step 6: 提案された代替案が適切に表示され、内容が正確であることを検証
    const first_proposal = alternative_proposals.proposals[0];
    expect(first_proposal.proposal_id).toBeDefined();
    expect(first_proposal.alternative_type).toBeDefined();
    expect(
      [
        'accelerate_downstream',
        'parallel_execution',
        'resource_augmentation',
        'scope_reduction',
      ].includes(first_proposal.alternative_type)
    ).toBe(true);
    expect(first_proposal.impact_assessment).toBeDefined();
    expect(
      typeof first_proposal.impact_assessment.risk_level === 'string'
    ).toBe(true);
    expect(
      [
        'low',
        'medium',
        'high',
      ].includes(first_proposal.impact_assessment.risk_level)
    ).toBe(true);

    // Step 7: 代替案を選択し、移行計画が更新されることを確認
    const selected_proposal_id = first_proposal.proposal_id;
    const applied_alternative = selectAndApplyAlternative({
      migration_plan_id,
      proposal_id: selected_proposal_id,
      selected_by_user_id: 'USER-MGR-001',
    });

    expect(applied_alternative.success).toBe(true);
    expect(applied_alternative.applied_proposal_id).toBe(selected_proposal_id);
    expect(applied_alternative.plan_updated_at).toBeDefined();
    expect(
      new Date(applied_alternative.plan_updated_at).getTime()
    ).toBeGreaterThan(0);

    // Step 8: 更新後の計画でフェーズ間の依存関係が正しく調整されていることを確認
    const integrity_check_single = validatePlanIntegrity({
      migration_plan_id,
      phases: phases_created.phases,
    });

    expect(integrity_check_single.integrity_valid).toBe(true);
    expect(integrity_check_single.dependency_chain_valid).toBe(true);
    expect(integrity_check_single.issues).toHaveLength(0);

    // Step 9: 複数のフェーズで同時に遅延が発生した場合のシナリオをテスト
    const multi_delay_states = [
      {
        migration_plan_id,
        phase_id: 'PHASE-1',
        planned_end_date: new Date('2024-07-31T23:59:59Z'),
        current_date: new Date('2024-08-20T00:00:00Z'),
        actual_completion_date: null,
        completion_rate: 70,
        status: 'in_progress',
      },
      {
        migration_plan_id,
        phase_id: 'PHASE-2',
        planned_end_date: new Date('2024-09-30T23:59:59Z'),
        current_date: new Date('2024-08-20T00:00:00Z'),
        actual_completion_date: null,
        completion_rate: 30,
        status: 'blocked',
      },
    ];

    const multi_delay_detection = detectPhaseDelays({
      migration_plan_id,
      phase_states: multi_delay_states,
    });

    expect(multi_delay_detection.delayed).toBe(true);
    expect(multi_delay_detection.delayed_phases.length).toBeGreaterThanOrEqual(
      1
    );

    // Step 10: システムが優先度に基づいて適切な代替案を提示することを確認
    const priority_based_proposals = generateAlternativeProposals({
      migration_plan_id,
      delayed_phase_id: 'PHASE-1',
      completion_rate: 70,
      days_overdue: 20,
      downstream_dependencies: ['PHASE-2', 'PHASE-3'],
    });

    expect(priority_based_proposals.proposal_count).toBeGreaterThanOrEqual(1);
    expect(priority_based_proposals.proposals.length).toBeGreaterThan(0);

    const sorted_proposals = priority_based_proposals.proposals.sort(
      (a, b) => (b.priority_score || 0) - (a.priority_score || 0)
    );
    expect(sorted_proposals[0].priority_score).toBeGreaterThanOrEqual(
      sorted_proposals[sorted_proposals.length - 1].priority_score || 0
    );

    // Step 11: 最終的な計画整合性チェック（複数遅延シナリオ後）
    const final_integrity_check = validatePlanIntegrity({
      migration_plan_id,
      phases: phases_created.phases,
    });

    expect(final_integrity_check.integrity_valid).toBe(true);
    expect(final_integrity_check.dependency_chain_valid).toBe(true);
    expect(final_integrity_check.phase_sequence_valid).toBe(true);
  });
});