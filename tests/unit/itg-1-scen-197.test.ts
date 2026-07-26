import { getCachedCustomerData } from '../../src/logic/it-1';

describe('顧客レコード画面のキャッシュ有効期限管理機能', () => {
  // SCEN-197: [normal] キャッシュ有効期限管理機能 - キャッシュ有効期限を超過した場合、自動的にデータベースから最新データが再取得される
  test('キャッシュ有効期限を超過後、最新データがデータベースから再取得される', async () => {
    const customerId = 'cust_001';
    const cacheValidityMs = 60000; // キャッシュ有効期限: 60秒
    const currentTime = new Date('2024-04-15T10:00:00Z');
    const expiredTime = new Date('2024-04-15T10:01:30Z'); // 90秒後（有効期限超過）

    // 初回取得時のデータベースレスポンス
    const initialDbData = {
      customerId: 'cust_001',
      customerName: '太郎商事',
      industry: '製造業',
      region: '東京',
      lastUpdated: '2024-04-15T10:00:00Z',
      deals: [
        {
          dealId: 'deal_001',
          dealName: '提案A',
          status: '初期接触',
          amount: 500000,
          createdAt: '2024-04-10T09:00:00Z',
        },
      ],
      activities: [
        {
          activityId: 'act_001',
          activityType: 'email',
          activityDate: '2024-04-14T14:30:00Z',
          description: '初回提案メール送信',
        },
      ],
      issues: [
        {
          issueId: 'issue_001',
          issueTitle: '予算承認待ち',
          status: '進行中',
          createdAt: '2024-04-12T11:00:00Z',
        },
      ],
    };

    // キャッシュ有効期限超過後のデータベースレスポンス（最新データ）
    const updatedDbData = {
      customerId: 'cust_001',
      customerName: '太郎商事',
      industry: '製造業',
      region: '東京',
      lastUpdated: '2024-04-15T10:01:20Z',
      deals: [
        {
          dealId: 'deal_001',
          dealName: '提案A',
          status: '提案中',
          amount: 500000,
          createdAt: '2024-04-10T09:00:00Z',
        },
        {
          dealId: 'deal_002',
          dealName: '提案B',
          status: '初期接触',
          amount: 300000,
          createdAt: '2024-04-15T09:30:00Z',
        },
      ],
      activities: [
        {
          activityId: 'act_001',
          activityType: 'email',
          activityDate: '2024-04-14T14:30:00Z',
          description: '初回提案メール送信',
        },
        {
          activityId: 'act_002',
          activityType: 'phone',
          activityDate: '2024-04-15T10:00:00Z',
          description: '進捗確認電話',
        },
      ],
      issues: [
        {
          issueId: 'issue_001',
          issueTitle: '予算承認待ち',
          status: '解決済み',
          resolvedAt: '2024-04-15T10:00:00Z',
          createdAt: '2024-04-12T11:00:00Z',
        },
      ],
    };

    // 初回取得（キャッシュに保存）
    const firstResult = await getCachedCustomerData({
      customerId,
      currentTime,
      cacheValidityMs,
    });

    expect(firstResult.data).toEqual(initialDbData);
    expect(firstResult.source).toBe('database');
    expect(firstResult.cachedAt).toBe('2024-04-15T10:00:00Z');
    expect(firstResult.isFromCache).toBe(false);

    // キャッシュ有効期限内での2回目取得（キャッシュから返却）
    const secondResultInValidity = await getCachedCustomerData({
      customerId,
      currentTime: new Date('2024-04-15T10:00:30Z'), // 30秒後
      cacheValidityMs,
    });

    expect(secondResultInValidity.data).toEqual(initialDbData);
    expect(secondResultInValidity.source).toBe('cache');
    expect(secondResultInValidity.cachedAt).toBe('2024-04-15T10:00:00Z');
    expect(secondResultInValidity.isFromCache).toBe(true);

    // キャッシュ有効期限超過後の3回目取得（データベースから再取得）
    const thirdResultExpired = await getCachedCustomerData({
      customerId,
      currentTime: expiredTime,
      cacheValidityMs,
    });

    expect(thirdResultExpired.data).toEqual(updatedDbData);
    expect(thirdResultExpired.source).toBe('database');
    expect(thirdResultExpired.cachedAt).toBe('2024-04-15T10:01:30Z');
    expect(thirdResultExpired.isFromCache).toBe(false);

    // キャッシュ再取得後、更新されたキャッシュから4回目取得
    const fourthResultCachedAgain = await getCachedCustomerData({
      customerId,
      currentTime: new Date('2024-04-15T10:01:35Z'), // 再取得から5秒後
      cacheValidityMs,
    });

    expect(fourthResultCachedAgain.data).toEqual(updatedDbData);
    expect(fourthResultCachedAgain.source).toBe('cache');
    expect(fourthResultCachedAgain.cachedAt).toBe('2024-04-15T10:01:30Z');
    expect(fourthResultCachedAgain.isFromCache).toBe(true);
  });
});