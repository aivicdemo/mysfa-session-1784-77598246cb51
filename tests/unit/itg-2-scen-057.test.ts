import { detectDealStatusBillingMismatch } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-057
  test('[normal] ステータス・請求ズレ検出機能 - 商談ステータスが受注で請求書発行予定日が設定されている場合、ズレ有無が判定される', () => {
    // 前提: 商談ステータスが「受注」に更新され、請求書発行予定日が設定されている状態
    // 発生条件: 月次営業成績集計処理で、商談レコードと請求書発行履歴を照合したとき
    // 結果: 未請求案件または請求遅延案件に自動フラグを付与し、経営層が即座に特定・対応できる

    // ケース 1: 商談ステータスが「受注」で、請求書未発行（ズレあり）
    const dealDataWithoutBilling = {
      dealId: 'DEAL-001',
      status: '受注',
      amount: 150000,
      billingScheduledDate: '2024-02-15',
      billingIssuedDate: null,
      customerName: 'テスト顧客A',
    };

    const resultWithMismatch = detectDealStatusBillingMismatch(dealDataWithoutBilling);
    expect(resultWithMismatch).toEqual({
      hasMismatch: true,
      dealId: 'DEAL-001',
      status: '受注',
      mismatchType: '未請求',
      message: 'ズレあり',
      requiresNotification: true,
    });

    // ケース 2: 商談ステータスが「受注」で、請求書が予定日より遅延（ズレあり）
    const dealDataWithDelayedBilling = {
      dealId: 'DEAL-002',
      status: '受注',
      amount: 200000,
      billingScheduledDate: '2024-02-15',
      billingIssuedDate: '2024-03-10',
      customerName: 'テスト顧客B',
    };

    const resultWithDelayedMismatch = detectDealStatusBillingMismatch(dealDataWithDelayedBilling);
    expect(resultWithDelayedMismatch).toEqual({
      hasMismatch: true,
      dealId: 'DEAL-002',
      status: '受注',
      mismatchType: '遅延',
      message: 'ズレあり',
      requiresNotification: true,
    });

    // ケース 3: 商談ステータスが「受注」で、請求書が予定日以内に発行済み（ズレなし）
    const dealDataWithOnTimeBilling = {
      dealId: 'DEAL-003',
      status: '受注',
      amount: 100000,
      billingScheduledDate: '2024-02-15',
      billingIssuedDate: '2024-02-14',
      customerName: 'テスト顧客C',
    };

    const resultWithoutMismatch = detectDealStatusBillingMismatch(dealDataWithOnTimeBilling);
    expect(resultWithoutMismatch).toEqual({
      hasMismatch: false,
      dealId: 'DEAL-003',
      status: '受注',
      mismatchType: null,
      message: 'ズレなし',
      requiresNotification: false,
    });

    // ケース 4: 商談ステータスが「受注」で、請求書が予定日ちょうどに発行済み（ズレなし）
    const dealDataWithExactBilling = {
      dealId: 'DEAL-004',
      status: '受注',
      amount: 175000,
      billingScheduledDate: '2024-02-15',
      billingIssuedDate: '2024-02-15',
      customerName: 'テスト顧客D',
    };

    const resultWithExactMatch = detectDealStatusBillingMismatch(dealDataWithExactBilling);
    expect(resultWithExactMatch).toEqual({
      hasMismatch: false,
      dealId: 'DEAL-004',
      status: '受注',
      mismatchType: null,
      message: 'ズレなし',
      requiresNotification: false,
    });

    // ケース 5: 商談ステータスが「受注」で、請求書発行予定日が過去で未発行（ズレあり）
    const dealDataWithOverdueBilling = {
      dealId: 'DEAL-005',
      status: '受注',
      amount: 120000,
      billingScheduledDate: '2024-01-31',
      billingIssuedDate: null,
      customerName: 'テスト顧客E',
    };

    const resultWithOverdueMismatch = detectDealStatusBillingMismatch(dealDataWithOverdueBilling);
    expect(resultWithOverdueMismatch).toEqual({
      hasMismatch: true,
      dealId: 'DEAL-005',
      status: '受注',
      mismatchType: '未請求',
      message: 'ズレあり',
      requiresNotification: true,
    });
  });
});