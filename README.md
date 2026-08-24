# Home Stock v0.1

可直接部署到 GitHub Pages / Cloudflare Pages / Netlify 的静态 PWA 原型。

## 已实现
- Home / Inventory / Add / Buy / Settings
- 本地库存保存（localStorage）
- 数量增减
- 分类筛选
- 储存位置管理
- 最低库存
- 库存可信度 / 14天未确认提示
- Quick Check 快速盘点
- 购买前检查：同款 / 同用途简单匹配
- 中英文
- Follow System / Light / Dark
- Minimal / Cream / Pastel / Morandi / Dopamine
- JSON 导入 / 导出备份
- PWA manifest + service worker

## 截图识别
当前版本完成“上传截图 → 识别确认页”的 UI 流程，但没有绑定真实 AI Provider。
这样后续可自由接 OpenAI、Gemini 或其他 Provider，而不需要重做库存数据结构。

## 部署
把 ZIP 解压后的所有文件上传到网站根目录即可。
