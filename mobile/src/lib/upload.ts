import { Platform } from "react-native";

type UploadResult = {
  id: string;
  url: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
};

export async function uploadFile(
  uri: string,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  const BACKEND_URL = process.env.EXPO_PUBLIC_VIBECODE_BACKEND_URL!;

  const formData = new FormData();

  if (Platform.OS === "web") {
    // On web, fetch the blob from the URI and append as a File
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: mimeType });
    formData.append("file", file);
  } else {
    // On native, use the React Native format
    formData.append("file", { uri, type: mimeType, name: filename } as any);
  }

  const uploadResponse = await fetch(`${BACKEND_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await uploadResponse.json();
  if (!uploadResponse.ok) throw new Error(data.error || "Upload failed");
  return data.data;
}
