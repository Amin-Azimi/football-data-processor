import { z } from "zod";
import { schemas } from "./schema";

export const MatchEventSchema = schemas.MatchEvent;
export type MatchEvent = z.infer<typeof MatchEventSchema>;

export const PublishedMatchEventSchema = schemas.PublishedMatchEvent;
export type PublishedMatchEvent = z.infer<typeof PublishedMatchEventSchema>;
