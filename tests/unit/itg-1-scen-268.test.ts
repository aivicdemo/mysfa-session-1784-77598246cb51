import { grantCustomerPortalAccess } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-268: [error] 顧客ポータルアクセス権限自動付与機能 - 商談ステータスが『受注』以外のステータスに更新された場合、ポータルアクセス権限は付与されない
  test('商談ステータスが受注以外の場合、顧客ポータルアクセス権限は付与されない', () => {
    const dealRecordEstimating = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealStatus: '見積作成中',
      dealAmount: 150000,
      dealTitle: 'ソフトウェア導入提案',
      createdAt: '2024-01-15T10:00:00Z',
    };

    const resultEstimating = grantCustomerPortalAccess(dealRecordEstimating);
    expect(resultEstimating.accessPermissionStatus).toBe('未付与');

    const dealRecordProposing = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealStatus: '提案中',
      dealAmount: 150000,
      dealTitle: 'ソフトウェア導入提案',
      createdAt: '2024-01-15T10:00:00Z',
    };

    const resultProposing = grantCustomerPortalAccess(dealRecordProposing);
    expect(resultProposing.accessPermissionStatus).toBe('未付与');

    const dealRecordOnHold = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealStatus: '保留中',
      dealAmount: 150000,
      dealTitle: 'ソフトウェア導入提案',
      createdAt: '2024-01-15T10:00:00Z',
    };

    const resultOnHold = grantCustomerPortalAccess(dealRecordOnHold);
    expect(resultOnHold.accessPermissionStatus).toBe('未付与');

    const dealRecordLost = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealStatus: '失注',
      dealAmount: 150000,
      dealTitle: 'ソフトウェア導入提案',
      createdAt: '2024-01-15T10:00:00Z',
    };

    const resultLost = grantCustomerPortalAccess(dealRecordLost);
    expect(resultLost.accessPermissionStatus).toBe('未付与');
  });
});