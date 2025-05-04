# Architecture Overview

This document provides a high-level overview of the serverless application designed for processing and analyzing football match data in real-time. The application leverages AWS services to ensure scalability, reliability, and cost-efficiency.

## System Components

The application consists of the following AWS services, defined using AWS CDK in TypeScript:

- **API Gateway**: Exposes REST endpoints for ingesting match events (`POST /ingest`) and querying statistics (`GET /matches/{match_id}/goals`, `GET /matches/{match_id}/passes`).
- **Lambda Functions**: Handle data ingestion, processing, and querying. Each function is stateless and optimized for serverless execution.
- **Ingest Lambda**: Receives match events via API Gateway and publishes them to EventBridge.
- **Process Lambda**: Enriches events (e.g., adds a `season` field) and stores them in DynamoDB.
- **Query Lambda**: Retrieves aggregated statistics from DynamoDB.
- **DynamoDB**: Stores enriched match events with `match_id` as the partition key and `event_id` as the sort key for efficient querying.
- **EventBridge**: Routes events from the ingest Lambda to the process Lambda for real-time processing.
- **IAM Roles**: Configured with least-privilege permissions to ensure security.

## Data Flow

1. **Event Ingestion**:
- A client sends a match event (e.g., a goal) to the `POST /ingest` endpoint via API Gateway.
- The ingest Lambda parses the event, generates a unique `event_id`, and publishes it to an EventBridge event bus.

2. **Event Processing**:
- EventBridge triggers the process Lambda based on the event source (`football.match`).
- The process Lambda enriches the event by adding a `season` field derived from the event’s `timestamp`.
- The enriched event is stored in the DynamoDB table.

3. **Statistics Querying**:
- A client queries match statistics (e.g., total goals) via `GET /matches/{match_id}/goals` or `GET /matches/{match_id}/passes`.
- The query Lambda retrieves relevant events from DynamoDB using a query operation with the `match_id` and `event_type` prefix.
- The Lambda returns the aggregated count (e.g., number of goals).

## Architecture Diagram (Textual Representation)

```
[Client] --> [API Gateway]
                      |
                      v
[Ingest Lambda] --> [EventBridge] --> [Process Lambda] --> [DynamoDB]
                      |
                      v
[Query Lambda] <--- [API Gateway] <--- [Client]
```

*Note*: A visual diagram can be generated using tools like draw.io, but this textual representation is provided for simplicity.

    ## Design Choices

- **Serverless Architecture**: Chosen for automatic scaling, pay-per-use pricing, and reduced operational overhead. Lambda functions handle variable workloads efficiently.
- **EventBridge**: Used for event-driven processing due to its simplicity and integration with AWS services. It avoids the operational complexity of Amazon MSK (Kafka) for this use case.
- **DynamoDB Schema**: The `match_id` partition key ensures even data distribution across matches, while the `event_id` sort key (prefixed with `event_type`) enables efficient queries for specific event types (e.g., goals, passes).
- **TypeScript**: Used for type safety, improved maintainability, and alignment with the AWS CDK and Lambda codebases.

## Scalability and Performance

- **API Gateway and Lambda**: Automatically scale to handle high request volumes. Throttling and concurrency limits can be configured as needed.
- **DynamoDB**: Uses on-demand billing to scale with write and read traffic. The schema design minimizes hot partitions by distributing data across `match_id` values.
- **EventBridge**: Handles event routing with low latency and high throughput, suitable for real-time match data.
- **Optimization**: Lambda functions are lightweight, with minimal dependencies, to reduce cold start times. DynamoDB queries use efficient key conditions to minimize latency.

## Security

- **IAM Roles**: Each Lambda function has a role with least-privilege permissions, granting only the necessary actions (e.g., `dynamodb:PutItem` for the process Lambda).
- **API Gateway**: Configured with default security settings. Additional authentication (e.g., IAM or Cognito) can be added for production use.
- **Data Validation**: The ingest Lambda validates input data to prevent malformed events from entering the system.

## Future Enhancements

- **Amazon MSK**: For high-throughput streaming, MSK could replace EventBridge to handle larger volumes of match events.
- **Step Functions**: To orchestrate complex workflows, such as multi-step event processing or error handling.
- **Monitoring**: Integrate CloudWatch metrics and alarms for real-time monitoring of Lambda errors, API Gateway latency, and DynamoDB throughput.

    This architecture ensures a scalable, cost-efficient, and maintainable solution for processing football match data, meeting the challenge’s requirements for real-time processing and querying.