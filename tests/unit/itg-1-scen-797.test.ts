import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-797
  it('請求対象データが0件のとき、空の検証結果を返す', () => {
    const invoiceDataList: any[] = [];

    const validationResult = validateInvoiceData(invoiceDataList);

    expect(validationResult.errors).toEqual([]);
    expect(validationResult.targetDataCount).toBe(0);
  });
});