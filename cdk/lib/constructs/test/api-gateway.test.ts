import { App, Stack } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Template, Match } from "aws-cdk-lib/assertions";
import { FootballAnalyticsApi } from "../api-gateway";

describe("FootballAnalyticsApi", () => {
  let stack: Stack;
  let mockIngestLambda: lambda.Function;
  let mockQueryLambda: lambda.Function;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  beforeEach(() => {
    const app = new App();
    stack = new Stack(app, "TestStack");

    // Mock Lambda functions
    mockIngestLambda = new lambda.Function(stack, "MockIngestLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromInline("exports.handler = () => {};"),
    });

    mockQueryLambda = new lambda.Function(stack, "MockQueryLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: lambda.Code.fromInline("exports.handler = () => {};"),
    });

    new FootballAnalyticsApi(stack, "FootballAnalyticsApi", {
      dataIngestionLambda: mockIngestLambda,
      queryApiLambda: mockQueryLambda,
    });
  });

  it("creates the REST API with correct name and description", () => {
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "Football Analytics Service",
      Description: "API for football match analytics",
    });
  });

  it("creates the /ingest POST method integrated with the ingestion lambda", () => {
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::ApiGateway::Method", {
      HttpMethod: "POST",
      Integration: Match.objectLike({
        IntegrationHttpMethod: "POST",
        Type: "AWS_PROXY",
        Uri: Match.objectLike({
          "Fn::Join": Match.anyValue(), // This allows the synthesized Lambda URI
        }),
      }),
    });
  });

  it("creates /matches/{match_id}/goals and /passes GET methods integrated with the query lambda", () => {
    const template = Template.fromStack(stack);

    const getMethods = template.findResources("AWS::ApiGateway::Method", {
      Properties: {
        HttpMethod: "GET",
      },
    });

    const getMethodValues = Object.values(getMethods);

    expect(getMethodValues.length).toBe(2);

    for (const method of getMethodValues) {
      expect(method.Properties?.Integration?.Type).toBe("AWS_PROXY");
      expect(method.Properties?.Integration?.Uri).toEqual(
        expect.objectContaining({
          "Fn::Join": expect.any(Array),
        }),
      );
    }
  });
});
