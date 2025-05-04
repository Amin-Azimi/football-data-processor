import { APIGatewayProxyResult } from "aws-lambda";

export type MatchEventType = "goal" | "pass";

export const response = {
  success: (data: unknown, statusCode = 200): APIGatewayProxyResult => ({
    statusCode,
    body: JSON.stringify(data),
  }),

  error: (
    message: string,
    statusCode = 400,
    errors?: unknown,
  ): APIGatewayProxyResult => ({
    statusCode,
    body: JSON.stringify({ message, errors }),
  }),
};
