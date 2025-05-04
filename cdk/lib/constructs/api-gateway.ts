import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";

export interface FootballApiProps {
  dataIngestionLambda: lambda.IFunction;
  queryApiLambda: lambda.IFunction;
}

export class FootballAnalyticsApi extends Construct {
  public api: apiGateway.RestApi;

  constructor(scope: Construct, id: string, props: FootballApiProps) {
    super(scope, id);
    this.api = new apiGateway.RestApi(this, "FootballAnalyticsApi", {
      restApiName: "Football Analytics Service",
      description: "API for football match analytics",
    });

    // add resource for data ingestion
    const ingestResource = this.api.root.addResource("ingest");
    ingestResource.addMethod(
      "POST",
      new apiGateway.LambdaIntegration(props.dataIngestionLambda),
    );

    // Add resources and methods for querying match events
    const matchesResource = this.api.root.addResource("matches");
    const matchIdResource = matchesResource.addResource("{match_id}");
    const lambdaIntegration = new apiGateway.LambdaIntegration(
      props.queryApiLambda,
    );

    // /matches/{match_id}/goals
    const goalsResource = matchIdResource.addResource("goals");
    goalsResource.addMethod("GET", lambdaIntegration);

    // /matches/{match_id}/passes
    const passesResource = matchIdResource.addResource("passes");
    passesResource.addMethod("GET", lambdaIntegration);
  }
}
