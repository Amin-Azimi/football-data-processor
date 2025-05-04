import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export interface FootballEventIngesterProps {
    bucketName: string;
    eventBusName: string;
}

export class FootballEventIngester extends Construct {
    public readonly lambdaFunction: nodejs.NodejsFunction;

    constructor(scope: Construct, id: string, props: FootballEventIngesterProps) {
        super(scope, id);

        this.lambdaFunction = new nodejs.NodejsFunction(this, 'Lambda', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, '../../../../src/handlers/api/matches/eventDataIngester.ts'),
            handler: 'handler',
            environment: {
                BUCKET_NAME: props.bucketName,
                EVENT_BUS_NAME: props.eventBusName,
            },
            bundling: {
                externalModules: ['aws-sdk'],
                minify: true,
                sourceMap: false,
            },
        });
    }
}