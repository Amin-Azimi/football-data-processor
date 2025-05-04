import { Construct } from "constructs";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { App, Stack } from "aws-cdk-lib";
import { describe, it, expect, jest } from "@jest/globals";
import * as path from "path";
import { FootballEventQuery, FootballEventQueryProps } from "../lambda-query";

describe("FootballEventQuery", () => {
  afterAll(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a NodejsFunction with correct properties", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const props: FootballEventQueryProps = {
      tableName: "TestTable",
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
            node: { id: "Function" }, // Mock minimal node property for CDK construct
          }) as nodejs.NodejsFunction,
      );
    jest.spyOn(nodejs, "NodejsFunction").mockImplementation(mockNodejsFunction);

    // Act
    const query = new FootballEventQuery(stack, "TestQuery", props);

    // Assert
    expect(query.lambdaFunction).toBeDefined();
    expect(mockNodejsFunction).toHaveBeenCalledTimes(1);
    expect(mockNodejsFunction).toHaveBeenCalledWith(
      expect.any(Construct),
      "Function",
      expect.objectContaining({
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: "handler",
        environment: {
          TABLE_NAME: props.tableName,
        },
      }),
    );
  });

  it("should set correct entry path for lambda function", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const props: FootballEventQueryProps = {
      tableName: "TestTable",
    };

    // Mock path.join
    const pathJoinSpy = jest.spyOn(path, "join");

    // Mock NodejsFunction to avoid constructor issues
    jest.spyOn(nodejs, "NodejsFunction").mockImplementation(
      () =>
        ({
          node: { id: "Function" },
        }) as nodejs.NodejsFunction,
    );

    // Act
    new FootballEventQuery(stack, "TestQuery", props);

    // Assert
    expect(pathJoinSpy).toHaveBeenCalledWith(
      expect.any(String),
      "../../../../src/handlers/api/matches/getEventDataStatistics.ts",
    );
  });

  it("should pass correct scope and id to parent Construct", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");
    const props: FootballEventQueryProps = {
      tableName: "TestTable",
    };

    // Mock NodejsFunction to avoid constructor issues
    jest.spyOn(nodejs, "NodejsFunction").mockImplementation(
      () =>
        ({
          node: { id: "Function" },
        }) as nodejs.NodejsFunction,
    );

    // Act
    const query = new FootballEventQuery(stack, "TestQuery", props);

    // Assert
    expect(query.node.scope).toBe(stack);
    expect(query.node.id).toBe("TestQuery");
  });
});
