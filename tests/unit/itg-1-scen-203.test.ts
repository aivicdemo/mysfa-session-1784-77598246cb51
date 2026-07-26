import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { searchCustomersByPermission } from '../../src/logic/it-1';

const fetchMock = require('jest-fetch-mock');

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-203: [edge] 顧客検索時の権限ベースフィルタリング機能 - 担当営業が0件の場合に空の配列が返される
  it('should return empty array when logged-in user has no assigned customers', async () => {
    const user_id = 'user_001';
    const user_role = 'sales';
    const search_query = '';

    const mock_api_response = {
      customers: [],
      message: '該当する顧客がありません',
      total_count: 0,
    };

    fetchMock.mockResponseOnce(JSON.stringify(mock_api_response), {
      status: 200,
    });

    const result = await searchCustomersByPermission(
      user_id,
      user_role,
      search_query
    );

    expect(result).toEqual({
      customers: [],
      message: '該当する顧客がありません',
      total_count: 0,
    });
    expect(result.customers).toHaveLength(0);
    expect(result.total_count).toBe(0);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call_args = fetchMock.mock.calls[0];
    expect(call_args[0]).toContain('user_id=user_001');
    expect(call_args[0]).toContain('role=sales');
  });
});