# Muse Greet

一个蒸汽波/Y2K风格的招呼页面，使用React和P5.js实现。

## 功能特点

- 使用P5.js和GLSL着色器实现蒸汽波风格背景动效
- 可自定义中央问候文字
- 响应式设计，适配各种设备尺寸
- 部署到Vercel简单便捷

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 自定义指南

### 更换文字内容

编辑 `src/App.jsx` 文件中的 `greetText` 状态值即可更改中央显示的文字内容。

```jsx
// 在App.jsx中
const [greetText] = useState("你想要的文字");
```

### 更换背景着色器

目前有两种方式可以更换背景着色器：

#### 方式1：内联着色器

1. 访问 [ShaderToy](https://www.shadertoy.com/) 或 [GLSL Sandbox](http://glslsandbox.com/)
2. 找到你喜欢的蒸汽波/Y2K风格着色器
3. 复制着色器代码，替换 `src/components/P5Shader.jsx` 中的 `defaultFragmentShader` 变量
4. 根据需要调整变量名：
   - ShaderToy的 `iTime` 通常对应我们的 `u_time`
   - ShaderToy的 `iResolution` 通常对应我们的 `u_resolution`
   - ShaderToy的 `iMouse` 通常对应我们的 `u_mouse`

#### 方式2：从外部URL加载

项目现在支持从外部URL加载着色器。你可以在 `src/components/P5Shader.jsx` 文件中修改以下代码：

```jsx
// 修改这些URL为你想要的着色器文件URL
const vertShaderUrl = "你的顶点着色器URL";
const fragShaderUrl = "你的片段着色器URL";

// 然后将预加载方法修改为：
const preload = (p5) => {
  shaderProgram = p5.loadShader(vertShaderUrl, fragShaderUrl);
  setShaderLoaded(true);
};
```

### 从CodePen适配着色器

如果你在CodePen上找到了喜欢的P5.js着色器示例，可以按照以下步骤适配：

1. 观察CodePen示例中的P5.js代码结构，特别是其中的 `preload()`, `setup()`, `draw()` 函数
2. 注意其中使用的着色器变量名（通常是 `u_time`, `u_resolution` 等）
3. 在我们的 `P5Shader.jsx` 组件中相应调整：
   - 更改着色器URL
   - 添加对应的 uniform 变量设置
   - 必要时调整绘制方法

## CSS字体和风格自定义

项目使用了 Montserrat 字体和具有故障风格的文字效果。你可以在以下文件中自定义样式：

- `src/styles/GreetText.css`: 修改中央文字的样式、动画效果
- `src/index.css`: 修改全局CSS变量、颜色主题等

## 部署到Vercel

1. 将代码推送到GitHub仓库
2. 在Vercel上导入该仓库
3. 保持默认设置并点击"Deploy"
4. 部署完成后，Vercel会提供一个URL来访问你的页面

## 技术栈

- React
- P5.js
- GLSL着色器
- Vite
- CSS变量与动画
