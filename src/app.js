const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 确保目录存在
const dirs = ['data', 'uploads'];
dirs.forEach(dir => {
  const p = path.join(__dirname, '..', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件（前端页面，后续添加）
app.use(express.static(path.join(__dirname, '..', 'public')));

// API 路由
const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

// 健康检查
app.get('/api/status', (req, res) => {
  res.json({
    service: 'media-toolkit',
    status: 'running',
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

// ASR 提供商列表
const { ASRService } = require('./services/asr');
app.get('/api/asr/providers', (req, res) => {
  res.json(ASRService.getProviders());
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`media-toolkit running on port ${PORT}`);
});
