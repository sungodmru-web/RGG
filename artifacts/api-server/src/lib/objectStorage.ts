import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { File, Storage } from "@google-cloud/storage";

const SIDECAR = "http://127.0.0.1:1106";
const DEFAULT_SIGNED_URL_TTL_SECONDS = 900;

export class ObjectNotFoundError extends Error {}

function isS3NotFoundError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return (
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey" ||
    candidate.$metadata?.httpStatusCode === 404
  );
}

type Provider = "replit" | "s3";
type StorageObject = { provider: Provider; bucket: string; key: string; file?: File };

function provider(): Provider {
  const configured = process.env.OBJECT_STORAGE_PROVIDER?.trim().toLowerCase();
  // Keep the live Replit deployment unchanged until the owner explicitly selects
  // the external provider with OBJECT_STORAGE_PROVIDER=s3.
  if (!configured) return "replit";
  if (configured === "replit" || configured === "s3") return configured;
  throw new Error("OBJECT_STORAGE_PROVIDER must be either replit or s3");
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required for S3 object storage`);
  return value;
}

function s3Config() {
  const endpoint = required("S3_ENDPOINT");
  const region = required("S3_REGION");
  const bucket = required("S3_BUCKET");
  const accessKeyId = required("S3_ACCESS_KEY_ID");
  const secretAccessKey = required("S3_SECRET_ACCESS_KEY");
  try {
    new URL(endpoint);
  } catch {
    throw new Error("S3_ENDPOINT must be a valid URL");
  }
  return { endpoint, region, bucket, accessKeyId, secretAccessKey };
}

let replitClient: Storage | undefined;
function getReplitClient() {
  replitClient ??= new Storage({
    credentials: {
      audience: "replit", subject_token_type: "access_token",
      token_url: `${SIDECAR}/token`, type: "external_account",
      credential_source: {
        url: `${SIDECAR}/credential`,
        format: { type: "json", subject_token_field_name: "access_token" },
      },
      universe_domain: "googleapis.com",
    },
    projectId: "",
  });
  return replitClient;
}

let s3Client: S3Client | undefined;
function getS3Client(config: ReturnType<typeof s3Config>) {
  s3Client ??= new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return s3Client;
}

function parse(path: string) {
  const parts = path.replace(/^\/+/, "").split("/");
  const bucketName = parts.shift();
  if (!bucketName || parts.length === 0) throw new Error("Invalid object path");
  return { bucketName, objectName: parts.join("/") };
}

export function privateObjectPath(uploadId: string) {
  return `/objects/uploads/${uploadId}`;
}

function privateDir() {
  const value = process.env.PRIVATE_OBJECT_DIR;
  if (!value) throw new Error("PRIVATE_OBJECT_DIR is not configured");
  return value.replace(/\/+$/, "");
}

function s3Key(objectPath: string) {
  if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
  return `${privateDir().replace(/^\/+|\/+$/g, "")}/${objectPath.slice("/objects/".length)}`;
}

async function replitSigned(bucketName: string, objectName: string, method: "PUT" | "GET") {
  const response = await fetch(`${SIDECAR}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName, object_name: objectName, method,
      expires_at: new Date(Date.now() + DEFAULT_SIGNED_URL_TTL_SECONDS * 1000).toISOString(),
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error("Object storage signing failed");
  const body = await response.json() as { signed_url?: string };
  if (!body.signed_url) throw new Error("Object storage returned no URL");
  return body.signed_url;
}

export class ObjectStorageService {
  private provider = provider();
  private config = this.provider === "s3" ? s3Config() : undefined;

  private s3() {
    const config = this.config ?? s3Config();
    return { config, client: getS3Client(config) };
  }

