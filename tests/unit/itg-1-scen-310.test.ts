import { validateMigrationDataConsistency } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-310
  test('移行後データ一貫性検証機能 - 検証対象データが空の場合、適切なエラーメッセージが返される', () => {
    const empty_data = [];
    const error_message = '検証対象データが指定されていません';

    expect(() => validateMigrationDataConsistency(empty_data)).toThrow(
      /検証対象データ/
    );

    try {
      validateMigrationDataConsistency(empty_data);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toContain(error_message);
    }
  });
});