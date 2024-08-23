import { S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env";

export const s3 = new S3Client({
  region: env.FILE_STORAGE_REGION,
  credentials: {
    accessKeyId: env.FILE_STORAGE_KEY,
    secretAccessKey: env.FILE_STORAGE_SECRET,
  },
  endpoint: env.FILE_STORAGE_ENDPOINT,
});
