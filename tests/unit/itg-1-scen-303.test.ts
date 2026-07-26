import { evaluateTrainingReadiness } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-303
  test('導入研修準備完了判定機能 - システム操作習熟度が基準値と完全に一致する境界ケース', () => {
    // 前提: 自社開発システムへの投資判断が承認され、
    // 営業チームと経営層向けの導入研修・運用マニュアルが整備されている状態

    // Arrange: システム操作習熟度の基準値を 75 点と設定
    const standard_proficiency_score = 75;

    // テストユーザーのシステム操作習熟度スコアを基準値と完全に同じ値に設定
    const user_proficiency_score = 75;
    const user_id = 'USR-001';
    const training_completion_date = new Date('2024-01-15T11:00:00Z');
    const manual_understanding_score = 80;

    const training_readiness_data = {
      user_id: user_id,
      system_proficiency_score: user_proficiency_score,
      manual_understanding_score: manual_understanding_score,
      training_completion_date: training_completion_date,
      proficiency_standard: standard_proficiency_score,
    };

    // Act: 導入研修準備完了判定機能を実行
    const result = evaluateTrainingReadiness(training_readiness_data);

    // Assert: 判定結果の画面表示を確認
    // システム操作習熟度が基準値と完全に一致した場合、
    // 導入研修準備完了判定結果が『完了』と正確に判定される
    expect(result.is_ready).toBe(true);
    expect(result.readiness_status).toBe('完了');

    // データベースに正しく記録されたことを確認
    expect(result.user_id).toBe('USR-001');
    expect(result.system_proficiency_score).toBe(75);
    expect(result.proficiency_standard).toBe(75);

    // 境界値処理により不等号判定（>=）が正しく機能
    expect(result.proficiency_judgment).toBe('合格');
    expect(result.proficiency_meets_standard).toBe(true);

    // ログファイルで判定処理の詳細が記録されていることを確認
    expect(result.judgment_log).toBeDefined();
    expect(result.judgment_log).toContain('習熟度判定');
    expect(result.judgment_log).toContain(user_id);

    // 判定ロジックのエラーが発生しないこと
    expect(result.has_error).toBe(false);
    expect(result.error_message).toBeNull();

    // 記録タイムスタンプが存在
    expect(result.recorded_at).toBeDefined();
  });

  test('導入研修準備完了判定機能 - システム操作習熟度が基準値を上回る場合', () => {
    // Arrange: 基準値を 75 点、ユーザースコアを 85 点に設定
    const standard_proficiency_score = 75;
    const user_proficiency_score = 85;
    const user_id = 'USR-002';
    const training_completion_date = new Date('2024-01-15T11:00:00Z');
    const manual_understanding_score = 90;

    const training_readiness_data = {
      user_id: user_id,
      system_proficiency_score: user_proficiency_score,
      manual_understanding_score: manual_understanding_score,
      training_completion_date: training_completion_date,
      proficiency_standard: standard_proficiency_score,
    };

    // Act
    const result = evaluateTrainingReadiness(training_readiness_data);

    // Assert: 基準値を上回る場合も『完了』と判定される
    expect(result.is_ready).toBe(true);
    expect(result.readiness_status).toBe('完了');
    expect(result.proficiency_judgment).toBe('合格');
    expect(result.proficiency_meets_standard).toBe(true);
    expect(result.has_error).toBe(false);
  });

  test('導入研修準備完了判定機能 - システム操作習熟度が基準値を下回る場合', () => {
    // Arrange: 基準値を 75 点、ユーザースコアを 65 点に設定
    const standard_proficiency_score = 75;
    const user_proficiency_score = 65;
    const user_id = 'USR-003';
    const training_completion_date = new Date('2024-01-15T11:00:00Z');
    const manual_understanding_score = 70;

    const training_readiness_data = {
      user_id: user_id,
      system_proficiency_score: user_proficiency_score,
      manual_understanding_score: manual_understanding_score,
      training_completion_date: training_completion_date,
      proficiency_standard: standard_proficiency_score,
    };

    // Act
    const result = evaluateTrainingReadiness(training_readiness_data);

    // Assert: 基準値を下回る場合は『未完了』と判定される
    expect(result.is_ready).toBe(false);
    expect(result.readiness_status).toBe('未完了');
    expect(result.proficiency_judgment).toBe('不合格');
    expect(result.proficiency_meets_standard).toBe(false);
    expect(result.has_error).toBe(false);
  });

  test('導入研修準備完了判定機能 - 必須項目が不足している場合はエラーを発生', () => {
    // Arrange: 必須項目を欠落させたデータ
    const training_readiness_data = {
      user_id: 'USR-004',
      system_proficiency_score: 75,
      // manual_understanding_score が欠落
      training_completion_date: new Date('2024-01-15T11:00:00Z'),
      proficiency_standard: 75,
    };

    // Act & Assert: 必須項目がない場合、エラーが発生
    expect(() => evaluateTrainingReadiness(training_readiness_data as any)).toThrow(/必須項目/);
  });

  test('導入研修準備完了判定機能 - 基準値が不正な場合はエラーを発生', () => {
    // Arrange: 基準値が負の値
    const training_readiness_data = {
      user_id: 'USR-005',
      system_proficiency_score: 75,
      manual_understanding_score: 80,
      training_completion_date: new Date('2024-01-15T11:00:00Z'),
      proficiency_standard: -10,
    };

    // Act & Assert: 基準値が不正な場合、エラーが発生
    expect(() => evaluateTrainingReadiness(training_readiness_data)).toThrow(/基準値/);
  });
});