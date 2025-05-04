import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";
import { App, Stack } from "aws-cdk-lib";
import { describe, it, expect, jest } from "@jest/globals";
import { MatchEventsTable } from "../dynamon-db";

describe("MatchEventsTable", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it("should create a DynamoDB table with correct properties", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");

    // Mock the Table constructor
    const mockTable = jest
      .fn<
        (
          scope: Construct,
          id: string,
          props?: dynamodb.TableProps,
        ) => dynamodb.Table
      >()
      .mockImplementation(
        () =>
          ({
            node: { id: "MatchEventsTable" },
          }) as dynamodb.Table,
      );
    jest.spyOn(dynamodb, "Table").mockImplementation(mockTable);

    // Act
    const tableConstruct = new MatchEventsTable(stack, "TestTable");

    // Assert
    expect(tableConstruct.table).toBeDefined();
    expect(mockTable).toHaveBeenCalledTimes(1);
    expect(mockTable).toHaveBeenCalledWith(
      expect.any(Construct),
      "MatchEventsTable",
      expect.objectContaining({
        tableName: "MatchEvents",
        partitionKey: { name: "match_id", type: dynamodb.AttributeType.STRING },
        sortKey: {
          name: "event_type_timestamp",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        timeToLiveAttribute: "expiry",
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
    );
  });

  it("should pass correct scope and id to parent Construct", () => {
    // Arrange
    const app = new App();
    const stack = new Stack(app, "TestStack");

    // Mock Table to avoid constructor issues
    jest.spyOn(dynamodb, "Table").mockImplementation(
      () =>
        ({
          node: { id: "MatchEventsTable" },
        }) as dynamodb.Table,
    );

    // Act
    const tableConstruct = new MatchEventsTable(stack, "TestTable");

    // Assert
    expect(tableConstruct.node.scope).toBe(stack);
    expect(tableConstruct.node.id).toBe("TestTable");
  });
});
