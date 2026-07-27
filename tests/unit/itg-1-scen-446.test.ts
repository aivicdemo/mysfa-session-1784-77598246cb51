import { fetchCustomerRecordWithIssueResolutions } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示 - 課題解決状況', () => {
  // SCEN-446
  test('課題解決状況が1件の顧客レコードを表示するとき、その1件が返される', () => {
    const customer_id = 'CUST-001';
    const issue_id = 'ISS-001';
    const resolved_at = new Date('2024-04-15T14:30:00Z');
    const updated_at = new Date('2024-04-15T14:30:00Z');

    const mock_issue_resolution = {
      issue_resolution_id: 'ISSR-001',
      issue_id: issue_id,
      customer_id: customer_id,
      issue_title: 'システム導入時の権限設定に関する問題',
      resolution_status: 'resolved',
      resolution_details: 'ユーザー権限の再設定を完了し、アクセス制限を解除しました',
      resolved_at: resolved_at,
      updated_at: updated_at,
    };

    const mock_data_source = {
      fetchIssueResolutions: jest.fn().mockResolvedValue([mock_issue_resolution]),
    };

    return fetchCustomerRecordWithIssueResolutions(customer_id, mock_data_source).then(
      (result) => {
        expect(mock_data_source.fetchIssueResolutions).toHaveBeenCalledWith(customer_id);
        expect(result.issue_resolutions).toHaveLength(1);
        expect(result.issue_resolutions[0]).toEqual(mock_issue_resolution);
        expect(result.issue_resolutions[0].issue_id).toBe(issue_id);
        expect(result.issue_resolutions[0].resolution_status).toBe('resolved');
      }
    );
  });
});