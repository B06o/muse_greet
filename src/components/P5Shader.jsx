import React, { useState, useEffect, useRef } from 'react';
import Sketch from 'react-p5';

// 创建一个存储外部着色器代码的变量
const defaultVertShader = `
precision mediump float;
attribute vec3 aPosition;

void main() {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
  gl_Position = positionVec4;
}
`;

const defaultFragShader = `
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform vec4 u_col1;
uniform vec4 u_col2;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // 时间
  float time = u_time * 0.5;
  
  // 背景渐变
  vec3 bg = mix(u_col1.rgb, u_col2.rgb, uv.y);
  
  // 网格效果
  vec2 grid = fract(uv * 10.0 - vec2(time * 0.1));
  float gridLine = smoothstep(0.05, 0.0, abs(grid.x - 0.5)) + 
                  smoothstep(0.05, 0.0, abs(grid.y - 0.5));
  
  // 添加一些波纹效果
  float wave = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.1;
  
  // 鼠标交互
  float mouseEffect = smoothstep(0.3, 0.0, length(uv - u_mouse));
  
  // 最终颜色
  vec3 finalColor = bg;
  finalColor += vec3(0.9, 0.7, 0.9) * gridLine * 0.3;
  finalColor += wave;
  finalColor += vec3(0.7, 0.9, 1.0) * mouseEffect * 0.5;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// 外部着色器URL
const externalVertShaderUrl = "https://assets.codepen.io/108082/shader.vert";
const externalFragShaderUrl = "https://assets.codepen.io/108082/shader-1.frag";

const P5Shader = ({ className }) => {
  // 状态管理
  const [useWebGL, setUseWebGL] = useState(true);
  const [useExternalShader, setUseExternalShader] = useState(true);
  const [shaderLoaded, setShaderLoaded] = useState(false);
  const [shaderError, setShaderError] = useState(false);
  
  // 使用ref来存储跨渲染周期的对象
  const shaderRef = useRef(null);
  const p5Ref = useRef(null);
  
  // 基础变量
  let time = 0;
  let gridSize = 20;
  
  // 使用本地着色器
  const createLocalShader = (p5) => {
    console.log("创建本地着色器");
    try {
      const localShader = p5.createShader(defaultVertShader, defaultFragShader);
      shaderRef.current = localShader;
      setShaderLoaded(true);
      console.log("本地着色器创建成功");
      return true;
    } catch (error) {
      console.error("本地着色器创建失败:", error);
      setShaderError(true);
      setUseWebGL(false);
      return false;
    }
  };
  
  // 手动加载外部着色器
  const fetchExternalShaders = async (p5) => {
    console.log("手动获取外部着色器...");
    try {
      // 获取顶点着色器
      const vertResponse = await fetch(externalVertShaderUrl);
      if (!vertResponse.ok) throw new Error(`顶点着色器获取失败: ${vertResponse.status}`);
      const vertShaderCode = await vertResponse.text();
      console.log("顶点着色器获取成功，长度:", vertShaderCode.length);
      
      // 获取片段着色器
      const fragResponse = await fetch(externalFragShaderUrl);
      if (!fragResponse.ok) throw new Error(`片段着色器获取失败: ${fragResponse.status}`);
      const fragShaderCode = await fragResponse.text();
      console.log("片段着色器获取成功，长度:", fragShaderCode.length);
      
      // 使用获取到的代码创建着色器
      console.log("使用获取的代码创建着色器");
      const externalShader = p5.createShader(vertShaderCode, fragShaderCode);
      shaderRef.current = externalShader;
      setShaderLoaded(true);
      console.log("外部着色器创建成功");
      return true;
    } catch (error) {
      console.error("外部着色器手动获取失败:", error);
      return false;
    }
  };
  
  // 初始化
  const setup = (p5, canvasParentRef) => {
    console.log("初始化P5...");
    p5Ref.current = p5;
    
    // 尝试使用WebGL模式
    try {
      const canvas = p5.createCanvas(window.innerWidth, window.innerHeight, p5.WEBGL);
      canvas.parent(canvasParentRef);
      p5.pixelDensity(1); // 提高兼容性
      p5.noStroke();
      
      console.log("WebGL模式创建成功，开始加载着色器");
      
      // 设置着色器加载时间戳
      const startTime = Date.now();
      
      // 尝试直接使用loadShader加载
      try {
        console.log("尝试直接使用loadShader加载外部着色器");
        const externalShader = p5.loadShader(externalVertShaderUrl, externalFragShaderUrl);
        
        // 定时检查着色器是否加载完成
        const checkShaderInterval = setInterval(() => {
          // 如果加载时间超过5秒，使用本地着色器
          if (Date.now() - startTime > 5000) {
            clearInterval(checkShaderInterval);
            console.log("着色器加载超时，使用本地着色器");
            if (!shaderLoaded) {
              createLocalShader(p5);
            }
            return;
          }
          
          // 检查着色器是否加载完成
          if (externalShader._vertSrc && externalShader._fragSrc) {
            clearInterval(checkShaderInterval);
            console.log("外部着色器加载完成");
            shaderRef.current = externalShader;
            setShaderLoaded(true);
          }
        }, 500);
        
        // 备用方案：手动获取着色器代码
        setTimeout(async () => {
          if (!shaderLoaded) {
            clearInterval(checkShaderInterval);
            console.log("loadShader可能无法正常工作，尝试手动获取着色器");
            const success = await fetchExternalShaders(p5);
            if (!success && !shaderLoaded) {
              createLocalShader(p5);
            }
          }
        }, 3000);
      } catch (error) {
        console.error("loadShader方法失败:", error);
        // 立即尝试手动获取
        fetchExternalShaders(p5).then(success => {
          if (!success) {
            createLocalShader(p5);
          }
        });
      }
    } catch (error) {
      console.error("WebGL初始化失败，切换到2D模式:", error);
      setUseWebGL(false);
      
      // 创建2D画布
      const canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
      canvas.parent(canvasParentRef);
    }
    
    // 窗口大小调整事件
    window.addEventListener('resize', () => {
      p5.resizeCanvas(window.innerWidth, window.innerHeight);
    });
  };
  
  // 绘制逻辑
  const draw = (p5) => {
    // 更新时间
    time = p5.millis() / 1000;
    
    // WebGL模式 - 使用着色器
    if (useWebGL && !shaderError) {
      if (shaderLoaded && shaderRef.current) {
        try {
          // 清空背景，确保可以看到新的内容
          p5.clear();
          
          // 应用着色器
          p5.shader(shaderRef.current);
          
          // 设置统一变量
          let mx = p5.map(p5.mouseX, 0, p5.width, 0, 1);
          let my = p5.map(p5.mouseY, 0, p5.height, 0, 1);
          
          // 检查着色器是否有各种uniform方法
          const sh = shaderRef.current;
          if (typeof sh.setUniform === 'function') {
            try {
              sh.setUniform("u_resolution", [p5.width, p5.height]);
              sh.setUniform("u_mouse", [mx, my]);
              sh.setUniform("u_time", time);
              
              // 设置颜色
              const col1 = p5.color("#89ECEC");
              const col2 = p5.color("#f5f5f5");
              
              sh.setUniform("u_col1", [col1.levels[0]/255, col1.levels[1]/255, col1.levels[2]/255, col1.levels[3]/255]);
              sh.setUniform("u_col2", [col2.levels[0]/255, col2.levels[1]/255, col2.levels[2]/255, col2.levels[3]/255]);
            } catch (uniformError) {
              console.error("设置uniform变量失败:", uniformError);
              // 继续尝试绘制，可能着色器不需要这些uniform
            }
          } else {
            console.warn("着色器没有setUniform方法");
          }
          
          // 绘制全屏矩形
          p5.rect(0, 0, p5.width, p5.height);
          
          // 如果成功执行到这里，则返回不执行2D模式
          return;
        } catch (error) {
          console.error("着色器使用失败，切换到2D模式:", error);
          setShaderError(true);
          setUseWebGL(false);
          
          // 重新创建2D画布
          p5.remove();
          const canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
          canvas.parent(document.querySelector(`.${className}`));
          console.log("已切换到2D模式");
        }
      } else if (!shaderLoaded && time > 5) {
        // 如果5秒后着色器仍未加载，强制使用本地着色器
        console.log("着色器加载超时，强制使用本地着色器");
        if (createLocalShader(p5)) {
          return; // 让下一帧处理绘制
        } else {
          setUseWebGL(false);
        }
      }
    }
    
    // 2D模式 - 使用基础绘图API
    if (!useWebGL || shaderError) {
      // 绘制渐变背景
      drawGradientBackground(p5);
      
      // 绘制网格
      drawGrid(p5);
      
      // 绘制动态圆形
      drawCircles(p5);
      
      // 绘制水平线
      drawHorizontalLines(p5);
    }
  };
  
  // 以下是2D模式下的绘图函数
  
  // 绘制渐变背景
  const drawGradientBackground = (p5) => {
    // 蒸汽波风格的颜色
    const topColor = p5.color(137, 236, 236); // #89ECEC
    const bottomColor = p5.color(245, 245, 245); // #f5f5f5
    
    for (let y = 0; y < p5.height; y++) {
      const inter = p5.map(y, 0, p5.height, 0, 1);
      const c = p5.lerpColor(topColor, bottomColor, inter);
      p5.stroke(c);
      p5.line(0, y, p5.width, y);
    }
  };
  
  // 绘制网格
  const drawGrid = (p5) => {
    p5.push();
    p5.stroke(255, 100, 255, 100);
    p5.strokeWeight(1);
    
    // 移动网格以产生动画效果
    const offset = time * 20 % gridSize;
    
    // 水平线
    for (let y = offset; y < p5.height; y += gridSize) {
      p5.line(0, y, p5.width, y);
    }
    
    // 垂直线
    for (let x = offset; x < p5.width; x += gridSize) {
      p5.line(x, 0, x, p5.height);
    }
    
    p5.pop();
  };
  
  // 绘制动态圆形
  const drawCircles = (p5) => {
    p5.push();
    p5.noFill();
    
    // 在屏幕上画几个半透明的圆
    for (let i = 0; i < 3; i++) {
      const size = p5.width * 0.3 + p5.sin(time * 0.5 + i) * 50;
      const x = p5.width * 0.5 + p5.cos(time * 0.2 + i) * p5.width * 0.2;
      const y = p5.height * 0.5 + p5.sin(time * 0.3 + i) * p5.height * 0.2;
      
      p5.stroke(255, 130, 230, 40);
      p5.strokeWeight(2);
      p5.circle(x, y, size);
      
      p5.stroke(100, 200, 255, 30);
      p5.strokeWeight(4);
      p5.circle(x, y, size * 0.8);
    }
    
    p5.pop();
  };
  
  // 绘制水平线
  const drawHorizontalLines = (p5) => {
    p5.push();
    p5.strokeWeight(2);
    
    // 绘制几条动态水平线
    for (let i = 0; i < 5; i++) {
      const y = p5.height * (0.3 + i * 0.1) + p5.sin(time + i) * 20;
      const alpha = p5.map(p5.sin(time * 0.5 + i), -1, 1, 100, 200);
      
      p5.stroke(255, 100, 255, alpha);
      p5.line(0, y, p5.width, y);
    }
    
    p5.pop();
  };
  
  return <Sketch setup={setup} draw={draw} className={className} />;
};

export default P5Shader; 