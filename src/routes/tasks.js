const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { upload } = require('../middleware/upload');
const { extractAudio, getMediaInfo } = require('../services/ffmpeg');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// 上传视频/音频文件
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const db = getDb();
    const id = uuidv4();
    const filePath = req.file.path;

    db.prepare(`
      INSERT INTO tasks (id, filename, original_path, status)
      VALUES (?, ?, ?, 'uploaded')
    `).run(id, req.file.originalname, filePath);

    res.json({
      id,
      filename: req.file.originalname,
      size: req.file.size,
      status: 'uploaded',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 提取音频
router.post('/:id/extract-audio', async (req, res) => {
  try {
    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

    if (!task) return res.status(404).json({ error: '任务不存在' });
    if (task.audio_path) return res.json({ id: task.id, audio_path: task.audio_path, status: task.status });

    db.prepare("UPDATE tasks SET status = 'extracting', updated_at = datetime('now') WHERE id = ?").run(task.id);

    const audioPath = await extractAudio(task.original_path, UPLOAD_DIR);

    db.prepare("UPDATE tasks SET audio_path = ?, status = 'audio_ready', updated_at = datetime('now') WHERE id = ?")
      .run(audioPath, task.id);

    res.json({ id: task.id, audio_path: audioPath, status: 'audio_ready' });
  } catch (err) {
    const db = getDb();
    db.prepare("UPDATE tasks SET status = 'extract_failed', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    res.status(500).json({ error: err.message });
  }
});

// 获取媒体信息
router.get('/:id/info', async (req, res) => {
  try {
    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    if (!task) return res.status(404).json({ error: '任务不存在' });

    const info = await getMediaInfo(task.original_path);
    res.json({ id: task.id, filename: task.filename, media: info });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单个任务
router.get('/:id', (req, res) => {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  res.json(task);
});

// 获取任务列表
router.get('/', (req, res) => {
  const db = getDb();
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
  res.json(tasks);
});

// 删除任务
router.delete('/:id', (req, res) => {
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: '任务不存在' });

  const fs = require('fs');
  if (task.original_path && fs.existsSync(task.original_path)) fs.unlinkSync(task.original_path);
  if (task.audio_path && fs.existsSync(task.audio_path)) fs.unlinkSync(task.audio_path);

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: '已删除' });
});

module.exports = router;
