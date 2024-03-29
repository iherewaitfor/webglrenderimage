# 单纹理渲染YUV
只传入一个纹理，通过编写shader，读取Y、U、V数据，进行渲染。
设视频的宽高为width、height。则该单纹理的宽高为width、1.5height。其中Y数据大小为width\*heigth，U、V均为0.5width\*0.5height.

## shader编译
shader的编译流程如下 ，先使用gl.createShader创建shader，比如像素（片元）着器色，传入参数gl.FRAGMENT_SHADER，然后调用gl.shaderSource(fragmentShader, fragmentShaderSource)设置shader源码，再调用  gl.compileShader(fragmentShader)进行编译。
编译是否成功，通过 gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)获取。

具体的错误信息通过gl.getShaderInfoLog(fragmentShader)获取。
``` javascript
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);
        // 检测编译是否成功
        var success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
        if (!success) {
          // 编译过程出错，获取错误信息。
          console.log( "could not compile shader:" + gl.getShaderInfoLog(fragmentShader));
        }
```

shader编译的错误信息，比如在在shader中写了
```
    vTextureCoord.y = 1.0/6 + uTextureCoord.y;
```
可以在控制台上看到错误信息如下，把1.0/6改成1.0/6.0就可以了。
```
could not compile shader:ERROR: 0:26: '/' : wrong operand types - no operation '/' exists that takes a left-hand operand of type 'const float' and a right operand of type 'const int' (or there is no acceptable conversion)
```

编译完顶点着色器和片元着色器，就可以使用attachShader，把两个着色器加到着色器程序上。最后使用linkProgram和useProgram启用程序。
```javascript
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);
```
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


## 顶点属性设置
在 WebGL 中，作用于顶点的数据会先储存在attributes。这些数据仅对 JavaScript 代码和顶点着色器可用。


顶点着色器代码
```C++
          attribute highp vec4 aVertexPosition;
          attribute vec2 aTextureCoord;
          varying highp vec2 vTextureCoord;
          void main(void) {
           gl_Position = aVertexPosition;
           vTextureCoord = aTextureCoord;
          }
```

设置顶点位置发生 的代码如下
```javascript
        var vertexPositionAttribute = gl.getAttribLocation(
          program,
          "aVertexPosition"
        );
        gl.enableVertexAttribArray(vertexPositionAttribute);

        var verticesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([
            1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0,
          ]),
          gl.STATIC_DRAW
        );
        gl.vertexAttribPointer(
          vertexPositionAttribute,
          3,
          gl.FLOAT,
          false,
          0,
          0
        );
```
先使用getAttribLocation获取属性索引，使用enableVertexAttribArray让发生被启用。

接着创建好buffer。使用createBuffer创建buffer，bindBuffer绑定buffer的数据类型。使用bufferData去设置buffer的数据内容。

最后使用vertexAttribPointer告诉显卡从当前绑定的缓冲区（bindBuffer() 指定的缓冲区）中读取顶点属性数据。

参考

[https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html](https://webglfundamentals.org/webgl/lessons/zh_cn/webgl-shaders-and-glsl.html)

[https://www.khronos.org/files/opengles_shading_language.pdf](https://www.khronos.org/files/opengles_shading_language.pdf)

[https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/uniform](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/uniform)

[https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray)