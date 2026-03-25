const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const url = process.argv[2] || 'https://archive.org/download/meraculous_202603/meraculous.mp4';
const output = process.argv[3] || 'extracted_audio.mp3';

console.log('Downloading and extracting audio...');

const ffmpeg = spawn('ffmpeg', [
  '-i', url,
  '-vn',
  '-acodec', 'libmp3lame',
  '-y',
  output
]);

ffmpeg.stderr.on('data', (data) => process.stderr.write(data));
ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log(`Audio extracted to: ${output}`);
  } else {
    console.error('Error extracting audio');
  }
});