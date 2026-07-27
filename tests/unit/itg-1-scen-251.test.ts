import { validateQuoteDocumentContent } from '../../src/logic/it-1-1';

interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapterStub {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock;
  getDeliveryStatus: jest.Mock;
}

interface QuoteLineItem {
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  quoteId: string;
  customerId: string;
  customerName: string;
  lineItems: QuoteLineItem[];
  totalAmount: number;
  createdAt: string;
}

interface ValidationResult {
  isValid: boolean;
  validatedLineCount: number;
  validationCompletionMessage: string;
  errors: Array<{
    lineIndex: number;
    fieldName: string;
    errorMessage: string;
  }>;
}

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-251
  test('帳票内容検証機能 - 見積明細が1行の場合、検証対象として処理される', () => {
    // Arrange: スタブの準備
    const documentStorageAdapterStub: DocumentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file_12345',
        fileName: 'quote_001.pdf',
        uploadedAt: '2024-01-15T11:00:00Z',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/file_12345',
        expiresAt: '2024-01-22T11:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({
        success: true,
        deletedFileId: 'file_12345',
      }),
    };

    const notificationServiceAdapterStub: NotificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_quote_001',
        sentAt: '2024-01-15T11:05:00Z',
        recipientEmail: 'customer@example.com',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_order_001',
        sentAt: '2024-01-15T11:05:00Z',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg_invoice_001',
        sentAt: '2024-01-15T11:05:00Z',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: '2024-01-15T12:00:00Z',
      }),
    };

    // 見積明細が1行の見積書を用意
    const quoteWithSingleLineItem: Quote = {
      quoteId: 'QT_001',
      customerId: 'CUST_A001',
      customerName: '顧客A企業',
      lineItems: [
        {
          productCode: 'PROD_A100',
          productName: '商品A',
          quantity: 1,
          unitPrice: 10000,
        },
      ],
      totalAmount: 10000,
      createdAt: '2024-01-15T10:00:00Z',
    };

    // Act: 帳票内容検証機能を実行
    const validationResult: ValidationResult = validateQuoteDocumentContent(
      quoteWithSingleLineItem,
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    // Assert: 検証結果を確認
    // 見積明細が1行として認識されたか
    expect(validationResult.validatedLineCount).toBe(1);

    // 検証が完了したかを確認
    expect(validationResult.validationCompletionMessage).toBe(
      '検証対象行数：1行、検証完了'
    );

    // 検証が成功したか（エラーが無いか）
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.errors).toEqual([]);

    // DocumentStorageAdapterへのuploadDocument呼び出しが実行されたか
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteId: 'QT_001',
        customerId: 'CUST_A001',
        lineItemCount: 1,
      })
    );

    // NotificationServiceAdapterへのsendQuoteNotification呼び出しが実行されたか
    expect(notificationServiceAdapterStub.sendQuoteNotification).toHaveBeenCalledTimes(
      1
    );
    expect(
      notificationServiceAdapterStub.sendQuoteNotification
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        quoteId: 'QT_001',
        customerId: 'CUST_A001',
        recipientEmail: 'customer@example.com',
      })
    );
  });
});