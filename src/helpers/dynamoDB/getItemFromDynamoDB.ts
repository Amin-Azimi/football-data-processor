import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME ?? "MatchEvents";

const client = new DynamoDBClient({});

export const getItemFromDynamoDB = async (
  condition: string,
  values: Record<string, any>,
  limit?: number,
) => {
  try {
    const params = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: condition,
      ExpressionAttributeValues: values,
      ...(limit && { Limit: limit }),
    });

    const result = await client.send(params);
    console.log(
      `Item retrieved from DynamoDB table ${TABLE_NAME}:`,
      result.Items?.length,
    );
    return result.Items || [];
  } catch (error) {
    console.error("Error retrieving item from DynamoDB:", error);
    throw error;
  }
};
