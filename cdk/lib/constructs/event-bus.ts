import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";
import { FootballEventProcessor } from "./lambdas/lambda-data-processor";
import {
  EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE,
  EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE,
} from "../../../src/helpers/constants";

export class MatchEventBus extends Construct {
  public readonly eventBus: events.EventBus;
  private processingLambda: FootballEventProcessor;
  private readonly eventRuleId: string = "MatchEventRule";

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.eventBus = new events.EventBus(this, "MatchEventsBus", {
      eventBusName: "MatchEventBus",
    });
    new events.Rule(this, this.eventRuleId, {
      eventBus: this.eventBus,
      eventPattern: {
        source: [EVENT_BRIDGE_MATCH_EVENT_INGEST_SOURCE],
        detailType: [EVENT_BRIDGE_MATCH_EVENT_INGEST_DETAIL_TYPE],
      },
    });
  }
  public addProcessingLambda(lambda: FootballEventProcessor): void {
    this.processingLambda = lambda;
    const rule = this.node.findChild(this.eventRuleId) as events.Rule;
    rule.addTarget(new targets.LambdaFunction(lambda.lambdaFunction));
  }
}
