import {ZodType} from "zod";
import {MatchEvent} from "../models/request.model";

export const ValidateSchema =  async<T extends ZodType>(zodSchema: T, data: string | null): Promise<{
    success: true; data: MatchEvent} | {success: false; error: string
}> => {
    try {
        const parsedBody = JSON.parse(data??'');
        const validationResult = await zodSchema.safeParseAsync(parsedBody);

        if (!validationResult.success) {
            const errorMessages = validationResult.error.issues.map(issue =>
                `${issue.path.join('.')}: ${issue.message}`
            ).join(', ');

            return { success: false, error: errorMessages };
        }

        return { success: true, data: validationResult.data };
    } catch (e) {
        return { success: false, error: `Invalid JSON format: ${e}` };
    }
}