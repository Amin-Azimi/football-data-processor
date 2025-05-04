import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RawEventBucket } from "./constructs/s3-bucket";
import { MatchEventBus } from "./constructs/event-bus";
import { FootballAnalyticsApi } from "./constructs/api-gateway";
import { FootballEventIngester } from "./constructs/lambdas/lambda-ingester";
import { MatchEventsTable } from "./constructs/dynamon-db";
import { FootballEventProcessor } from "./constructs/lambdas/lambda-data-processor";
import { FootballEventQuery } from "./constructs/lambdas/lambda-query";

export class FootballDataProcessorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 Bucket
    const rawEventBucket = new RawEventBucket(this, "RawEventBucket");

    // Create EventBridge Bus
    const eventBus = new MatchEventBus(this, "MatchEventsBus");

    // Create database resources
    const matchEventsTable = new MatchEventsTable(this, "MatchEventsTable");

    // Lambda: Ingestion
    const footballEventIngesterLambda = new FootballEventIngester(
      this,
      "FootballEventIngester",
      {
        bucketName: rawEventBucket.bucket.bucketName,
        eventBusName: eventBus.eventBus.eventBusName,
      },
    );

    // Permissions for ingestion Lambda
    rawEventBucket.bucket.grantPut(footballEventIngesterLambda.lambdaFunction);
    eventBus.eventBus.grantPutEventsTo(
      footballEventIngesterLambda.lambdaFunction,
    );

    // Lambda: Data Processor
    const footballEventProcessorLambda = new FootballEventProcessor(
      this,
      "FootballEventProcessor",
      {
        tableName: matchEventsTable.table.tableName,
      },
    );
    matchEventsTable.table.grantWriteData(
      footballEventProcessorLambda.lambdaFunction,
    );
    eventBus.addProcessingLambda(footballEventProcessorLambda);

    // Lambda: Query
    const footballEventQueryLambda = new FootballEventQuery(
      this,
      "FootballEventQuery",
      {
        tableName: matchEventsTable.table.tableName,
      },
    );
    matchEventsTable.table.grantReadData(
      footballEventQueryLambda.lambdaFunction,
    );

    // Create API Gateway
    const api = new FootballAnalyticsApi(this, "FootballAnalyticsApi", {
      dataIngestionLambda: footballEventIngesterLambda.lambdaFunction,
      queryApiLambda: footballEventQueryLambda.lambdaFunction,
    });

    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.api.url,
    });
  }
}
