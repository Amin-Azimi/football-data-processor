import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { MatchEventType, response } from "../../../models/type";
import { getMatchEventDataStatistics } from "../../../services/matches/matchEventDataService";
import { INTERNAL_SERVER_ERROR } from "../../../helpers/constants";

export const handler = async (
  event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
  console.log("Event data statistics request received");
  try {
    const matchId = event.pathParameters?.match_id;
    const resource = event.resource;

    if (!matchId) {
      console.error("Invalid match id", event.pathParameters);
      return response.error("Invalid match id");
    }

    let eventType: MatchEventType;
    if (resource.includes("goals")) {
      eventType = "goal";
    } else if (resource.includes("passes")) {
      eventType = "pass";
    } else {
      console.error("Invalid endpoint", resource);
      return response.error("Invalid endpoint");
    }

    const result = await getMatchEventDataStatistics(matchId, eventType);
    console.log(
      `Match event data statistics for matchId: ${matchId} and eventType: ${eventType}:`,
      result,
    );

    return response.success(result);
  } catch (error) {
    console.error("Error processing event:", error);
    return response.error(INTERNAL_SERVER_ERROR, 500);
  }
};
