import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createDeal,
  updateDealStatus,
  checkCustomerPortalAccess,
  getAccessLog
} from '../../src/logic/it-1784969823049-2-1-1';

describe('顧客ポータルアクセス権限自動付与機能', () => {
  let testCustomerId: string;
  let testDealId: string;

  beforeEach(() => {
    testCustomerId = `CUST_TEST_${Date.now()}`;
    testDealId = `DEAL_TEST_${Date.now()}`;
  });

  afterEach(() => {
    // テストデータクリーンアップ
    testCustomerId = '';
    testDealId = '';
  });

  // SCEN-270
  test('新規商談作成時は権限付与対象外で、ステータス更新時にのみ権限が付与される', () => {
    // 1. テスト用の新規顧客データを作成する
    const customerData = {
      customerId: testCustomerId,
      customerName: 'Test Customer Corp',
      industryType: 'Manufacturing'
    };

    // 2. 新規商談を作成し、初期ステータスを「提案前」に設定する
    const dealCreateInput = {
      dealId: testDealId,
      customerId: testCustomerId,
      dealTitle: 'Test Deal',
      initialStatus: 'PROPOSAL_BEFORE',
      amount: 500000,
      createdAt: new Date('2024-04-15T09:00:00Z')
    };

    const createDealResult = createDeal(dealCreateInput);
    expect(createDealResult).toEqual({
      dealId: testDealId,
      customerId: testCustomerId,
      dealTitle: 'Test Deal',
      status: 'PROPOSAL_BEFORE',
      amount: 500000,
      permissionGranted: false,
      createdAt: new Date('2024-04-15T09:00:00Z').toISOString()
    });

    // 3. 顧客ポータルアクセス権限が付与されていないことを確認する
    const accessCheckAfterCreate = checkCustomerPortalAccess({
      customerId: testCustomerId,
      dealId: testDealId
    });
    expect(accessCheckAfterCreate).toEqual({
      hasAccess: false,
      reason: 'DEAL_NOT_IN_PROPOSAL_STATUS'
    });

    // 4. 商談のステータスを「提案中」に更新する
    const statusUpdateInput = {
      dealId: testDealId,
      customerId: testCustomerId,
      newStatus: 'PROPOSAL_IN_PROGRESS',
      updatedAt: new Date('2024-04-16T10:30:00Z'),
      updatedBy: 'SALES_USER_001'
    };

    const updateResult = updateDealStatus(statusUpdateInput);
    expect(updateResult).toEqual({
      dealId: testDealId,
      customerId: testCustomerId,
      previousStatus: 'PROPOSAL_BEFORE',
      newStatus: 'PROPOSAL_IN_PROGRESS',
      permissionGranted: true,
      grantedAt: new Date('2024-04-16T10:30:00Z').toISOString()
    });

    // 5. 顧客ポータルアクセス権限が付与されたことを確認する
    const accessCheckAfterUpdate = checkCustomerPortalAccess({
      customerId: testCustomerId,
      dealId: testDealId
    });
    expect(accessCheckAfterUpdate).toEqual({
      hasAccess: true,
      reason: 'PERMISSION_GRANTED_ON_STATUS_UPDATE'
    });

    // 6. 権限付与ログに適切なレコードが記録されていることを検証する
    const accessLog = getAccessLog({
      dealId: testDealId,
      customerId: testCustomerId,
      logType: 'PERMISSION_GRANT'
    });

    expect(accessLog).toEqual({
      recordCount: 1,
      logs: [
        {
          logId: expect.any(String),
          dealId: testDealId,
          customerId: testCustomerId,
          logType: 'PERMISSION_GRANT',
          grantedStatus: 'PROPOSAL_IN_PROGRESS',
          grantedAt: new Date('2024-04-16T10:30:00Z').toISOString(),
          grantedBy: 'SALES_USER_001'
        }
      ]
    });

    // 期待結果: 新規商談作成時点では顧客ポータルアクセス権限は付与されず、
    // 商談ステータスが「提案中」以降に更新された時点で初めて権限が自動付与される
    expect(createDealResult.permissionGranted).toBe(false);
    expect(updateResult.permissionGranted).toBe(true);
    expect(accessLog.recordCount).toBe(1);
    expect(accessLog.logs[0].grantedStatus).toBe('PROPOSAL_IN_PROGRESS');
  });
});