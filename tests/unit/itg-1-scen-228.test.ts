import { updateDealStatusToContract } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-228
  test("商談ステータスを成約に変更する際、必須項目チェックで顧客住所が欠けている場合にステータス更新が拒否される", () => {
    const deal = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      currentStatus: "提案中",
      amount: 100000,
      estimateId: "EST-001",
    };

    const customer = {
      customerId: "CUST-001",
      customerName: "A商事",
      phoneNumber: "03-xxxx-xxxx",
      address: null,
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    expect(() =>
      updateDealStatusToContract(
        deal,
        customer,
        "成約",
        notificationServiceAdapterStub,
        documentStorageAdapterStub
      )
    ).toThrow(/顧客住所/);

    expect(notificationServiceAdapterStub.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
  });
});