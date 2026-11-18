# 张楉晗 · 观察庭院

在现有 GitHub Pages 个人主页上持续增补，保护基线为 ead66c48b0ecc7add9377a2ef40e2419131d256a。原庭院、原三维名片及项目交互继续保留。

## 本地预览

在 jie 目录执行 `python3 -m http.server 8877 --directory outputs --bind 127.0.0.1`，打开 `/esther-portfolio/`；材质试验页在 `/quality-lab/`。不要用 file:// 加载模型。

## 2026-11-18 接入

- 首页导航「收藏」直达五份项目的另一种入口；正文与原项目入口仍直接可读。
- `visuals/main.js` 管理选择、键盘、抓取完成后的项目卡片；沿用 CV 对齐后的五份项目记录。
- `visuals/machine.js` 完整机柜、五只兔子、三爪、滑轨、取物通道和约 9 秒的出柜动作。
- `visuals/plush.js` 可编辑的软体轮廓、曲线垂耳、短绒网格、面部缝线与布标。
- `visuals/botany.js` 连续花筒、五裂花冠、双重复叶与从当前形态反向的开合；每朵错开 150 毫秒，主形变 2.45 秒。
- `visuals/clock.js` 雕塑式指针、上海时间与花枝互动。
- `visuals/scene.js` 独立 Three.js r180 ESM 场景；原站全局 r128 保持原路径，禁止全站替换。
- 旧 `bloom.js` 留作历史源码，但首页不再加载；`botanical.js` 不再向各项目角落重复注入同款盆栽。

材质资源和许可见 ASSET-SOURCES.md。这里的发布说明不构成用户美术认可；网页截图与录屏需另行比较。本站源码不包含用户 CV 原件、参考视频或参考截图。
