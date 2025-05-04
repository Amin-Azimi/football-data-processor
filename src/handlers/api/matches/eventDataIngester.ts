import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { ValidateSchema } from "../../../helpers/validateSchema";
import { MatchEvent, MatchEventSchema } from "../../../models/request.model";
import { saveMatchEvent } from "../../../services/matches/matchEventDataService";
import { response } from "../../../models/type";

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  console.log(`Match Event data received by ingester`);
  try {
    const maybeMatchEventData = await ValidateSchema<MatchEvent>(
      MatchEventSchema,
      event.body,
    );
    if (!maybeMatchEventData.success) {
      console.error("Validation failed:", maybeMatchEventData.error);
      return response.error(
        "Validation failed",
        400,
        maybeMatchEventData.error,
      );
    }
    const eventId = await saveMatchEvent(maybeMatchEventData.data);

    return response.success({
      eventId,
      ...maybeMatchEventData.data,
    });
  } catch (error) {
    console.error("Error processing event:", error);
    return response.error("Internal server error", 500);
  }
};
