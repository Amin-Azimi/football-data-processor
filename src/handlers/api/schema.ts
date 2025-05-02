import {z} from 'zod';

const MatchEventType = z.enum(['goal', 'foul', 'offside', 'corner', 'penalty', 'substitution']);
const MatchEvent = z.object({
    match_id: z.string(),
    event_type: MatchEventType,
    team: z.string(),
    player: z.string(),
    timestamp: z.string().datetime({ offset: true }),
})

export const schemas={
    MatchEvent
}