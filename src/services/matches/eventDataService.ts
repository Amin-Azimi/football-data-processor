import {randomUUID} from "crypto";

export const  ingestEventData = async (event: any) => {
    // TODO : add logger
    try {
        const eventData = JSON.parse(event.body);
        const eventId = randomUUID();

        console.log(`Event ID: ${eventId}`);

        // TODO : create a response type
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Event received successfully',
                eventId: eventId,
                eventData: eventData
            }),
        }
    } catch (error) {
        console.error('Error processing event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        }
    }
}