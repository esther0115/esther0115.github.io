# 新增 3D 素材与来源

原首页、原三维名片、项目图片和项目模型继续使用原仓库文件。

| 素材 | 来源 | 许可 / 用途 |
|---|---|---|
| Studio Small 08 HDR | https://polyhaven.com/a/studio_small_08 | CC0；assets/studio-small-08.hdr，新 r180 场景的柔和环境反射 |
| Three.js r180 与 HDRLoader、RoundedBoxGeometry | https://github.com/mrdoob/three.js/tree/r180 | MIT；vendor/three-r180，许可证见其 THREE-LICENSE.txt |
| 原 r128 与 GLTFLoader / RGBELoader | https://github.com/mrdoob/three.js/tree/r128/examples/js/loaders | MIT；原庭院、原名片和原项目模型继续使用，许可证见 seoul/THREE-LICENSE.txt |
| ivory-short-pile.png | 本任务中生成的短绒纹理 | assets/textiles；搭配真实短绒网格，不是平面兔子图片 |
| 新兔子、完整机柜、指针、花冠及复叶 | 本任务原创程序几何 | 可编辑源文件在 visuals/*.js，未调用 Blender，因而没有 .blend 或 GLB 源文件 |
| Potted Plant 02（历史遗留资源） | https://polyhaven.com/a/potted_plant_02 | CC0；旧 assets/potted_plant_02 仍保留，但不再自动插入每个项目角落 |

花冠结构依据蓝花楹连续花筒和五裂开口的植物形态进行参数化建模；RHS 形态研究参考 https://www.rhs.org.uk/plants/9429/jacaranda-mimosifolia/details 。没有打包该网页照片。

兔子短绒采用表面采样后的弯曲纤维网格、线性 bump 纹理和非金属布艺材质；不同配色与布围巾复用同一可编辑基础造型。花冠采用同拓扑顶点形变，保持花托连接，不使用花朵平面图冒充三维模型。

用户提供的视频、Jellycat 研究图片只用于私人对照，不包含在本站发布目录。所有运行资源由本站托管，不依赖第三方模型 CDN。
