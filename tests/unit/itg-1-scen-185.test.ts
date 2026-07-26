import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  updateDealStatusWithValidation,
  saveDealCustomerInteractionRecord,
} from "../../src/logic/it-1-2";

const fetchMock = require("jest-fetch-mock");

describe("商談ステータスと請求データの紐付け・可視化", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-185
  test("顧客対応記録が空文字列の場合、記録が保存されずエラーが返される", async () => {
    const deal_id = "DEAL-20240115-001";
    const customer_id = "CUST-9999";
    const interaction_record = "";
    const deal_status = "成約";

    const error_response = {
      status: "error",
      code: "INVALID_INTERACTION_RECORD",
      message: "顧客対応記録",
    };

    fetchMock.mockResponseOnce(JSON.stringify(error_response), {
      status: 400,
    });

    const result = await saveDealCustomerInteractionRecord({
      deal_id,
      customer_id,
      interaction_record,
      deal_status,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const call_args = fetchMock.mock.calls[0];
    expect(call_args[0]).toContain("/deals/customer-interaction");
    expect(call_args[1].method).toBe("POST");

    expect(result).toMatchObject({
      status: "error",
      code: "INVALID_INTERACTION_RECORD",
    });

    expect(result.message).toMatch(/顧客対応記録/);
  });
});