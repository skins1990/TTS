# 声笺当前实现说明

本文档记录当前产品边界、模型约束、数据流和后续扩展原则。修改模型或页面前，应先核对这里的能力归属，避免把不同模型的音色和参数混用。

## 页面与模型边界

| 页面 | 模型 | 音色来源 | 历史模式 |
| --- | --- | --- | --- |
| 语音生成 | `qwen3-tts-flash`、`qwen3-tts-vd-2026-01-26`、`qwen3-tts-vc-2026-01-22` | Qwen 普通官方音色、已保存 VD、已保存 VC | `official`、`vd`、`vc` |
| 语气控制 | `qwen3-tts-instruct-flash` | 24 个 Instruct 官方音色 | `instruct` |
| 阶跃语音 | `stepaudio-2.5-tts` | 36 个静态维护的阶跃官方音色 | `stepfun` |
| MiniMax | `speech-2.8-hd` | 通过 `/get_voice` 动态读取的系统音色与简介 | `minimax` |
| Seed Audio | `seed-audio-1.0-multilingual`、`seed-audio-1.0` | 官方 2.0 音色、声音复刻 ID、本地参考音频或图片 | `seed-audio` |
| 音色库 | Qwen Voice Design / Voice Clone | Qwen 官方音色、VD、VC | 不产生生成历史 |

六个页面保持独立，尤其需要遵守以下规则：

- Qwen VD、VC 和官方音色只能交给各自兼容的 Qwen 模型。
- Instruct 官方音色不进入普通音色库。
- 当前阶跃页不复用 Qwen 音色，也不包含阶跃音色复刻。
- MiniMax 页不包含音色克隆，且只使用 `speech-2.8-hd` 与当前账号返回的官方系统音色。
- Seed Audio 参考图片与参考音频互斥，上传资源只发送 Base64，不发送本地或远端 URL。
- 五类生成历史分别查询和清空，普通历史只包含 `official`、`vd`、`vc`。

## MiniMax 异步语音

MiniMax 页面固定调用 `speech-2.8-hd`，使用流程为创建异步任务、轮询任务状态、取得结果文件信息、下载音频并写入本地 SQLite。服务重启后会继续恢复状态为 `processing` 的任务。

- 直接输入最多 50,000 字符；TXT/ZIP 文件最大 10 MB。
- 官方音色与简介从 `POST /get_voice` 动态获取，并缓存 30 分钟。
- 可传语种增强、语速、音量、语调、情绪、英语文本规范化、发音词典、格式、采样率、MP3 比特率、声道、水印和声音效果器参数。
- PCM 与 G.711 裸流只提供下载，浏览器支持的封装格式可直接播放。
- `minimax_tasks` 保存任务生命周期；成功结果写入 `generations` 的独立 `minimax` 模式。

## Seed Audio 非流式生成

Seed Audio 页面调用 `POST /api/v3/tts/create`，模型可选多语种版和中英版。纯文本、参考音频、参考图片三种模式互斥；音频模式最多三条参考，可混合官方/复刻音色 ID 与本地 WAV、MP3、PCM、OGG/Opus，图片模式最多一张 JPEG、PNG 或 WebP。

- 文本与提示词最多 3,000 字符，输出最长 120 秒。
- 上传资源单个最大 10 MB，音频最长 30 秒；浏览器将文件转换为纯 Base64，服务端不会向上游发送 `audio_url` 或 `image_url`。
- 官方 2.0 音色从火山引擎公开音色文档读取并缓存 6 小时，按主要场景联动筛选，并保留自定义声音复刻 ID 入口。
- 支持格式、采样率、语速、音量、音调、字幕、显式水印与完整 AIGC 元数据字段。
- 返回音频立即写入 SQLite；字幕时间轴、处理前后时长、LogID 和参数快照写入 `settings_json`。

## Qwen 音色流程

### VD 设计

