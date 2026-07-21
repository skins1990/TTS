# 声笺 · AI 语音工作台

一个无需账号的个人语音生成工作台。Qwen VD/VC 音色库、普通语音生成、官方音色语气控制、StepAudio 2.5、MiniMax 长文本异步语音和火山引擎 Seed Audio 分成独立流程，音色和历史使用 SQLite 持久保存。

## 启动

1. 将 `.env.example` 复制为 `.env`。
2. 在 `.env` 中填入阿里云百炼 `DASHSCOPE_API_KEY`、阶跃 `STEPFUN_API_KEY`、`MINIMAX_API_KEY` 与火山引擎 `SEED_AUDIO_API_KEY`；使用中转时修改对应的 Base URL。
3. 运行 `npm start`。
4. 打开 `http://localhost:4173`。

```env
DASHSCOPE_API_KEY=sk-your-api-key
STEPFUN_API_KEY=sk-your-stepfun-api-key
STEPFUN_BASE_URL=https://api.stepfun.com/v1
MINIMAX_API_KEY=sk-your-minimax-api-key
MINIMAX_BASE_URL=https://api.minimaxi.com/v1
SEED_AUDIO_API_KEY=your-volcengine-api-key
SEED_AUDIO_BASE_URL=https://openspeech.bytedance.com
PORT=4173
```

项目仅使用 Node.js 内置能力，无需安装第三方依赖。需要 Node.js 22.5 或更高版本，以使用内置 `node:sqlite`。

当前页面边界、参数映射、数据库结构和后续路线见 [PROJECT_STATE.md](./PROJECT_STATE.md)，按日期的交付记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 模型行为

- 音色库使用 `qwen3-tts-vd-2026-01-26` 设计音色，并把音色 ID、描述和试听音频保存到 `data/qwen-tts.db`。
- 音色库支持两种自建音色：使用 `qwen3-tts-vd-2026-01-26` 设计 VD 音色，或使用 `qwen3-tts-vc-2026-01-22` 复刻 VC 音色；复刻和设计都在音色库中完成并保存。
- 普通语音生成从音色库选择官方系统音色或已保存的 VD/VC 音色，不在生成步骤上传参考音频或重复复刻。
- “语气控制”单独使用 `qwen3-tts-instruct-flash` 和官方支持的 24 个音色，通过 `instructions` 控制语速、情绪、停顿和表达方式；它与普通 `qwen3-tts-flash` 官方音色列表独立，虽然有部分音色名称重叠。
- “阶跃语音”单独使用 `stepaudio-2.5-tts` 和静态维护的 36 个官方音色。情绪、风格、语言倾向和补充要求会合并为模型原生 `instruction`，并支持语速、音量、格式、采样率、文本归一化、发音映射和 Markdown 过滤。
- “MiniMax”固定使用 `speech-2.8-hd`。官方系统音色与简介通过 `/get_voice` 动态读取；支持直接文本或 TXT/ZIP 文件、语种增强、情绪、发音词典、音频规格、英语规范化、水印和声音效果器。
- 自建 VD 和 VC 音色都支持删除，删除操作会同步删除阿里云音色与本地 SQLite 记录；自建音色支持在音色库中重命名，官方音色不可删除或改名。
- VC 参考音频通过内容指纹复用已创建的音色，避免相同文件重复复刻。
- 参考音频支持 WAV、MP3、M4A，最大 10 MB，推荐 10 至 20 秒的清晰单人朗读。
- 生成历史保存在 SQLite，普通生成、Instruct 语气控制、StepAudio 与 MiniMax 生成分开展示、分开清空；页面各自展示最近 50 条。
- Qwen 历史保存模型返回的音频地址；StepAudio 返回的二进制音频直接保存在 SQLite，不依赖临时 URL。
- MiniMax 使用异步任务接口轮询；完成后立即下载音频并保存到 SQLite，避免依赖 9 小时有效期的上游下载地址。
- Seed Audio 支持 `seed-audio-1.0-multilingual` 与 `seed-audio-1.0`，可使用纯文本、最多三条参考音频/音色 ID或单张参考图片生成，所有上传参考资源只以 Base64 发送。
- Seed Audio 官方 2.0 音色从火山引擎公开文档读取并缓存，页面按主要场景联动筛选；生成结果、字幕时间轴与参数快照保存在 SQLite。

## 下一阶段

- VC/VD 精细化参数控制：分别核对两个模型实际支持的生成参数，再为自建音色补充独立且兼容的控制界面和参数快照。
- MiniMax 音乐创作：复用现有 `MINIMAX_API_KEY` 与 `MINIMAX_BASE_URL`，新增独立页面、异步任务流程和历史，不与语音记录混用。
