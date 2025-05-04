import { saveItemToDynamoDB, ddb } from "../saveItemToDynamoDB";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

describe("saveItemToDynamoDB", () => {
  const mockData = { match_id: "123", event_type: "goal" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call DynamoDB send with correct parameters", async () => {
    const mockSend = jest.fn().mockResolvedValue({});
    (ddb.send as jest.Mock) = mockSend;

    await saveItemToDynamoDB(mockData);

    expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    expect(mockSend.mock.calls[0][0].input).toEqual({
      TableName: process.env.TABLE_NAME ?? "MatchEvents",
      Item: mockData,
    });
  });

  it("should throw and log if DynamoDB fails", async () => {
    const mockSend = jest.fn().mockRejectedValue(new Error("DynamoDB error"));
    (ddb.send as jest.Mock) = mockSend;

    await expect(saveItemToDynamoDB(mockData)).rejects.toThrow(
      "DynamoDB error",
    );
    expect(mockSend).toHaveBeenCalled();
  });
});
