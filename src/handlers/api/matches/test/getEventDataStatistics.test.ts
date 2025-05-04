import { APIGatewayEvent } from "aws-lambda";
import { getMatchEventDataStatistics } from "../../../../services/matches/matchEventDataService";
import { handler } from "../getEventDataStatistics";

jest.mock("../../../../services/matches/matchEventDataService");

const getMockEvent = (
  matchId?: string,
  resource: string = "/matches/match123/goals",
): APIGatewayEvent =>
  ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: resource,
    pathParameters: matchId ? { match_id: matchId } : undefined,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource,
  }) as APIGatewayEvent;

describe("handler - get match event statistics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should return 200 with match stats for goals", async () => {
    const mockStats = { goals: 2 };
    (getMatchEventDataStatistics as jest.Mock).mockResolvedValue(mockStats);

    const event = getMockEvent("match123", "/matches/match123/goals");
    const result = await handler(event);

    expect(getMatchEventDataStatistics).toHaveBeenCalledWith(
      "match123",
      "goal",
    );
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockStats));
  });

  it("should return 200 with match stats for passes", async () => {
    const mockStats = { passes: 10 };
    (getMatchEventDataStatistics as jest.Mock).mockResolvedValue(mockStats);

    const event = getMockEvent("match456", "/matches/match456/passes");
    const result = await handler(event);

    expect(getMatchEventDataStatistics).toHaveBeenCalledWith(
      "match456",
      "pass",
    );
    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify(mockStats));
  });

  it("should return 400 if match_id is missing", async () => {
    const event = getMockEvent(undefined, "/matches/invalid/goals");
    const result = await handler(event);

    expect(getMatchEventDataStatistics).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Invalid match id");
  });

  it("should return 400 if endpoint is invalid", async () => {
    const event = getMockEvent("match789", "/matches/match789/invalid");
    const result = await handler(event);

    expect(getMatchEventDataStatistics).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Invalid endpoint");
  });

  it("should return 500 on unexpected error", async () => {
    (getMatchEventDataStatistics as jest.Mock).mockRejectedValue(
      new Error("Unexpected failure"),
    );

    const event = getMockEvent("match123", "/matches/match123/goals");
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toContain("Internal server error");
  });
});