1. 在音色库填写名称、声音描述和试听文本。
2. 后端调用 `qwen-voice-design`，目标模型为 `qwen3-tts-vd-2026-01-26`。
3. 音色 ID、显示名称、描述和试听音频保存到 SQLite。
4. 语音生成页选择已保存音色后，直接调用对应 VD 模型。

### VC 复刻

1. 在音色库上传 WAV、MP3 或 M4A 参考音频。
2. 后端调用 `qwen-voice-enrollment`，目标模型为 `qwen3-tts-vc-2026-01-22`。
3. 参考音频内容哈希用于避免同一文件重复复刻。
4. 复刻结果保存到音色库，后续生成不再上传参考音频。

自建 VD、VC 支持本地改名。删除时会先删除云端音色，再删除 SQLite 记录；官方音色不能改名或删除。

## StepAudio 2.5 参数映射

当前阶跃页固定使用 `stepaudio-2.5-tts`，请求发送到：

```text
POST {STEPFUN_BASE_URL}/audio/speech
```

`STEPFUN_BASE_URL` 可填写服务根地址或以 `/v1` 结尾的地址，服务端会统一规范为 `/v1`。

| 页面字段 | API 字段 | 处理方式 |
| --- | --- | --- |
| 官方音色 | `voice` | 从本地静态目录选择并由后端校验 |
| 文案 | `input` | 最多 1,000 字符；圆括号内容可作为局部指令且默认不发音 |
| 整体情绪 | `instruction` | 转换为自然语言片段 |
| 演绎风格 | `instruction` | 转换为自然语言片段 |
| 语言倾向 | `instruction` | 转换为自然语言片段 |
| 补充演绎指令 | `instruction` | 与前三项合并，最终最多 200 字符 |
| 精确语速 | `speed` | `0.5` 至 `2.0` |
| 输出音量 | `volume` | `0.1` 至 `2.0` |
| 音频格式 | `response_format` | `wav`、`mp3`、`flac`、`opus`、`pcm` |
| 采样率 | `sample_rate` | `8000`、`16000`、`22050`、`24000`、`48000` |
| 文本归一化 | `text_normalization` | `standard` 或 `enhanced` |
| 发音映射 | `pronunciation_map.tone` | 每行一条 `原文/发音` |
| Markdown 过滤 | `markdown_filter` | 布尔值 |

### `instruction` 与 `voice_label`

当前实现不会向 `stepaudio-2.5-tts` 发送 `voice_label`。这是模型硬约束，不是界面取舍：

- `stepaudio-2.5-tts` 使用自然语言 `instruction`，并支持文本内圆括号局部指令。
- `stepaudio-2.5-tts` 不支持 `voice_label`，传入会报错。
- 页面上的情绪、风格和语言倾向是结构化编辑器，最终会组合为一条 `instruction`，因此可以组合使用。

### 粤语扩展方案

当前 `stepaudio-2.5-tts` 页面不承诺粤语输出。稳定生成粤语需要新增 `step-tts-2` 调用分支：

```json
{
  "model": "step-tts-2",
  "input": "大家好，今日同大家分享一个好消息。",
  "voice": "cixingnansheng",
  "voice_label": {
    "language": "粤语"
  }
}
```

实现该分支时必须遵守：

- `voice_label.language`、`voice_label.emotion`、`voice_label.style` 同一请求只能有一个有值。
- `language` 可选粤语、四川话、日语。
- `step-tts-2` 不应收到仅供 `stepaudio-2.5-tts` 使用的 `instruction`。
- 界面应使用互斥控件，不能沿用当前可组合的 StepAudio 2.5 控件逻辑。

## 历史与音频存储

所有数据保存在 `data/qwen-tts.db`。

`generations` 表在原有字段之外增加：

- `audio_data BLOB`：保存阶跃返回的二进制音频。
- `audio_mime TEXT`：保存音频 MIME 类型。
- `settings_json TEXT`：保存本次阶跃生成参数快照。

Qwen 生成历史保存上游返回的音频 URL。阶跃、MiniMax 和 Seed Audio 历史保存实际音频内容，并通过本地接口播放和下载：

