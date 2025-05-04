import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.TABLE_NAME ?? "MatchEvents";

const client = new DynamoDBClient({});
export const ddb = DynamoDBDocumentClient.from(client);

export const saveItemToDynamoDB = async (data: any) => {
  try {
    const params = new PutCommand({
      TableName: TABLE_NAME,
      Item: data,
    });

    const result = await ddb.send(params);
    console.log(`Item saved to DynamoDB table ${TABLE_NAME}:`, result);
  } catch (error) {
    console.error("Error saving item to DynamoDB:", error);
    throw error;
  }
};
