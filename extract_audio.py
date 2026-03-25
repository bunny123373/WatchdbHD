from moviepy import VideoFileClip
import urllib.request
import os

def extract_audio_from_url(video_url, output_path=None):
    print(f"Downloading: {video_url}")
    
    temp_file = "temp_video.mp4"
    urllib.request.urlretrieve(video_url, temp_file)
    
    video = VideoFileClip(temp_file)
    if output_path is None:
        output_path = "extracted_audio.mp3"
    video.audio.write_audiofile(output_path)
    video.close()
    
    os.remove(temp_file)
    return output_path

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python extract_audio.py <video_url> [output_file]")
        sys.exit(1)
    
    video_url = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = extract_audio_from_url(video_url, output_file)
    print(f"Audio extracted to: {result}")