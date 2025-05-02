import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID} from 'crypto';


export const handler = async(event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {

    // TODO : validate event data
    try{
        if(!event.body){
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing event data' }),            }
        }
        console.log(`Event data received: ${event.body}`);
        const eventData = JSON.parse(event.body);
        const eventId = randomUUID();

        console.log(`Event ID: ${eventId}`);

        // TODO : create a response type
        return{
            statusCode: 200,
            body: JSON.stringify({
                message: 'Event received successfully',
                eventId: eventId,
                eventData: eventData
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