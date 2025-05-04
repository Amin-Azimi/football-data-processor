import { Construct } from "constructs";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export interface FootballEventQueryProps {
  tableName: string;
}

export class FootballEventQuery extends Construct {
  public readonly lambdaFunction: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: FootballEventQueryProps) {
    super(scope, id);

    this.lambdaFunction = new nodejs.NodejsFunction(this, "Function", {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(
        __dirname,
        "../../../../src/handlers/api/matches/getEventDataStatistics.ts",
      ),
      handler: "handler",
      environment: {
        TABLE_NAME: props.tableName,
      },
    });
  }
}
