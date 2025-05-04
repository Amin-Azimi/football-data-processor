import {EventBridgeEvent} from "aws-lambda";
import {
    PublishedMatchEvent,
    PublishedMatchEventSchema
} from "../../../models/request.model";
import {ValidateSchema} from "../../../helpers/validateSchema";

export const handler = async(event: EventBridgeEvent<'MatchEvent', PublishedMatchEvent>): Promise<void> => {
    console.log(`Match Event data received by data processor : ${JSON.stringify(event?.detail)}`);
    const { detail } = event;
    const PublishedMatchEvent = await ValidateSchema(PublishedMatchEventSchema, JSON.stringify(detail));

    if (!PublishedMatchEvent.success) {
        console.error('Validation failed:', PublishedMatchEvent.error);
        return;
    }
    console.log(`Match Event data validated successfully : ${JSON.stringify(PublishedMatchEvent.data)}`);
}