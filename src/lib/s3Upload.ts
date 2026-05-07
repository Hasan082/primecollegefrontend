export type S3Presign = {
  upload_url: string;
  fields: Record<string, string>;
  key: string;
  public_url?: string;
};

export async function uploadFileToS3(
  presign: S3Presign,
  file: File,
): Promise<string> {
  const formData = new FormData();
  Object.entries(presign.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("Content-Type", file.type);
  formData.append("file", file);

  const response = await fetch(presign.upload_url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Direct upload to S3 failed.");
  }

  return presign.key;
}
