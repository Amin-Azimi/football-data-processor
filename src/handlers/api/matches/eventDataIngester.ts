import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import {ValidateSchema} from "../../../helpers/validateSchema";
import {MatchEventSchema} from "../../../models/request.model";
import {saveMatchEvent} from "../../../services/matches/matchEventDataService";


export const handler = async(event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {

    console.log(`Match Event data received by ingester`);
    try{
        const maybeMatchEventData = await ValidateSchema(MatchEventSchema, event.body);
        if(!maybeMatchEventData.success){
            console.error('Validation failed:', maybeMatchEventData.error);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Validation failed",
                    errors: maybeMatchEventData.error
                }),
            }
        }
        const eventId = await saveMatchEvent(maybeMatchEventData.data);

        // TODO : create a response type
        return{
            statusCode: 200,
            body: JSON.stringify({
                message: 'Event processed successfully',
                eventId: eventId,
                eventData: maybeMatchEventData.data
            }),
        }
    }
    catch(error){
        console.error('Error processing event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        }
    }
}