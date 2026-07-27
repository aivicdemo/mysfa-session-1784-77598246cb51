import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  issueQuoteWithNotification,
} from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照 - Google Workspace メール API連携', () => {
  // SCEN-166
  test('sendQuoteNotificationの応答形式が想定と異なる場合、不正なメール送信が実行されない', async () => {
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue(null),
    };

    const mockMailQueue: Array<{ quoteId: string; email: string; status: string }> = [];

    const quoteData = {
      quoteId: 'QUOTE-2024-001',
      customerId: 'CUST-12345',
      customerEmail: 'customer@example.com',
      amount: 150000,
      description: 'Software licensing agreement',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const result = await issueQuoteWithNotification(
      quoteData,
      mockNotificationServiceAdapter,
      mockMailQueue,
    );

    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledWith({
      customerId: quoteData.customerId,
      customerEmail: quoteData.customerEmail,
      quoteId: quoteData.quoteId,
      amount: quoteData.amount,
    });

    expect(result.quoteStatus).toBe('メール送信保留中');
    expect(result.errorMessage).toBe('メール送信に失敗しました。手動で顧客に連絡してください');
    expect(mockMailQueue.length).toBe(0);
  });
});