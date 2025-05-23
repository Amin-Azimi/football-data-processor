import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME ?? "MatchEventsBus";

export const eventBridge = new EventBridgeClient({});

export const publishToEventBridge = async (
  data: object,
  source: string,
  detailType: string,
): Promise<void> => {
  const params = {
    Entries: [
      {
        Source: source,
        DetailType: detailType,
        Detail: JSON.stringify(data),
        EventBusName: EVENT_BUS_NAME,
      },
    ],
  };

  try {
    await eventBridge.send(new PutEventsCommand(params));
    console.log(
      `Successfully published event to EventBridge bus ${EVENT_BUS_NAME}`,
    );
  } catch (error) {
    console.error(
      `Error publishing event to EventBridge bus ${EVENT_BUS_NAME}:`,
      error,
    );
    throw error;
  }
};
