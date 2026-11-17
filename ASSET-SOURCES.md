# 新增 3D 素材与来源

本文件只记录本次增补。原首页、原名片、原项目图片及几何继续使用原仓库文件。

| 素材 | 来源 | 许可 | 本地路径与用途 |
|---|---|---|---|
| Potted Plant 02 | https://polyhaven.com/a/potted_plant_02 | CC0 | assets/potted_plant_02；分析、售前、校阅和学习微缩场景的边缘盆栽 |
| Studio Small 08 | https://polyhaven.com/a/studio_small_08 | CC0 | assets/studio-small-08.hdr；新增钟表与抓手与收藏物的摄影棚环境反射 |
| GLTFLoader / RGBELoader r128 | https://github.com/mrdoob/three.js/tree/r128/examples/js/loaders | MIT | vendor/；与原站 Three.js r128 兼容，许可证见 seoul/THREE-LICENSE.txt |

植物使用官方 1K glTF，保留法线与粗糙度贴图，下载文件逐项校验官方 manifest 的 MD5。模型、贴图、HDR 和加载器均随站点托管，运行时不依赖素材 CDN。

蓝花楹花枝为 botanical.js 中的原创参数化几何：弯曲枝轴、五裂喇叭花冠、成对排列的小叶。形态参考 RHS 的 Jacaranda mimosifolia 页面：
https://www.rhs.org.uk/plants/9429/jacaranda-mimosifolia/details
该页面用于形态研究，没有将其照片打包进网站。

钟表、刻度、指针、金属花、悬挂式机械抓手、收藏角色与五种项目配件为 bloom.js 中原创程序几何。角色软质涂层、眼睛、纸张、底座、拉丝金属分别设置材质；大场景接近视口时初始化。

用户提供的视频只用于私人设计对照；网站部署包不包含视频或视频截图。
