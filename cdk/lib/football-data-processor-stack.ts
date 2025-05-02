import * as cdk from 'aws-cdk-lib';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';

import * as path from 'path';
import { Construct } from 'constructs';

export class FootballDataProcessorStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const rawEventBucket = new s3.Bucket(this, 'RawEventBucket', {
            bucketName: 'football-analytics-raw-events',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const footballEventIngesterLambda = new nodejs.NodejsFunction(this, 'FootballEventIngesterLambda', {
            runtime: lambda.Runtime.NODEJS_22_X,
            entry: path.join(__dirname, '../../src/handlers/api/matches/eventDataIngester.ts'),
            handler: 'handler',
            environment: {
                BUCKET_NAME: rawEventBucket.bucketName,
            },
            bundling: {
                externalModules: ['aws-sdk'],
                minify: true,
                sourceMap: true,
            },
        })

        const api = new apiGateway.RestApi(this, 'FootballAnalyticsApi', {
            restApiName: 'Football Analytics Service',
            description: 'API for football match analytics',
        });

        const ingestResource = api.root.addResource('ingest');
        ingestResource.addMethod('POST', new apiGateway.LambdaIntegration(footballEventIngesterLambda));

        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url
        })
    }
}
