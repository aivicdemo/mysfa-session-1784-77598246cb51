import { updateDealStatusToContract } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-240
  test('商談ステータス更新・請求データ紐付け機能 - 商談ステータスを成約に変更する際、営業担当者が正しく記録される', () => {
    const salesUserId = 'sales_user_001';
    const salesUserName = '田中太郎';
    const dealId = 'DEAL-2024-001';
    const customerName = '株式会社ABC';
    const currentStatus = '提案中';
    const newStatus = '成約';

    const inputDeal = {
      dealId: dealId,
      customerName: customerName,
      currentStatus: currentStatus,
      salesUserId: salesUserId,
      salesUserName: salesUserName,
    };

    const result = updateDealStatusToContract(inputDeal);

    expect(result.dealId).toBe('DEAL-2024-001');
    expect(result.updatedStatus).toBe('成約');
    expect(result.invoiceData.salesUserId).toBe('sales_user_001');
    expect(result.invoiceData.salesUserName).toBe('田中太郎');
    expect(result.invoiceData.lastUpdatedBy).toBe('sales_user_001');
  });
});