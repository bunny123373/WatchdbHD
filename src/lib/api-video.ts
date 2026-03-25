interface ApiVideoConfig {
  apiKey: string;
}

interface UploadResult {
  success: boolean;
  videoId?: string;
  hlsUrl?: string;
  assets?: {
    player?: string;
    hls?: string;
    thumbnail?: string;
    mp4?: string;
  };
  audioTracks?: { language: string; name: string }[];
  sourceAudioTracks?: { language: string; name: string; codec: string }[];
  error?: string;
}

export class ApiVideoService {
  private apiKey: string;
  private baseUrl = "https://ws.api.video";

  constructor(config: ApiVideoConfig) {
    this.apiKey = config.apiKey;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  }

  async uploadFromUrl(videoUrl: string, title?: string): Promise<UploadResult> {
    try {
      console.log("Creating upload request...");

      const createResponse = await this.fetchWithAuth(`${this.baseUrl}/videos`, {
        method: "POST",
        body: JSON.stringify({
          title: title || "Uploaded Video",
          encoding: "advanced",
          specifications: [
            { height: 1080, bitrate: 5000 },
            { height: 720, bitrate: 2800 },
            { height: 480, bitrate: 1400 },
          ],
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Failed to create video: ${error}`);
      }

      const videoData = await createResponse.json();
      const videoId = videoData.videoId;
      console.log(`Created video with ID: ${videoId}`);

      console.log("Uploading from URL...");
      const uploadResponse = await this.fetchWithAuth(
        `${this.baseUrl}/videos/${videoId}/upload`,
        {
          method: "POST",
          body: JSON.stringify({ source: videoUrl }),
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        throw new Error(`Failed to upload: ${error}`);
      }

      console.log("Upload initiated, waiting for processing...");
      const uploadData = await uploadResponse.json();

      console.log("Fetching video details for audio track info...");
      const detailsResponse = await this.fetchWithAuth(`${this.baseUrl}/videos/${videoId}`);
      const details = detailsResponse.ok ? await detailsResponse.json() : {};

      const sourceAudioTracks = this.parseAudioTracks(details);

      return {
        success: true,
        videoId,
        hlsUrl: uploadData.assets?.hls,
        assets: uploadData.assets,
        sourceAudioTracks,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      console.error("Api.video error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private parseAudioTracks(details: Record<string, unknown>): { language: string; name: string; codec: string }[] {
    const tracks: { language: string; name: string; codec: string }[] = [];
    const source = details.source as Record<string, unknown> | undefined;
    const metadata = source?.metadata as Record<string, unknown> | undefined;
    
    if (metadata?.audioTracks) {
      const audioTracks = metadata.audioTracks as unknown[];
      audioTracks.forEach((track: unknown) => {
        const t = track as Record<string, unknown>;
        tracks.push({
          language: (t.language as string) || "und",
          name: (t.name as string) || (t.language as string) || "Audio",
          codec: (t.codec as string) || "AAC",
        });
      });
    }

    if (tracks.length === 0) {
      tracks.push({ language: "en", name: "Default", codec: "AAC" });
    }

    return tracks;
  }

  async getVideoStatus(videoId: string): Promise<{ status: string; assets?: Record<string, string> }> {
    try {
      const response = await this.fetchWithAuth(`${this.baseUrl}/videos/${videoId}`);
      if (!response.ok) throw new Error("Failed to get video status");
      const data = await response.json();
      return { status: data.status, assets: data.assets };
    } catch {
      return { status: "error" };
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`${this.baseUrl}/videos/${videoId}`, { method: "DELETE" });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export function createApiVideoService(apiKey?: string): ApiVideoService | null {
  const key = apiKey || process.env.API_VIDEO_API_KEY;
  if (!key) {
    console.warn("API_VIDEO_API_KEY not configured");
    return null;
  }
  return new ApiVideoService({ apiKey: key });
}

export default { ApiVideoService, createApiVideoService };