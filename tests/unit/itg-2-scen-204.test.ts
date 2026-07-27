import { queryAuditLog } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理 - 監査ログスキーマ検証', () => {
  // SCEN-204: [edge] AWS CloudTrail / CloudWatch Logs連携 - queryAuditLogの応答形式が想定と異なる場合、不正な監査ログ検索結果が業務結果として通されない
  test('queryAuditLogからの応答スキーマが契約仕様と異なる場合、システムはエラーを検出し不正データを画面に通さない', () => {
    // スタブ: AuditLogExporter.queryAuditLog の不正な応答形式パターン
    const malformedResponses = [
      // (a) 期待フィールド『userId』が存在しない
      {
        name: 'missing_user_id_field',
        response: [
          {
            timestamp: '2024-01-15T11:00:00Z',
            operationType: 'ACCESS_PORTAL',
            resourceId: 'deal-12345',
            result: 'SUCCESS'
          }
        ]
      },
      // (b) 『timestamp』が文字列ではなく数値型
      {
        name: 'timestamp_number_type',
        response: [
          {
            userId: 'user-001',
            timestamp: 1705316400000,
            operationType: 'ACCESS_PORTAL',
            resourceId: 'deal-12345',
            result: 'SUCCESS'
          }
        ]
      },
      // (c) 『operationType』が配列で返される
      {
        name: 'operation_type_array',
        response: [
          {
            userId: 'user-001',
            timestamp: '2024-01-15T11:00:00Z',
            operationType: ['ACCESS_PORTAL', 'DATA_DOWNLOAD'],
            resourceId: 'deal-12345',
            result: 'SUCCESS'
          }
        ]
      },
      // (d) 応答全体が配列ではなくオブジェクト
      {
        name: 'response_not_array',
        response: {
          userId: 'user-001',
          timestamp: '2024-01-15T11:00:00Z',
          operationType: 'ACCESS_PORTAL',
          resourceId: 'deal-12345',
          result: 'SUCCESS'
        }
      }
    ];

    // 検索条件
    const searchCriteria = {
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      userId: 'user-001',
      operationType: 'ACCESS_PORTAL'
    };

    // 各不正応答形式に対してテスト
    malformedResponses.forEach((testCase) => {
      const mockAuditLogExporter = {
        queryAuditLog: jest.fn().mockResolvedValue(testCase.response)
      };

      // queryAuditLogを呼び出し
      return queryAuditLog(
        searchCriteria.startDate,
        searchCriteria.endDate,
        searchCriteria.userId,
        searchCriteria.operationType,
        mockAuditLogExporter
      ).then((result) => {
        // スキーマ検証に失敗した場合、結果は以下のいずれかであること
        // 1. 結果が空配列である（不正データを画面に通さない）
        // 2. エラーオブジェクトが返される
        // 3. nullが返される
        expect(
          result === null ||
          (Array.isArray(result) && result.length === 0) ||
          (result && result.error !== undefined)
        ).toBe(true);
      }).catch((error) => {
        // スキーマ検証エラーが例外として発生
        expect(error.message).toMatch(/スキーマ|応答形式|監査ログ/);
      });
    });

    // 契約仕様に合致した正常応答の場合、正常に処理される
    const validAuditLogExporter = {
      queryAuditLog: jest.fn().mockResolvedValue([
        {
          userId: 'user-001',
          timestamp: '2024-01-15T11:00:00Z',
          operationType: 'ACCESS_PORTAL',
          resourceId: 'deal-12345',
          result: 'SUCCESS'
        },
        {
          userId: 'user-001',
          timestamp: '2024-01-15T11:05:00Z',
          operationType: 'DATA_DOWNLOAD',
          resourceId: 'quote-67890',
          result: 'SUCCESS'
        }
      ])
    };

    return queryAuditLog(
      searchCriteria.startDate,
      searchCriteria.endDate,
      searchCriteria.userId,
      searchCriteria.operationType,
      validAuditLogExporter
    ).then((result) => {
      // 正常応答の場合、配列が返される
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);

      // 各監査ログレコードが必須フィールドを持つ
      result.forEach((log) => {
        expect(log).toHaveProperty('userId');
        expect(log).toHaveProperty('timestamp');
        expect(log).toHaveProperty('operationType');
        expect(log).toHaveProperty('resourceId');
        expect(log).toHaveProperty('result');

        // フィールドの型が正しい
        expect(typeof log.userId).toBe('string');
        expect(typeof log.timestamp).toBe('string');
        expect(typeof log.operationType).toBe('string');
        expect(typeof log.resourceId).toBe('string');
        expect(typeof log.result).toBe('string');
      });
    });
  });
});