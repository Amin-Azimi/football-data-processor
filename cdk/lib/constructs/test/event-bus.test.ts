import * as events from "aws-cdk-lib/aws-events";
import { Construct } from "constructs";
import { Stack } from "aws-cdk-lib";

import { MatchEventBus } from "../event-bus";
import {
  EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE,
  EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE,
} from "../../../../src/helpers/constants";

describe("MatchEventBus", () => {
  let stack: Stack;
  let scope: Construct;

  beforeEach(() => {
    stack = new Stack();
    scope = new Construct(stack, "TestScope");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create an event bus with correct configuration", () => {
    // Arrange & Act
    const matchEventBus = new MatchEventBus(scope, "TestMatchEventBus");

    // Assert
    expect(matchEventBus.eventBus).toBeInstanceOf(events.EventBus);

    const rule = matchEventBus.node.findChild("MatchEventRule") as events.Rule;
    expect(rule).toBeInstanceOf(events.Rule);
    expect(rule["eventPattern"]).toEqual({
      source: [EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE],
      detailType: [EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE],
    });
  });
});
