import {
  reconcileSalesWithInvoice,
} from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-659: 売上実績金額が0円のとき、ズレ解消処理により0円として処理される", () => {
    // Arrange
    const salesRecord = {
      id: "sales-001",
      invoiceId: "invoice-001",
      amount: 0,
      invoiceAmount: 0,
      status: "completed",
      reconciliationDate: new Date("2024-01-15T11:00:00Z"),
    };

    const notificationServiceStub = {
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const documentStorageStub = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const invoiceRecord = {
      id: "invoice-001",
      customerId: "customer-001",
      amount: 0,
      status: "draft",
      createdAt: new Date("2024-01-15T10:00:00Z"),
    };

    // Act
    const result = reconcileSalesWithInvoice(
      salesRecord,
      invoiceRecord,
      notificationServiceStub,
      documentStorageStub
    );

    // Assert
    expect(result.salesAmount).toBe(0);
    expect(result.invoiceAmount).toBe(0);
    expect(result.isReconciled).toBe(true);
    expect(result.discrepancyAmount).toBe(0);
    expect(notificationServiceStub.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(documentStorageStub.uploadDocument).not.toHaveBeenCalled();
  });
});