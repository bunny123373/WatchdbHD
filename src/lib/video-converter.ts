import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface ConversionOptions {
  inputUrl: string;
  outputDir: string;
  quality?: { label: string; height: number; bitrate: string }[];
  onProgress?: (progress: ConversionProgress) => void;
}

interface ConversionProgress {
  stage: "downloading" | "converting" | "processing" | "complete";
  percentage: number;
  message: string;
}

interface AudioTrackInfo {
  index: number;
  name: string;
  language: string;
  codec: string;
  bitrate: string;
}

interface ConversionResult {
  success: boolean;
  hlsUrl?: string;
  audioTracks?: AudioTrackInfo[];
  duration?: number;
  resolution?: string;
  error?: string;
}

const DEFAULT_QUALITIES = [
  { label: "1080p", height: 1080, bitrate: "5000k" },
  { label: "720p", height: 720, bitrate: "2800k" },
  { label: "480p", height: 480, bitrate: "1400k" },
  { label: "360p", height: 360, bitrate: "800k" },
];

export async function convertMp4ToHls(options: ConversionOptions): Promise<ConversionResult> {
  const { inputUrl, outputDir, quality = DEFAULT_QUALITIES, onProgress } = options;

  try {
    onProgress?.({ stage: "downloading", percentage: 0, message: "Fetching video info..." });

    const tempDir = path.join(outputDir, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    onProgress?.({ stage: "processing", percentage: 10, message: "Detecting audio tracks..." });

    const audioTracks = await detectAudioTracks(inputUrl);
    
    console.log("Detected audio tracks:", audioTracks);

    onProgress?.({ stage: "converting", percentage: 20, message: "Converting to HLS..." });

    const outputDirBase = path.join(outputDir, "hls");
    if (!fs.existsSync(outputDirBase)) {
      fs.mkdirSync(outputDirBase, { recursive: true });
    }

    const hlsUrl = await convertToHLS(inputUrl, outputDirBase, audioTracks, quality, (prog) => {
      const totalProgress = 20 + (prog * 0.7);
      onProgress?.({ stage: "converting", percentage: totalProgress, message: `Converting: ${prog}%` });
    });

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    onProgress?.({ stage: "complete", percentage: 100, message: "Conversion complete!" });

    return {
      success: true,
      hlsUrl: hlsUrl,
      audioTracks: audioTracks,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Conversion failed";
    console.error("Conversion error:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

async function detectAudioTracks(url: string): Promise<AudioTrackInfo[]> {
  return new Promise((resolve) => {
    const tracks: AudioTrackInfo[] = [];
    
    const ffprobe = spawn("ffprobe", [
      "-v", "quiet",
      "-print_format", "json",
      "-show_streams",
      "-select_streams", "a",
      url
    ]);

    let stdout = "";

    ffprobe.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code === 0) {
        try {
          const data = JSON.parse(stdout);
          const streams = data.streams || [];
          
          streams.forEach((stream: Record<string, unknown>, index: number) => {
            const tags = stream.tags as Record<string, string> | undefined;
            const lang = tags?.language || "und";
            const name = tags?.title || tags?.handler_name || `Track ${index + 1}`;
            
            const trackName = name.includes("English") ? "English" :
                             name.includes("Spanish") ? "Spanish" :
                             name.includes("Hindi") ? "Hindi" :
                             name.includes("Japanese") ? "Japanese" :
                             name.includes("Korean") ? "Korean" :
                             name.includes("Tamil") ? "Tamil" :
                             name.includes("Telugu") ? "Telugu" :
                             name;

            tracks.push({
              index: index,
              name: trackName,
              language: lang,
              codec: (stream.codec_name as string)?.toUpperCase() || "AAC",
              bitrate: stream.bit_rate ? `${Math.round(Number(stream.bit_rate) / 1000)}k` : "Unknown",
            });
          });
        } catch (e) {
          console.error("Failed to parse ffprobe output:", e);
        }
      }
      resolve(tracks);
    });

    ffprobe.on("error", () => {
      resolve([]);
    });
  });
}

async function convertToHLS(
  inputUrl: string,
  outputDir: string,
  _audioTracks: AudioTrackInfo[],
  qualities: { label: string; height: number; bitrate: string }[],
  _onProgress?: (progress: number) => void
): Promise<string> {
  const masterPlaylist = path.join(outputDir, "index.m3u8");
  
  let variantStreams = "";

  for (const q of qualities) {
    const variantDir = path.join(outputDir, `${q.height}p`);
    if (!fs.existsSync(variantDir)) {
      fs.mkdirSync(variantDir, { recursive: true });
    }

    const variantPlaylist = path.join(variantDir, "index.m3u8");

    await runFFmpegCommand([
      "-i", inputUrl,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-b:v", q.bitrate,
      "-b:a", "128k",
      "-vf", `scale=-2:${q.height}`,
      "-f", "hls",
      "-hls_time", "6",
      "-hls_list_size", "0",
      "-hls_segment_filename", path.join(variantDir, "segment_%03d.ts"),
      "-start_number", "0",
      variantPlaylist
    ]);

    const bandwidth = parseInt(q.bitrate) * 1000;
    variantStreams += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${getResolution(q.height)}\n`;
    variantStreams += `./${q.height}p/index.m3u8\n`;
  }

  const masterContent = `#EXTM3U
#EXT-X-VERSION:3
${variantStreams}`;

  fs.writeFileSync(masterPlaylist, masterContent);

  return `/api/hls/${path.basename(outputDir)}/index.m3u8`;
}

function getResolution(height: number): string {
  const aspectRatio = 16 / 9;
  const width = Math.round(height * aspectRatio);
  return `${width}x${height}`;
}

function runFFmpegCommand(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args);
    
    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      const timeMatch = output.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseFloat(timeMatch[3]);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

export default { convertMp4ToHls, detectAudioTracks };