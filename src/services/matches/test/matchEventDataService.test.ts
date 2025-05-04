import * as s3Module from "../../../helpers/s3/storeInS3";
import * as eventBridgeModule from "../../../helpers/eventBridge/publishToEventBridge";
import * as dynamoDBSaveModule from "../../../helpers/dynamoDB/saveItemToDynamoDB";
import * as dynamoDBGetModule from "../../../helpers/dynamoDB/getItemFromDynamoDB";
import { randomUUID } from "crypto";
import {
  EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE,
  EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE,
} from "../../../helpers/constants";
import {
  enrichAndProcessPublishedMatchEvent,
  getMatchEventDataStatistics,
  saveMatchEvent,
} from "../matchEventDataService";
import { MatchEvent, PublishedMatchEvent } from "../../../models/request.model";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

jest.mock("../../../helpers/s3/storeInS3", () => ({
  storeInS3: jest.fn(),
}));

jest.mock("../../../helpers/eventBridge/publishToEventBridge", () => ({
  publishToEventBridge: jest.fn(),
}));

jest.mock("../../../helpers/dynamoDB/saveItemToDynamoDB", () => ({
  saveItemToDynamoDB: jest.fn(),
}));

jest.mock("../../../helpers/dynamoDB/getItemFromDynamoDB", () => ({
  getItemFromDynamoDB: jest.fn(),
}));

describe("saveMatchEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should save to S3, publish to EventBridge and return eventId", async () => {
    const mockEventId = "uuid-123";
    (randomUUID as jest.Mock).mockReturnValue(mockEventId);
    const matchEvent: MatchEvent = {
      match_id: "match-1",
      timestamp: "2025-05-04T12:00:00Z",
      event_type: "goal",
      team: "A",
      player: "B",
    };

    await saveMatchEvent(matchEvent);

    expect(s3Module.storeInS3).toHaveBeenCalledWith(
      matchEvent,
      expect.stringMatching(`raw-events/${matchEvent.match_id}/`),
    );

    expect(eventBridgeModule.publishToEventBridge).toHaveBeenCalledWith(
      expect.objectContaining({
        ...matchEvent,
        eventId: mockEventId,
      }),
      EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE,
      EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE,
    );
  });
});

describe("enrichAndProcessPublishedMatchEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should enrich event and save to DynamoDB", async () => {
    const publishedEvent: PublishedMatchEvent = {
      match_id: "match-1",
      event_type: "goal",
      timestamp: "2024-10-01T10:00:00Z",
      team: "A",
      player: "B",
      eventId: "C",
    };

    const result = await enrichAndProcessPublishedMatchEvent(publishedEvent);

    expect(result).toBe(true);
    expect(dynamoDBSaveModule.saveItemToDynamoDB).toHaveBeenCalledWith(
      expect.objectContaining({
        ...publishedEvent,
        season: "2024-2025",
        event_type_timestamp: "goal#2024-10-01T10:00:00Z",
        processesAt: expect.any(String),
      }),
    );
  });
});

describe("getMatchEventDataStatistics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should call getItemFromDynamoDB and return stats", async () => {
    (dynamoDBGetModule.getItemFromDynamoDB as jest.Mock).mockResolvedValue([
      { event_type_timestamp: "goal#1" },
      { event_type_timestamp: "goal#2" },
    ]);

    const result = await getMatchEventDataStatistics("match-123", "goal");

    expect(dynamoDBGetModule.getItemFromDynamoDB).toHaveBeenCalledWith(
      "match_id = :matchId AND begins_with(event_type_timestamp, :eventType)",
      {
        ":matchId": "match-123",
        ":eventType": "goal",
      },
    );

    expect(result).toEqual({
      total: 2,
      match_Id: "match-123",
    });
  });

  it("should handle empty result gracefully", async () => {
    (dynamoDBGetModule.getItemFromDynamoDB as jest.Mock).mockResolvedValue([]);

    const result = await getMatchEventDataStatistics("match-456", "pass");

    expect(result).toEqual({
      total: 0,
      match_Id: "match-456",
    });
  });
});
