import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

import { env } from "@/env";

export const s3 = new S3Client({
  region: env.FILE_STORAGE_REGION,
  credentials: {
    accessKeyId: env.FILE_STORAGE_KEY,
    secretAccessKey: env.FILE_STORAGE_SECRET,
  },
  endpoint: env.FILE_STORAGE_ENDPOINT,
});

type Options = {
  file: { type: string; size: number; checksum: string };
  expiresIn?: number;
  metadata?: Record<string, string>;
};

export async function getUploadURL(options: Options) {
  const file = options.file;
  const metadata = options.metadata ?? {};
  const expiresIn = options.expiresIn ?? 60;
  const key = !env.FILE_STORAGE_ENDPOINT.startsWith("http://localhost")
    ? crypto.randomBytes(32).toString("hex")
    : `${env.FILE_STORAGE_BUCKET}/${crypto.randomBytes(32).toString("hex")}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: env.FILE_STORAGE_BUCKET,
      Key: key,
      ContentType: file.type,
      ContentLength: file.size,
      ChecksumSHA256: file.checksum,
      Metadata: metadata,
    }),
    {
      expiresIn,
    }
  );

  return { url, key };
}

export async function deleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: env.FILE_STORAGE_BUCKET,
      Key: key,
    })
  );
}