  async createUpload() {
    const uploadId = randomUUID();
    const objectPath = privateObjectPath(uploadId);
    if (this.provider === "replit") {
      const key = `${privateDir()}/uploads/${uploadId}`;
      const { bucketName, objectName } = parse(key);
      return { uploadURL: await replitSigned(bucketName, objectName, "PUT"), objectPath };
    }
    const { config, client } = this.s3();
    const uploadURL = await getSignedUrl(
      client,
      new PutObjectCommand({ Bucket: config.bucket, Key: s3Key(objectPath) }),
      { expiresIn: DEFAULT_SIGNED_URL_TTL_SECONDS },
    );
    return { uploadURL, objectPath };
  }

  async file(objectPath: string): Promise<StorageObject> {
    if (this.provider === "replit") {
      const { bucketName, objectName } = parse(`${privateDir()}/${objectPath.slice("/objects/".length)}`);
      const file = getReplitClient().bucket(bucketName).file(objectName);
      const [exists] = await file.exists();
      if (!exists) throw new ObjectNotFoundError();
      return { provider: "replit", bucket: bucketName, key: objectName, file };
    }
    const { config, client } = this.s3();
    try {
      await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: s3Key(objectPath) }));
    } catch (error) {
      if (isS3NotFoundError(error)) throw new ObjectNotFoundError();
      throw error;
    }
    return { provider: "s3", bucket: config.bucket, key: s3Key(objectPath) };
  }

  async metadata(objectPath: string) {
    const object = await this.file(objectPath);
    if (object.provider === "replit") return object.file!.getMetadata().then(([value]) => value);
    const { client } = this.s3();
    const value = await client.send(new HeadObjectCommand({ Bucket: object.bucket, Key: object.key }));
    return { size: value.ContentLength, contentType: value.ContentType };
  }

  async firstBytes(objectPath: string, end = 15) {
    const object = await this.file(objectPath);
    if (object.provider === "replit") {
      const [bytes] = await object.file!.download({ start: 0, end });
      return bytes;
    }
    const { client } = this.s3();
    const value = await client.send(new GetObjectCommand({
      Bucket: object.bucket, Key: object.key, Range: `bytes=0-${end}`,
    }));
    return Buffer.from(await value.Body!.transformToByteArray());
  }

  async delete(objectPath: string) {
    const object = await this.file(objectPath);
    if (object.provider === "replit") {
      await object.file!.delete();
      return;
    }
    await this.s3().client.send(new DeleteObjectCommand({ Bucket: object.bucket, Key: object.key }));
  }

  async response(object: StorageObject) {
    if (object.provider === "replit") {
      const [metadata] = await object.file!.getMetadata();
      const stream = Readable.toWeb(object.file!.createReadStream()) as ReadableStream;
      return new Response(stream, {
        headers: {
          "Content-Type": String(metadata.contentType ?? "application/octet-stream"),
          "Cache-Control": "private, max-age=300",
          ...(metadata.size ? { "Content-Length": String(metadata.size) } : {}),
        },
      });
    }
    const value = await this.s3().client.send(new GetObjectCommand({
      Bucket: object.bucket, Key: object.key,
    }));
    return new Response(value.Body?.transformToWebStream(), {
      headers: {
        "Content-Type": String(value.ContentType ?? "application/octet-stream"),
        "Cache-Control": "private, max-age=300",
        ...(value.ContentLength ? { "Content-Length": String(value.ContentLength) } : {}),
      },
    });
  }

  async signedAccess(objectPath: string) {
    const object = await this.file(objectPath);
    if (object.provider === "replit") return replitSigned(object.bucket, object.key, "GET");
    return getSignedUrl(
      this.s3().client,
      new GetObjectCommand({ Bucket: object.bucket, Key: object.key }),
      { expiresIn: DEFAULT_SIGNED_URL_TTL_SECONDS },
    );
  }

  normalize(raw: string) {
    if (raw.startsWith("/objects/")) return raw;
    const prefix = `${privateDir()}/`;
    const pathname = new URL(raw).pathname;
    return pathname.startsWith(prefix) ? `/objects/${pathname.slice(prefix.length)}` : pathname;
  }
}