import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const RAW_EVENTS_BUCKET = process.env.BUCKET_NAME ?? "RawEventBucket";

export const client = new S3Client();

export const storeInS3 = async (body: object, key: string): Promise<void> => {
  console.log(
    `Storing object in S3 bucket ${RAW_EVENTS_BUCKET} with key ${key}`,
  );
  const params = {
    Bucket: RAW_EVENTS_BUCKET,
    Key: key,
    Body: JSON.stringify(body),
    ContentType: "application/json",
  };

  try {
    const uploadCommand = new PutObjectCommand(params);
    await client.send(uploadCommand);
    console.log(
      `Successfully stored object in S3 bucket ${RAW_EVENTS_BUCKET} with key ${key}`,
    );
  } catch (error) {
    console.error(
      `Error storing object in S3 bucket ${RAW_EVENTS_BUCKET} with key ${key}:`,
      error,
    );
    throw error;
  }
};
