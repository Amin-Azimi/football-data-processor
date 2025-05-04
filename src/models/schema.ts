import { z } from "zod";

const MatchEventTypeEnum = z.enum([
  "goal",
  "foul",
  "offside",
  "corner",
  "penalty",
  "pass",
]);
const MatchEvent = z.object({
  match_id: z.string(),
  event_type: MatchEventTypeEnum,
  team: z.string(),
  player: z.string(),
  timestamp: z.string().datetime({ offset: true }),
});

const PublishedMatchEvent = MatchEvent.extend({
  eventId: z.string(),
});

export const schemas = {
  MatchEvent,
  PublishedMatchEvent,
};
