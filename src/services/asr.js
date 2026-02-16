/**
 * ASR 服务接口（预留）
 * 具体平台待定，先定义统一接口
 */

class ASRService {
  constructor(provider = 'placeholder') {
    this.provider = provider;
  }

  /**
   * 对音频文件进行语音识别
   * @param {string} audioPath - wav 音频文件路径
   * @returns {Promise<{text: string, segments: Array}>}
   */
  async transcribe(audioPath) {
    // TODO: 接入具体 ASR 平台后实现
    throw new Error(`ASR provider "${this.provider}" 尚未实现，等待接入具体平台`);
  }

  /**
   * 获取支持的 ASR 提供商列表
   */
  static getProviders() {
    return [
      { id: 'placeholder', name: '待定', status: 'not_implemented' },
      // 后续在此添加：whisper / volcengine / aliyun 等
    ];
  }
}

module.exports = { ASRService };
