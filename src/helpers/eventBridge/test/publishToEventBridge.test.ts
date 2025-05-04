import { publishToEventBridge, eventBridge } from "../publishToEventBridge";
import { PutEventsCommand } from "@aws-sdk/client-eventbridge";

jest.mock("@aws-sdk/client-eventbridge", () => {
  const actual = jest.requireActual("@aws-sdk/client-eventbridge");
  return {
    ...actual,
    EventBridgeClient: jest.fn(() => ({
      send: jest.fn(),
    })),
  };
});

describe("publishToEventBridge", () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    (eventBridge.send as any) = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const data = { match_id: "123", event_type: "goal" };
  const source = "match.event";
  const detailType = "GoalEvent";

  it("should publish event successfully", async () => {
    mockSend.mockResolvedValue({});

    await publishToEventBridge(data, source, detailType);

    expect(mockSend).toHaveBeenCalledWith(expect.any(PutEventsCommand));

    const command = mockSend.mock.calls[0][0];
    expect(command.input.Entries[0]).toMatchObject({
      Source: source,
      DetailType: detailType,
      Detail: JSON.stringify(data),
      EventBusName: process.env.EVENT_BUS_NAME ?? "MatchEventsBus",
    });
  });

  it("should throw and log if EventBridge send fails", async () => {
    const error = new Error("Send failed");
    mockSend.mockRejectedValue(error);

    await expect(
      publishToEventBridge(data, source, detailType),
    ).rejects.toThrow("Send failed");

    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
