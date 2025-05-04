import { EventBridgeEvent } from "aws-lambda";
import {
  PublishedMatchEvent,
  PublishedMatchEventSchema,
} from "../../../models/request.model";
import { validateSchema } from "../../../helpers/validateSchema";
import { enrichAndProcessPublishedMatchEvent } from "../../../services/matches/matchEventDataService";

export const handler = async (
  event: EventBridgeEvent<"MatchEvent", PublishedMatchEvent>,
): Promise<void> => {
  console.log(
    `Match Event data received by data processor : ${JSON.stringify(event)}`,
  );

  const { detail } = event;
  const maybePublishedMatchEvent = await validateSchema<PublishedMatchEvent>(
    PublishedMatchEventSchema,
    JSON.stringify(detail),
  );
  if (!maybePublishedMatchEvent.success) {
    console.error(
      "Validation failed on processing data:",
      maybePublishedMatchEvent.error,
    );
    return;
  }

  await enrichAndProcessPublishedMatchEvent(maybePublishedMatchEvent.data);

  console.log(
    `Match Event data processed and enriched successfully : ${JSON.stringify(maybePublishedMatchEvent.data)}`,
  );
};
