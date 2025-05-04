import {randomUUID} from "crypto";
import {MatchEvent, PublishedMatchEvent} from "../../models/request.model";
import {storeInS3} from "../../helpers/s3/storeInS3";
import {publishToEventBridge} from "../../helpers/eventBridge/publishToEventBridge";
import {
    EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE,
    EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE
} from "../../helpers/constants";
import {saveItemToDynamoDB} from "../../helpers/dynamoDB/saveItemToDynamoDB";
import {MatchEventType} from "../../models/type";
import {MatchEventDataStatisticsResult} from "../../models/interfaces";
import {getItemFromDynamoDB} from "../../helpers/dynamoDB/getItemFromDynamoDB";

export const  saveMatchEvent = async (matchEvent: MatchEvent): Promise<string> => {
    const eventId = randomUUID();
    const rawKey = `raw-events/${matchEvent.match_id}/${Date.now()}.json`;

    await storeInS3(matchEvent,rawKey);
    console.log(`Match event data with ID: ${eventId} stored successfully`);

    await publishToEventBridge({...matchEvent,eventId},EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE, EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE);
    console.log(`Match event data with ID: ${eventId} published to EventBridge successfully`);
    return eventId;
}

export const enrichAndProcessPublishedMatchEvent = async (matchEvent: PublishedMatchEvent): Promise<boolean> => {
    const season = getSeason(matchEvent.timestamp);
    const event_type_timestamp = `${matchEvent.event_type}#${matchEvent.timestamp}`;

    const enrichedMatchEvent = {
        ...matchEvent,
        season,
        event_type_timestamp,
        processesAt: new Date().toISOString(),
    };

    await saveItemToDynamoDB(enrichedMatchEvent);
    console.log(`Processing enriched match event: ${JSON.stringify(enrichedMatchEvent)}`);
    return true;
}

export const getMatchEventDataStatistics = async (matchId: string, eventType: MatchEventType): Promise<MatchEventDataStatisticsResult> => {
    console.log(`Fetching match event data statistics for matchId: ${matchId} and eventType: ${eventType}`);

    const whereCondition = 'match_id = :matchId AND begins_with(event_type_timestamp, :eventType)';
    const values: Record<string, any> =  {
        ':matchId': matchId,
        ':eventType': eventType,
    };

    const result = await getItemFromDynamoDB(whereCondition, values);
    const total = result?.length ?? 0;

    console.log(`Total ${eventType} events for matchId ${matchId}: ${total}`);
    return {
        total,
        match_Id: matchId
    }
}

const getSeason=(timestamp: string): string =>{
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    return `${year}-${year + 1}`;
}