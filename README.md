# 张楉晗 · 观察庭院

在 GitHub Pages 原版 ead66c4 上增补的个人主页。纯静态 HTML/CSS/JS；Three.js r128 与原站保持一致。

## 本地预览

在本目录执行：

```sh
python3 -m http.server 8877 --bind 127.0.0.1
```

打开 http://127.0.0.1:8877/ 。模型资源通过 HTTP 加载，请勿只双击 HTML 文件。

## 本次增补

- 保留原首页庭院、双面 3D 名片与各项目交互。
- 日期及核心数据按提供的三份 CV 对齐。
- 新增两份分析手记、复购观察窗口图、教育实践时间线。
- 新增带真实时间的钟表、原创蓝花楹花枝、悬挂式项目抓取场景。
- 原有项目微缩场景边缘增加细节植物。
- 大型场景延迟初始化，离屏停止连续渲染，支持键盘与减少动态效果。

本次新增：bloom.css、bloom.js、botanical.js、assets/、vendor/、ASSET-SOURCES.md。
调整：index.html、cases.js、model-view.js。

素材与许可见 ASSET-SOURCES.md。交付包不包含用户 CV 原件或参考视频。
