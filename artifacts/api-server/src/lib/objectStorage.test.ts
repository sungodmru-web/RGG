import { ObjectStorageService, privateObjectPath } from "./objectStorage";

describe("privateObjectPath", () => {
  it("returns a path relative to PRIVATE_OBJECT_DIR", () => {
    expect(privateObjectPath("upload-id")).toBe("/objects/uploads/upload-id");
  });
});

describe("ObjectStorageService provider selection", () => {
  const original = {
    provider: process.env.OBJECT_STORAGE_PROVIDER,
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  };

  afterEach(() => {
    const values = {
      OBJECT_STORAGE_PROVIDER: original.provider,
      S3_ENDPOINT: original.endpoint,
      S3_REGION: original.region,
      S3_BUCKET: original.bucket,
      S3_ACCESS_KEY_ID: original.accessKeyId,
      S3_SECRET_ACCESS_KEY: original.secretAccessKey,
    };
    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });

  it("keeps Replit storage as the default until S3 is explicitly selected", () => {
    delete process.env.OBJECT_STORAGE_PROVIDER;
    expect(() => new ObjectStorageService()).not.toThrow();
  });

  it("fails explicitly when S3 configuration is incomplete", () => {
    process.env.OBJECT_STORAGE_PROVIDER = "s3";
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_REGION;
    delete process.env.S3_BUCKET;
    delete process.env.S3_ACCESS_KEY_ID;
    delete process.env.S3_SECRET_ACCESS_KEY;
    expect(() => new ObjectStorageService()).toThrow(
      "S3_ENDPOINT is required for S3 object storage",
    );
  });
});