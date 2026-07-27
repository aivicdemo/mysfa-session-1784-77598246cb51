import { fetchCustomerRecordWithDealHistory } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-477
  test('年度をまたぐ課題解決状況が含まれているとき、正しく時系列順で返される', () => {
    const customerId = 'CUST-12345';
    const issueId = 'ISSUE-2023-001';

    const dealHistoryFY2023 = {
      dealId: 'DEAL-2023-0001',
      dealName: 'システム導入プロジェクトA',
      createdDate: new Date('2023-04-15T09:30:00Z'),
      fiscalYear: 2023,
      status: 'unresolved',
      issueId: issueId,
      issueName: 'システム導入遅延',
      issueStatus: 'unresolved',
    };

    const dealHistoryFY2024 = {
      dealId: 'DEAL-2024-0001',
      dealName: 'システム導入プロジェクトB',
      createdDate: new Date('2024-05-20T14:15:00Z'),
      fiscalYear: 2024,
      status: 'resolved',
      issueId: issueId,
      issueName: 'システム導入遅延',
      issueStatus: 'resolved',
    };

    const result = fetchCustomerRecordWithDealHistory(customerId, [
      dealHistoryFY2023,
      dealHistoryFY2024,
    ]);

    expect(result).toBeDefined();
    expect(result.customerId).toBe(customerId);
    expect(result.dealHistories).toHaveLength(2);

    const dealHistories = result.dealHistories;

    expect(dealHistories[0].dealId).toBe('DEAL-2023-0001');
    expect(dealHistories[0].createdDate).toEqual(new Date('2023-04-15T09:30:00Z'));
    expect(dealHistories[0].fiscalYear).toBe(2023);
    expect(dealHistories[0].status).toBe('unresolved');
    expect(dealHistories[0].issueId).toBe(issueId);
    expect(dealHistories[0].issueName).toBe('システム導入遅延');
    expect(dealHistories[0].issueStatus).toBe('unresolved');

    expect(dealHistories[1].dealId).toBe('DEAL-2024-0001');
    expect(dealHistories[1].createdDate).toEqual(new Date('2024-05-20T14:15:00Z'));
    expect(dealHistories[1].fiscalYear).toBe(2024);
    expect(dealHistories[1].status).toBe('resolved');
    expect(dealHistories[1].issueId).toBe(issueId);
    expect(dealHistories[1].issueName).toBe('システム導入遅延');
    expect(dealHistories[1].issueStatus).toBe('resolved');

    expect(dealHistories[0].createdDate.getTime()).toBeLessThan(
      dealHistories[1].createdDate.getTime()
    );

    const issueProgression = result.dealHistories
      .filter((deal) => deal.issueId === issueId)
      .map((deal) => deal.issueStatus);

    expect(issueProgression).toEqual(['unresolved', 'resolved']);
  });
});