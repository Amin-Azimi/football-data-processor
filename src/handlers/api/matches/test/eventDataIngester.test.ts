import { APIGatewayEvent } from "aws-lambda";
import { MatchEvent } from "../../../../models/request.model";
import { handler } from "../eventDataIngester";
import { saveMatchEvent } from "../../../../services/matches/matchEventDataService";
import { validateSchema } from "../../../../helpers/validateSchema";

jest.mock("../../../../helpers/validateSchema");
jest.mock("../../../../services/matches/matchEventDataService");

const mockEventBody: MatchEvent = {
  match_id: "match123",
  timestamp: "2025-05-04T12:00:00Z",
  event_type: "goal",
  team: "HOME",
  player: "Player A",
};

const getMockEvent = (body?: object): APIGatewayEvent =>
  ({
    body: body ? JSON.stringify(body) : undefined,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "POST",
    isBase64Encoded: false,
    path: "/ingest",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: "",
  }) as APIGatewayEvent;

describe("handler - match event ingester", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should return 200 with eventId if event is saved successfully", async () => {
    (validateSchema as jest.Mock).mockResolvedValue({
      success: true,
      data: mockEventBody,
    });

    const event = getMockEvent(mockEventBody);
    const result = await handler(event);

    expect(validateSchema).toHaveBeenCalledTimes(1);
    expect(saveMatchEvent).toHaveBeenCalledWith(mockEventBody);
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify(mockEventBody));
  });

  it("should return 400 if validation fails", async () => {
    (validateSchema as jest.Mock).mockResolvedValue({
      success: false,
      error: ["timestamp is required"],
    });

    const event = getMockEvent({}); // empty object triggers validation error
    const result = await handler(event);

    expect(validateSchema).toHaveBeenCalledTimes(1);
    expect(result.statusCode).toBe(400);
    expect(result.body).toContain("Validation failed");
  });

  it("should return 500 if an unexpected error occurs", async () => {
    (validateSchema as jest.Mock).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const event = getMockEvent(mockEventBody);
    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(result.body).toContain("Internal server error");
  });
});
