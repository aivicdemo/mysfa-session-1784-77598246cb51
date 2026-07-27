import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { issueInvoice } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  let mockDocumentStorageAdapter: {
    uploadDocument: jest.Mock;
    generateShareLink: jest.Mock;
    deleteDocument: jest.Mock;
  };
  let mockNotificationServiceAdapter: {
    sendQuoteNotification: jest.Mock;
    sendOrderNotification: jest.Mock;
    sendInvoiceNotification: jest.Mock;
    getDeliveryStatus: jest.Mock;
  };
  let mockAuditLogExporter: {
    logUserAccess: jest.Mock;
    logDataAccess: jest.Mock;
    logPermissionChange: jest.Mock;
    queryAuditLog: jest.Mock;
  };

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };
    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };
    mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };
  });

  // SCEN-050
  test("should throw error when invoice issued_date is missing", () => {
    const invoiceData = {
      customer_name: "Test Customer Inc.",
      amount: 100000,
      description: "Services provided in January 2024",
      issued_date: undefined,
      customer_email: "customer@example.com",
    };

    expect(() =>
      issueInvoice(
        invoiceData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockAuditLogExporter
      )
    ).toThrow(/発行日時/);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).not.toHaveBeenCalled();
  });
});