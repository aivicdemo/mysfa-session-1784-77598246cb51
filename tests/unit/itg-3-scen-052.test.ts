import { evaluateMigrationReadiness } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforceライセンス利用状況の可視化機能（ユーザー数・エディション・年間費用・機能利用率の一覧表示・分析）', () => {
  // SCEN-052
  test('導入研修・運用マニュアル整備完了判定機能 - 研修実施率が基準値と等値のとき、移行準備完了と判定される', () => {
    // Arrange
    const trainingCompletionThreshold = 80;
    const actualTrainingCompletionRate = 80;
    const manualComprehensionRate = 85;
    const systemOperationProficiencyRate = 88;

    const migrationReadinessInput = {
      trainingCompletionThreshold,
      actualTrainingCompletionRate,
      manualComprehensionRate,
      systemOperationProficiencyRate,
    };

    // Act
    const result = evaluateMigrationReadiness(migrationReadinessInput);

    // Assert
    expect(result).toEqual({
      isMigrationReady: true,
      status: '移行準備完了',
      trainingCompletionRate: 80,
      manualComprehensionRate: 85,
      systemOperationProficiencyRate: 88,
      dashboardStatusUpdate: {
        previousStatus: '導入研修進行中',
        currentStatus: '移行準備完了',
        updatedAt: expect.any(String),
      },
    });

    expect(result.isMigrationReady).toBe(true);
    expect(result.status).toBe('移行準備完了');
    expect(result.trainingCompletionRate).toBe(80);
    expect(result.dashboardStatusUpdate.currentStatus).toBe('移行準備完了');
  });

  test('導入研修・運用マニュアル整備完了判定機能 - 研修実施率が基準値を上回るとき、移行準備完了と判定される', () => {
    // Arrange
    const trainingCompletionThreshold = 80;
    const actualTrainingCompletionRate = 95;
    const manualComprehensionRate = 90;
    const systemOperationProficiencyRate = 92;

    const migrationReadinessInput = {
      trainingCompletionThreshold,
      actualTrainingCompletionRate,
      manualComprehensionRate,
      systemOperationProficiencyRate,
    };

    // Act
    const result = evaluateMigrationReadiness(migrationReadinessInput);

    // Assert
    expect(result.isMigrationReady).toBe(true);
    expect(result.status).toBe('移行準備完了');
    expect(result.trainingCompletionRate).toBe(95);
  });

  test('導入研修・運用マニュアル整備完了判定機能 - 研修実施率が基準値を下回るとき、移行準備未完了と判定される', () => {
    // Arrange
    const trainingCompletionThreshold = 80;
    const actualTrainingCompletionRate = 75;
    const manualComprehensionRate = 78;
    const systemOperationProficiencyRate = 76;

    const migrationReadinessInput = {
      trainingCompletionThreshold,
      actualTrainingCompletionRate,
      manualComprehensionRate,
      systemOperationProficiencyRate,
    };

    // Act
    const result = evaluateMigrationReadiness(migrationReadinessInput);

    // Assert
    expect(result.isMigrationReady).toBe(false);
    expect(result.status).toBe('移行準備未完了');
    expect(result.trainingCompletionRate).toBe(75);
    expect(result.dashboardStatusUpdate.currentStatus).toBe('導入研修進行中');
  });

  test('導入研修・運用マニュアル整備完了判定機能 - 研修実施率が0%のとき、エラーが発生する', () => {
    // Arrange
    const migrationReadinessInput = {
      trainingCompletionThreshold: 80,
      actualTrainingCompletionRate: 0,
      manualComprehensionRate: 50,
      systemOperationProficiencyRate: 50,
    };

    // Act & Assert
    expect(() => evaluateMigrationReadiness(migrationReadinessInput)).toThrow(/研修実施率/);
  });

  test('導入研修・運用マニュアル整備完了判定機能 - 研修実施率が100%を超えるとき、エラーが発生する', () => {
    // Arrange
    const migrationReadinessInput = {
      trainingCompletionThreshold: 80,
      actualTrainingCompletionRate: 105,
      manualComprehensionRate: 100,
      systemOperationProficiencyRate: 100,
    };

    // Act & Assert
    expect(() => evaluateMigrationReadiness(migrationReadinessInput)).toThrow(/研修実施率/);
  });

  test('導入研修・運用マニュアル整備完了判定機能 - 基準値が負の値のとき、エラーが発生する', () => {
    // Arrange
    const migrationReadinessInput = {
      trainingCompletionThreshold: -10,
      actualTrainingCompletionRate: 80,
      manualComprehensionRate: 85,
      systemOperationProficiencyRate: 88,
    };

    // Act & Assert
    expect(() => evaluateMigrationReadiness(migrationReadinessInput)).toThrow(/基準値/);
  });
});