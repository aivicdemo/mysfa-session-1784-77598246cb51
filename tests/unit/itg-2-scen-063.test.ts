import { determineFlagForUnbilledDeal } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-063
  test('商談ステータスが受注でも請求書発行予定日が未設定の場合、未請求案件フラグが付与されない', () => {
    const dealData = {
      dealId: 'DEAL-001',
      dealStatus: '受注',
      invoiceIssuePlannedDate: null,
      invoiceIssuedDate: null,
    };

    const result = determineFlagForUnbilledDeal(dealData);

    expect(result.isUnbilledFlagSet).toBe(false);
    expect(result.flagReason).toBe('');
  });
});