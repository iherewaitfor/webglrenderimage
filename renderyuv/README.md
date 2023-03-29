# 单纹理渲染YUV
只传入一个纹理，通过编写shader，读取Y、U、V数据，进行渲染。
设视频的宽高为width、height。则该单纹理的宽高为width、1.5height。其中Y数据大小为width\*heigth，U、V均为0.5width\*0.5height.

## webgl的glsl
写shader时碰到的几个点：
- glsl是强数据类型的浮点数不能直接和整数运算。
- 不支持整数的%取模。有mod函数可以取模，但是参数是float。
## 给shader中有变量赋值
在glsl中的变量赋值，可以用到uniform系列函数，比如只对一个浮点数赋值。
在shader中的定义
```javascript
    uniform float videoWidth;,
    uniform float videoHeight;
```
javascript中的调用赋值操作。
```javascript
        gl.uniform1f(gl.getUniformLocation(gl.program, "videoWidth"), width); //设置视频宽度到shader
        gl.uniform1f(gl.getUniformLocation(gl.program, "videoHeight"), height);//设置视频高度到shader
```
具体参考https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/uniform



参考

[https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html)

[https://www.khronos.org/files/opengles_shading_language.pdf](https://www.khronos.org/files/opengles_shading_language.pdf)

[https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/uniform](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/uniform)