import { evaluateMigrationReadiness } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforceライセンス利用状況の可視化機能 - 導入研修・運用マニュアル整備完了判定', () => {
  test('SCEN-050: 研修実施率のみが基準未満のとき、移行準備不完了と判定される', () => {
    const migrationReadinessInput = {
      trainingExecutionRate: 50,
      operationManualCompletionRate: 100,
      systemOperationProficiencyRate: 85,
      dataValidationCompletionRate: 95,
      stakeholderApprovalRate: 100,
    };

    const trainingThreshold = 80;
    const manualThreshold = 80;
    const proficiencyThreshold = 80;
    const dataValidationThreshold = 80;
    const approvalThreshold = 80;

    const result = evaluateMigrationReadiness(
      migrationReadinessInput,
      {
        trainingThreshold,
        manualThreshold,
        proficiencyThreshold,
        dataValidationThreshold,
        approvalThreshold,
      }
    );

    expect(result.isReadinessComplete).toBe(false);
    expect(result.readinessStatus).toBe('不完了');
    expect(result.unmetItems).toEqual(['研修実施率']);
    expect(result.details).toEqual({
      trainingExecutionRate: {
        value: 50,
        threshold: 80,
        isMet: false,
      },
      operationManualCompletionRate: {
        value: 100,
        threshold: 80,
        isMet: true,
      },
      systemOperationProficiencyRate: {
        value: 85,
        threshold: 80,
        isMet: true,
      },
      dataValidationCompletionRate: {
        value: 95,
        threshold: 80,
        isMet: true,
      },
      stakeholderApprovalRate: {
        value: 100,
        threshold: 80,
        isMet: true,
      },
    });
  });
});