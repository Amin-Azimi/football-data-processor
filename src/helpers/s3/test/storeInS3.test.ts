import { storeInS3, client } from "../storeInS3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

jest.mock("@aws-sdk/client-s3", () => {
  const actual = jest.requireActual("@aws-sdk/client-s3");
  return {
    ...actual,
    S3Client: jest.fn(() => ({
      send: jest.fn(),
    })),
  };
});

describe("storeInS3", () => {
  const mockSend = jest.fn();

  beforeAll(() => {
    (client.send as any) = mockSend;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockData = { event: "test" };
  const mockKey = "2025-05-04/match-123.json";

  it("should upload object to S3 with correct parameters", async () => {
    mockSend.mockResolvedValueOnce({});

    await storeInS3(mockData, mockKey);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0];

    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: process.env.BUCKET_NAME ?? "RawEventBucket",
      Key: mockKey,
      Body: JSON.stringify(mockData),
      ContentType: "application/json",
    });
  });

  it("should throw error if S3 upload fails", async () => {
    const error = new Error("Upload failed");
    mockSend.mockRejectedValueOnce(error);

    await expect(storeInS3(mockData, mockKey)).rejects.toThrow("Upload failed");

    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});
