// 这是一个简单的蒸汽波风格着色器
// 你可以用在线找到的更酷炫的着色器替换这里的代码

export const vaporwaveFragmentShader = `
  precision mediump float;
  
  uniform float time;
  uniform vec2 resolution;
  
  // 基础蒸汽波风格着色器 - 这里使用简单的网格和渐变
  // 你可以从ShaderToy等网站找到更好的效果替换
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    
    // 创建网格效果
    vec2 grid = fract(uv * 10.0 - vec2(time * 0.1));
    float gridLine = step(0.95, max(grid.x, grid.y));
    
    // 创建渐变背景 - 蒸汽波风格的紫粉色调
    vec3 color1 = vec3(0.5, 0.2, 0.8); // 紫色
    vec3 color2 = vec3(0.9, 0.4, 0.7); // 粉色
    vec3 bgColor = mix(color1, color2, uv.y + sin(time * 0.2) * 0.2);
    
    // 合并网格和背景
    vec3 finalColor = mix(bgColor, vec3(1.0), gridLine * 0.5);
    
    // 增加一些动态波纹
    float wave = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.1;
    finalColor += wave;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// 如何替换着色器:
// 1. 访问 https://www.shadertoy.com/ 或 https://glslsandbox.com/
// 2. 找到你喜欢的蒸汽波/Y2K风格着色器
// 3. 复制着色器代码(通常是从 void main() 开始的部分)
// 4. 根据需要调整变量名:
//    - ShaderToy的 iTime 通常对应这里的 time
//    - ShaderToy的 iResolution 通常对应这里的 resolution
//    - 如果着色器有额外的统一变量，需要在P5Shader组件中添加 