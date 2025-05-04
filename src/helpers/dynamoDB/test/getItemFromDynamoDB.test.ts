import { getItemFromDynamoDB, client } from "../getItemFromDynamoDB";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

jest.mock("@aws-sdk/client-dynamodb", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-dynamodb");
  return {
    ...originalModule,
    DynamoDBClient: jest.fn(() => ({
      send: jest.fn(),
    })),
  };
});

describe("getItemFromDynamoDB", () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    (client.send as any) = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const condition = "match_id = :id";
  const values = { ":id": "match123" };

  it("should return items from DynamoDB", async () => {
    const mockItems = [{ match_id: "match123", event_type: "goal" }];
    mockSend.mockResolvedValue({ Items: mockItems });

    const result = await getItemFromDynamoDB(condition, values);

    expect(mockSend).toHaveBeenCalledWith(expect.any(QueryCommand));
    expect(result).toEqual(mockItems);

    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input).toMatchObject({
      TableName: process.env.TABLE_NAME ?? "MatchEvents",
      KeyConditionExpression: condition,
      ExpressionAttributeValues: values,
    });
  });

  it("should include limit if provided", async () => {
    mockSend.mockResolvedValue({ Items: [] });

    const limit = 5;
    await getItemFromDynamoDB(condition, values, limit);

    const sentCommand = mockSend.mock.calls[0][0];
    expect(sentCommand.input.Limit).toBe(limit);
  });

  it("should return empty array if no items found", async () => {
    mockSend.mockResolvedValue({});

    const result = await getItemFromDynamoDB(condition, values);
    expect(result).toEqual([]);
  });

  it("should throw error if DynamoDB fails", async () => {
    mockSend.mockRejectedValue(new Error("DynamoDB error"));

    await expect(getItemFromDynamoDB(condition, values)).rejects.toThrow(
      "DynamoDB error",
    );
  });
});