```text
GET /api/generations/{id}/audio
GET /api/generations/{id}/audio?download=1
```

本地音频接口支持 HTTP Range，供浏览器播放器拖动进度。阶跃音频会持续增加 SQLite 文件体积，清空阶跃历史时会同时删除相应 BLOB。

## 服务端接口

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/api/status` | 返回 Qwen、StepFun、MiniMax、Seed Audio 和 SQLite 配置状态，不返回密钥 |
| `GET` | `/api/voices` | 返回 Qwen 普通音色库 |
| `GET` | `/api/instruct-voices` | 返回 Qwen Instruct 静态音色 |
| `GET` | `/api/step-voices` | 返回 StepAudio 2.5 静态音色 |
| `GET` | `/api/minimax/voices` | 返回当前账号可用的 MiniMax 系统音色与简介 |
| `GET` | `/api/seed-audio/voices` | 返回并缓存火山引擎官方 2.0 音色目录 |
| `POST` | `/api/generate` | Qwen 普通语音生成 |
| `POST` | `/api/generate-instruct` | Qwen Instruct 语气控制 |
| `POST` | `/api/generate-step` | StepAudio 2.5 精细生成并保存二进制音频 |
| `POST` | `/api/minimax/generations` | 创建 MiniMax 异步语音任务 |
| `POST` | `/api/seed-audio/generations` | 创建 Seed Audio 非流式生成并保存本地音频 |
| `GET` | `/api/minimax/tasks/{taskId}` | 查询 MiniMax 任务状态与完成结果 |
| `GET` | `/api/generations?mode=...` | 按页面读取最近 50 条历史 |
| `DELETE` | `/api/generations?mode=...` | 按页面清空历史 |

## 环境变量

```env
DASHSCOPE_API_KEY=sk-your-api-key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/api/v1
STEPFUN_API_KEY=sk-your-stepfun-api-key
STEPFUN_BASE_URL=https://api.stepfun.com/v1
MINIMAX_API_KEY=sk-your-minimax-api-key
MINIMAX_BASE_URL=https://api.minimaxi.com/v1
SEED_AUDIO_API_KEY=your-volcengine-api-key
SEED_AUDIO_BASE_URL=https://openspeech.bytedance.com
PORT=4173
```

真实密钥只放在 `.env`。`.env` 已被 `.gitignore` 忽略，不得把密钥写入前端、文档或状态接口。

## 下一阶段路线

### 1. VC/VD 精细化参数控制

状态：待开发。

- 分别核对 `qwen3-tts-vc-2026-01-22` 与 `qwen3-tts-vd-2026-01-26` 实际支持的生成参数，不能直接套用官方音色或 Instruct 页参数。
- 在普通生成流程中根据音色类型显示兼容控件，并由服务端按模型再次校验。
- 将精细参数写入 `settings_json`，保证历史记录可以还原本次生成配置。
- 保持现有音色设计、复刻、内容指纹复用、改名和删除行为不变。

### 2. MiniMax 音乐创作

状态：待开发。

- 与 MiniMax 异步语音共用 `MINIMAX_API_KEY` 和 `MINIMAX_BASE_URL`，不新增重复密钥配置。
- 新增独立标签、创建/查询任务流程和独立历史；音乐任务与 `minimax_tasks` 语音任务保持数据边界。
- 开发前先基于最新 MiniMax 文档确定模型、输入方式、参数、文件生命周期和下载有效期。
- 音乐结果需要下载到本地持久化，不能只保存上游临时 URL。

按日期的已交付内容与验证记录见 [CHANGELOG.md](./CHANGELOG.md)。

## 当前未包含

- 阶跃音色复刻和阶跃自定义音色库。
- `step-tts-2` / `step-tts-mini` 模型切换。
- 粤语、四川话对应的原生 `voice_label` 工作流。
- Qwen 返回音频的本地长期归档。
- MiniMax 音色克隆和其他语音模型。
- 上述 VC/VD 精细化控制与 MiniMax 音乐创作路线尚未实现。
