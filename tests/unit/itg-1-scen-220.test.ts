import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import {
  updateDealStatusToContracted,
  getDealWithInvoiceDetails,
} from "../../src/logic/it-1-2";

interface DealLineItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Deal {
  dealId: string;
  status: string;
  customerId: string;
  totalAmount: number;
  lineItems: DealLineItem[];
}

interface InvoiceLineItem {
  itemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Invoice {
  invoiceId: string;
  dealId: string;
  customerId: string;
  totalAmount: number;
  status: string;
  lineItems: InvoiceLineItem[];
}

interface DocumentStorageAdapter {
  uploadDocument: jest.Mock<Promise<{ documentId: string }>>;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapter {
  sendQuoteNotification: jest.Mock;
  sendOrderNotification: jest.Mock;
  sendInvoiceNotification: jest.Mock<Promise<{ sent: boolean }>>;
  getDeliveryStatus: jest.Mock;
}

describe("商談ステータスと請求データの紐付け・可視化", () => {
  let mockDocumentStorageAdapter: DocumentStorageAdapter;
  let mockNotificationServiceAdapter: NotificationServiceAdapter;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: "DOC-12345" }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ sent: true }),
      getDeliveryStatus: jest.fn(),
    };
  });

  // SCEN-220
  test("商談ステータスを成約に変更する際、請求データ紐付けで請求明細が商談明細と一致して生成される", async () => {
    const dealId = "DEAL-001";
    const customerId = "CUST-100";
    const dealLineItem1: DealLineItem = {
      itemId: "ITEM-A",
      quantity: 10,
      unitPrice: 30000,
      subtotal: 300000,
    };
    const dealLineItem2: DealLineItem = {
      itemId: "ITEM-B",
      quantity: 4,
      unitPrice: 50000,
      subtotal: 200000,
    };
    const dealTotalAmount = 500000;

    const inputDeal: Deal = {
      dealId: dealId,
      status: "進行中",
      customerId: customerId,
      totalAmount: dealTotalAmount,
      lineItems: [dealLineItem1, dealLineItem2],
    };

    const resultInvoice: Invoice = await updateDealStatusToContracted(
      inputDeal,
      "成約",
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(resultInvoice.dealId).toBe(dealId);
    expect(resultInvoice.customerId).toBe(customerId);
    expect(resultInvoice.totalAmount).toBe(500000);
    expect(resultInvoice.status).toBe("未払い");

    expect(resultInvoice.lineItems).toHaveLength(2);

    expect(resultInvoice.lineItems[0]).toEqual({
      itemId: "ITEM-A",
      quantity: 10,
      unitPrice: 30000,
      subtotal: 300000,
    });

    expect(resultInvoice.lineItems[1]).toEqual({
      itemId: "ITEM-B",
      quantity: 4,
      unitPrice: 50000,
      subtotal: 200000,
    });

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(
      1
    );

    const retrievedInvoice: Invoice = await getDealWithInvoiceDetails(
      dealId,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    expect(retrievedInvoice.dealId).toBe(dealId);
    expect(retrievedInvoice.customerId).toBe(customerId);
    expect(retrievedInvoice.totalAmount).toBe(500000);
    expect(retrievedInvoice.status).toBe("未払い");
    expect(retrievedInvoice.lineItems).toHaveLength(2);
    expect(retrievedInvoice.lineItems[0].itemId).toBe("ITEM-A");
    expect(retrievedInvoice.lineItems[0].quantity).toBe(10);
    expect(retrievedInvoice.lineItems[0].unitPrice).toBe(30000);
    expect(retrievedInvoice.lineItems[0].subtotal).toBe(300000);
    expect(retrievedInvoice.lineItems[1].itemId).toBe("ITEM-B");
    expect(retrievedInvoice.lineItems[1].quantity).toBe(4);
    expect(retrievedInvoice.lineItems[1].unitPrice).toBe(50000);
    expect(retrievedInvoice.lineItems[1].subtotal).toBe(200000);
  });
});