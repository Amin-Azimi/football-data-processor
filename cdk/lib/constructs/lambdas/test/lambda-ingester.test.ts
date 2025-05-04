import { Construct } from "constructs";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { App, Stack } from "aws-cdk-lib";
import { describe, it, expect, jest } from "@jest/globals";
import * as path from "path";
import {
  FootballEventIngester,
  FootballEventIngesterProps,
} from "../lambda-ingester";

describe("FootballEventIngester", () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a NodejsFunction with correct properties", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const props: FootballEventIngesterProps = {
      bucketName: "TestBucket",
      eventBusName: "TestEventBus",
    };

    // Mock the NodejsFunction constructor with explicit typing
    const mockNodejsFunction = jest
      .fn<
        (
          scope: Construct,
          id: string,
          props?: nodejs.NodejsFunctionProps,
        ) => nodejs.NodejsFunction
      >()
      .mockImplementation(
        () =>
          ({
            node: { id: "Lambda" }, // Mock minimal node property for CDK construct
          }) as nodejs.NodejsFunction,
      );
    jest.spyOn(nodejs, "NodejsFunction").mockImplementation(mockNodejsFunction);

    // Act
    const ingester = new FootballEventIngester(stack, "TestIngester", props);

    // Assert
    expect(ingester.lambdaFunction).toBeDefined();
    expect(mockNodejsFunction).toHaveBeenCalledTimes(1);
    expect(mockNodejsFunction).toHaveBeenCalledWith(
      expect.any(Construct),
      "Lambda",
      expect.objectContaining({
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: "handler",
        environment: {
          BUCKET_NAME: props.bucketName,
          EVENT_BUS_NAME: props.eventBusName,
        },
        bundling: {
          externalModules: ["aws-sdk"],
          minify: true,
          sourceMap: false,
        },
      }),
    );
  });

  it("should set correct entry path for lambda function", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const props: FootballEventIngesterProps = {
      bucketName: "TestBucket",
      eventBusName: "TestEventBus",
    };

    // Mock path.join
    const pathJoinSpy = jest.spyOn(path, "join");

    // Mock NodejsFunction to avoid constructor issues
    jest.spyOn(nodejs, "NodejsFunction").mockImplementation(
      () =>
        ({
          node: { id: "Lambda" },
        }) as nodejs.NodejsFunction,
    );

    // Act
    new FootballEventIngester(stack, "TestIngester", props);

    // Assert
    expect(pathJoinSpy).toHaveBeenCalledWith(
      expect.any(String),
      "../../../../src/handlers/api/matches/eventDataIngester.ts",
    );
  });

  it("should pass correct scope and id to parent Construct", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const props: FootballEventIngesterProps = {
      bucketName: "TestBucket",
      eventBusName: "TestEventBus",
    };

    // Mock NodejsFunction to avoid constructor issues
    jest.spyOn(nodejs, "NodejsFunction").mockImplementation(
      () =>
        ({
          node: { id: "Lambda" },
        }) as nodejs.NodejsFunction,
    );

    // Act
    const ingester = new FootballEventIngester(stack, "TestIngester", props);

    // Assert
    expect(ingester.node.scope).toBe(stack);
    expect(ingester.node.id).toBe("TestIngester");
  });
});
