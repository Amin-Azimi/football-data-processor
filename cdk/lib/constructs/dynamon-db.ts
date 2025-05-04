import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class MatchEventsTable extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new dynamodb.Table(this, "MatchEventsTable", {
      tableName: "MatchEvents",
      partitionKey: { name: "match_id", type: dynamodb.AttributeType.STRING },
      sortKey: {
        name: "event_type_timestamp",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "expiry",
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change for production
    });
  }
}
