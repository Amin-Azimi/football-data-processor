# Football Match Data Serverless Application

This is a serverless application built with AWS CDK (TypeScript) and TypeScript for processing and analyzing football match data in real-time.

## Prerequisites

- Node.js (>= 22.x)
- AWS CLI (configured with credentials)
- AWS CDK Toolkit (`npm install -g aws-cdk`)
- TypeScript (`npm install -g typescript`)

## Setup

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd football-data-processor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Bootstrap the CDK environment (if not already done):
   ```bash
   cdk bootstrap aws://<account-id>/<region>
   ```

4. Deploy the stack:
   ```bash
   cdk deploy
   ```

5. Note the API Gateway endpoint URL from the CDK output.

## Architecture

For a detailed overview of the application's architecture, including system components, data flow, and design choices, refer to `ARCHITECTURE.md`.

## Testing

1. Import the Postman collection (`public/postman.json`) into Postman.
2. Update the `baseUrl` variable in Postman with the API Gateway endpoint.
3. Alternatively, refer to the OpenAPI specification (`public/openapi.yaml`) to explore the API using tools like Swagger UI or to generate client code.
4. Test the following endpoints:
   - **POST /ingest**: Send a match event (see example payload below).
   - **GET /matches/{match_id}/goals**: Get total goals for a match.
   - **GET /matches/{match_id}/passes**: Get total passes for a match.

### Example Payload for POST /ingest

```json
{
   "match_id": "000001",
   "event_type": "goal",
   "team": "Team A",
   "player": "Player 1",
   "timestamp": "2023-10-15T14:30:00Z"
}
```

## Test

To run unit tests for the application:
```bash
npm run test
```

This command executes Jest tests in-band, as configured in the `package.json`.

## Development

- To lint the code and automatically fix issues:
  ```bash
  npm run lint
  ```

## Cleanup

To delete the stack and all resources:
```bash
cdk destroy
```

## Notes

- The DynamoDB table uses `match_id` as the partition key and `event_id` as the sort key for efficient querying.
- IAM roles follow the least-privilege principle.
- The application is fully serverless, ensuring scalability and cost-efficiency.