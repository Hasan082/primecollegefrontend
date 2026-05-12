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
    const text = await response.text().catch(() => "");
    const codeMatch = text.match(/<Code>(.+?)<\/Code>/);
    const code = codeMatch?.[1];

    if (code === "EntityTooLarge") {
      const maxMatch = text.match(/<MaxSizeAllowed>(\d+)<\/MaxSizeAllowed>/);
      const maxBytes = maxMatch ? parseInt(maxMatch[1], 10) : null;
      const maxMb = maxBytes ? Math.floor(maxBytes / (1024 * 1024)) : null;
      throw new Error(
        maxMb
          ? `File "${file.name}" is too large. Maximum allowed size is ${maxMb} MB.`
          : `File "${file.name}" exceeds the maximum allowed upload size.`
      );
    }

    throw new Error(`Upload failed for "${file.name}". Please try again.`);
  }

  return presign.key;
}
