import {randomUUID} from "crypto";
import {MatchEvent} from "../../models/request.model";
import {storeInS3} from "../../helpers/s3/storeInS3";
import {publishToEventBridge} from "../../helpers/eventBridge/publishToEventBridge";
import {
    EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE,
    EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE
} from "../../helpers/constants";

export const  saveMatchEvent = async (matchEvent: MatchEvent): Promise<string> => {
    const eventId = randomUUID();
    const rawKey = `raw-events/${matchEvent.match_id}/${Date.now()}.json`;

    await storeInS3(matchEvent,rawKey);
    console.log(`Match event data with ID: ${eventId} stored successfully`);

    await publishToEventBridge({...matchEvent,eventId},EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE, EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE);
    console.log(`Match event data with ID: ${eventId} published to EventBridge successfully`);
    return eventId;
}