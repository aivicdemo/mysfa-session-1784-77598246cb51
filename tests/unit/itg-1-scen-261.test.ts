import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateAndDistributeInvoice } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-261
  test('請求書自動配信機能 - 顧客ポータル配信先メールアドレスが未設定の場合にエラーを返す', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-123',
      customerName: '株式会社テスト',
      amount: 100000,
      invoiceDate: '2024-04-15',
      dueDate: '2024-05-15',
      portalEmail: '',
      items: [
        {
          itemId: 'ITEM-001',
          description: 'コンサルティング',
          quantity: 1,
          unitPrice: 100000,
          amount: 100000
        }
      ],
      status: 'pending'
    };

    expect(() => validateAndDistributeInvoice(invoiceData)).toThrow(/メールアドレス/);
  });

  test('請求書自動配信機能 - 顧客ポータル配信先メールアドレスが null の場合にエラーを返す', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-002',
      customerId: 'CUST-456',
      customerName: '株式会社テスト2',
      amount: 50000,
      invoiceDate: '2024-04-20',
      dueDate: '2024-05-20',
      portalEmail: null as any,
      items: [
        {
          itemId: 'ITEM-002',
          description: 'システム構築',
          quantity: 1,
          unitPrice: 50000,
          amount: 50000
        }
      ],
      status: 'pending'
    };

    expect(() => validateAndDistributeInvoice(invoiceData)).toThrow(/メールアドレス/);
  });

  test('請求書自動配信機能 - 有効なメールアドレスが設定されている場合に配信が成功する', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-003',
      customerId: 'CUST-789',
      customerName: '株式会社テスト3',
      amount: 150000,
      invoiceDate: '2024-04-25',
      dueDate: '2024-05-25',
      portalEmail: 'customer@example.com',
      items: [
        {
          itemId: 'ITEM-003',
          description: 'デザイン',
          quantity: 2,
          unitPrice: 75000,
          amount: 150000
        }
      ],
      status: 'pending'
    };

    const result = validateAndDistributeInvoice(invoiceData);

    expect(result).toEqual({
      success: true,
      invoiceId: 'INV-2024-003',
      distributedTo: 'customer@example.com',
      distributedAt: expect.any(String),
      status: 'distributed'
    });
  });
});