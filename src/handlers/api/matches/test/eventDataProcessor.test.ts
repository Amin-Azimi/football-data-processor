import { EventBridgeEvent } from "aws-lambda";
import { handler } from "../eventDataProcessor";
import { validateSchema } from "../../../../helpers/validateSchema";
import { enrichAndProcessPublishedMatchEvent } from "../../../../services/matches/matchEventDataService";
import { PublishedMatchEvent } from "../../../../models/request.model";

jest.mock("../../../../helpers/validateSchema");
jest.mock("../../../../services/matches/matchEventDataService");

const mockEventDetail: PublishedMatchEvent = {
  match_id: "match123",
  timestamp: "2025-05-04T12:00:00Z",
  event_type: "goal",
  team: "AWAY",
  player: "Player B",
  eventId: "test-event-id",
};

const getMockEvent = (
  detail: PublishedMatchEvent,
): EventBridgeEvent<"MatchEvent", PublishedMatchEvent> =>
  ({
    id: "event-id",
    version: "1.0",
    account: "123456789012",
    time: new Date().toISOString(),
    region: "eu-central-1",
    resources: [],
    source: "custom.match",
    "detail-type": "MatchEvent",
    detail,
  }) as EventBridgeEvent<"MatchEvent", PublishedMatchEvent>;

describe("handler - EventBridge match event processor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should validate and process event successfully", async () => {
    (validateSchema as jest.Mock).mockResolvedValue({
      success: true,
      data: mockEventDetail,
    });

    const mockEvent = getMockEvent(mockEventDetail);

    await handler(mockEvent);

    expect(validateSchema).toHaveBeenCalledTimes(1);
    expect(validateSchema).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify(mockEventDetail),
    );
    expect(enrichAndProcessPublishedMatchEvent).toHaveBeenCalledWith(
      mockEventDetail,
    );
  });

  it("should log and skip processing on validation failure", async () => {
    (validateSchema as jest.Mock).mockResolvedValue({
      success: false,
      error: ["invalid timestamp"],
    });

    const mockEvent = getMockEvent(mockEventDetail);

    await handler(mockEvent);

    expect(validateSchema).toHaveBeenCalledTimes(1);
    expect(enrichAndProcessPublishedMatchEvent).not.toHaveBeenCalled();
  });

  it("should throw if enrichAndProcessPublishedMatchEvent fails", async () => {
    (validateSchema as jest.Mock).mockResolvedValue({
      success: true,
      data: mockEventDetail,
    });

    (enrichAndProcessPublishedMatchEvent as jest.Mock).mockRejectedValue(
      new Error("Processing failed"),
    );

    const mockEvent = getMockEvent(mockEventDetail);

    await expect(handler(mockEvent)).rejects.toThrow("Processing failed");

    expect(enrichAndProcessPublishedMatchEvent).toHaveBeenCalledWith(
      mockEventDetail,
    );
  });
});
