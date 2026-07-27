import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateMonthlyDecisionReport } from '../../src/logic/it-1-3';

const fetchMock = require('jest-fetch-mock');

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  it('SCEN-334: 対象期間開始日時が空（null）のとき、エラーが発生する', async () => {
    // Arrange: 月次決算レポート生成の入力パラメータを構築
    // 対象期間開始日時をnullで設定、終了日時には有効な日時を設定
    const reportGenerationInput = {
      period_start_datetime: null,
      period_end_datetime: new Date('2024-01-31T23:59:59Z'),
      organization_id: 'org_001',
      user_id: 'user_001'
    };

    // Mock APIレスポンス: バリデーションエラー
    const assumedErrorResponse = {
      status_code: 400,
      error_message: '対象期間開始日時は必須項目です',
      error_code: 'PERIOD_START_REQUIRED'
    };

    fetchMock.mockResponseOnce(
      JSON.stringify(assumedErrorResponse),
      { status: 400 }
    );

    // Act & Assert: 月次決算レポート生成関数を呼び出す
    // エラーが発生することを期待
    await expect(() =>
      generateMonthlyDecisionReport(reportGenerationInput)
    ).rejects.toThrow(/開始日時/);
  });
});