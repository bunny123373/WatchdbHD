const LULUSTREAM_API_KEY = process.env.LULUSTREAM_API_KEY;
const LULUSTREAM_API_URL = "https://api.lulustream.com";

export interface LulustreamAccountInfo {
  msg: string;
  server_time: string;
  status: number;
  result: {
    login: string;
    premium_expire: string;
    storage_left: string;
    storage_used: number;
    email: string;
    files_total: number;
    premium: number;
    balance: string;
  };
  requests_available: number;
}

export interface LulustreamFile {
  id: string;
  filename: string;
  title: string;
  description: string;
  size: number;
  download_count: number;
  linked: number;
  created: string;
  modified: string;
  status: string;
  embed_code: string;
  thumb: string;
  file_code: string;
}

export interface LulustreamUploadResponse {
  msg: string;
  status: number;
  result: {
    id: string;
    title: string;
    description: string;
    size: number;
    download_count: number;
    created: string;
    modified: string;
    status: string;
    embed_code: string;
    thumb: string;
    file_code: string;
    download_url: string;
    streaming_url: string;
  };
}

export async function getAccountInfo(): Promise<LulustreamAccountInfo | null> {
  try {
    const response = await fetch(
      `${LULUSTREAM_API_URL}/account/info?key=${LULUSTREAM_API_KEY}`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Lulustream getAccountInfo error:", error);
    return null;
  }
}

export async function getFileList(): Promise<LulustreamFile[]> {
  try {
    const response = await fetch(
      `${LULUSTREAM_API_URL}/file/list?key=${LULUSTREAM_API_KEY}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error("Lulustream getFileList error:", error);
    return [];
  }
}

export async function getFileInfo(fileCode: string): Promise<LulustreamFile | null> {
  try {
    const response = await fetch(
      `${LULUSTREAM_API_URL}/file/info?key=${LULUSTREAM_API_KEY}&file_code=${fileCode}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error("Lulustream getFileInfo error:", error);
    return null;
  }
}

export async function remoteUpload(
  url: string,
  title?: string
): Promise<LulustreamUploadResponse | null> {
  try {
    const formData = new URLSearchParams();
    formData.append("key", LULUSTREAM_API_KEY || "");
    formData.append("url", url);
    if (title) formData.append("title", title);

    const response = await fetch(`${LULUSTREAM_API_URL}/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 200 ? data : null;
  } catch (error) {
    console.error("Lulustream remoteUpload error:", error);
    return null;
  }
}

export async function deleteFile(fileCode: string): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append("key", LULUSTREAM_API_KEY || "");
    formData.append("file_code", fileCode);

    const response = await fetch(`${LULUSTREAM_API_URL}/file/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 200;
  } catch (error) {
    console.error("Lulustream deleteFile error:", error);
    return false;
  }
}

export function getEmbedCode(fileCode: string): string {
  return `https://lulustream.com/embed/${fileCode}`;
}

export function getDownloadUrl(fileCode: string): string {
  return `https://lulustream.com/${fileCode}`;
}
