const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

/**
 * 从视频文件提取音频（输出 wav 格式，方便后续 ASR）
 */
function extractAudio(videoPath, outputDir) {
  return new Promise((resolve, reject) => {
    const basename = path.basename(videoPath, path.extname(videoPath));
    const audioPath = path.join(outputDir, `${basename}.wav`);

    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .output(audioPath)
      .on('end', () => resolve(audioPath))
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * 获取视频/音频文件的媒体信息
 */
function getMediaInfo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve({
        duration: metadata.format.duration,
        size: metadata.format.size,
        format: metadata.format.format_name,
        streams: metadata.streams.map(s => ({
          type: s.codec_type,
          codec: s.codec_name,
          width: s.width,
          height: s.height,
          sample_rate: s.sample_rate,
        })),
      });
    });
  });
}

module.exports = { extractAudio, getMediaInfo };
