# 在cef中渲染yuv纹理

# texImage2D指定纹理信息。
webgl创建纹理后，可以通过texImage2D方法去指定纹理信息。注意需要与共享纹理的信息一致。接口参考[https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)。接口语法如下：
```javascript
// WebGL1
texImage2D(target, level, internalformat, width, height, border, format, type, pixels) // pixels can be a TypedArray or a DataView or null
texImage2D(target, level, internalformat, format, type, pixels) // pixels cannot be a TypedArray or a DataView or null


// WebGL2
texImage2D(target, level, internalformat, width, height, border, format, type, offset)
texImage2D(target, level, internalformat, width, height, border, format, type, source)
texImage2D(target, level, internalformat, width, height, border, format, type, srcData, srcOffset)

```
其中本项目，使用的是

```javascript
texImage2D(target, level, internalformat, width, height, border, format, type, source)
```
项目使用的internalformat是gl.ALPHA，format使用的是gl.ALPHA，type是gl.UNSIGNED_BYTE。注意写共享内存的程序的纹理参数，与web指定的要一致。

``` javascript
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.ALPHA,
          width,
          height,
          0,
          gl.ALPHA,
          gl.UNSIGNED_BYTE,
          data
        );
```

# 参考
[https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D)