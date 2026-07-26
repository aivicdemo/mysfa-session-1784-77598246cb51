import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  validateDealAmount,
  generateEstimateOrderInvoice,
  verifyGeneratedDocuments,
} from '../../src/logic/it-1-1';

describe('見積・注文・請求書自動生成機能', () => {
  // SCEN-146
  test('商談金額が0円の場合、警告が表示される', () => {
    const deal_data = {
      deal_id: 'DEAL-20240115-001',
      deal_name: 'テスト商談',
      customer_id: 'CUST-0001',
      customer_name: '株式会社テスト',
      deal_amount: 0,
      deal_date: '2024-01-15T10:00:00Z',
      status: '提案中',
    };

    const validation_result = validateDealAmount(deal_data);

    expect(validation_result.is_valid).toBe(false);
    expect(validation_result.warning_message).toMatch(/金額/);
    expect(validation_result.warning_message).toMatch(/0円/);

    const estimate_data = {
      deal_id: deal_data.deal_id,
      customer_id: deal_data.customer_id,
      customer_name: deal_data.customer_name,
      deal_amount: deal_data.deal_amount,
      deal_name: deal_data.deal_name,
      deal_date: deal_data.deal_date,
    };

    const generated_docs = generateEstimateOrderInvoice(estimate_data);

    expect(generated_docs).toBeDefined();
    expect(generated_docs.estimate).toBeDefined();
    expect(generated_docs.order).toBeDefined();
    expect(generated_docs.invoice).toBeDefined();

    expect(generated_docs.estimate.total_amount).toBe(0);
    expect(generated_docs.order.total_amount).toBe(0);
    expect(generated_docs.invoice.total_amount).toBe(0);

    const verify_result = verifyGeneratedDocuments(generated_docs);

    expect(verify_result.status).toBe('warning');
    expect(verify_result.messages).toContain(/金額/);
    expect(verify_result.is_processable).toBe(true);
  });
});