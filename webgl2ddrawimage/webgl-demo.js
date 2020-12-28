"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["drawImage-vertex-shader", "drawImage-fragment-shader"]);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");
  var textureMatrixLocation = gl.getUniformLocation(program, "u_textureMatrix");
  var textureLocation = gl.getUniformLocation(program, "u_texture");

  // Create a buffer.
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Put a unit quad in the buffer
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Create a buffer for texture coords
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Put texcoords in the buffer
  var texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  // creates a texture info { width: w, height: h, texture: tex }
  // The texture will start with 1x1 pixels and be updated
  // when the image has loaded
  function loadImageAndCreateTextureInfo(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    var textureInfo = {
      width: 1,   // we don't know the size until it loads
      height: 1,
      texture: tex,
    };
    var img = new Image();
    img.addEventListener('load', function() {
      textureInfo.width = img.width;
      textureInfo.height = img.height;

      gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });
    img.src = url;

    return textureInfo;
  }

  var textureInfos = [
    // loadImageAndCreateTextureInfo('https://webglfundamentals.org/webgl/resources/star.jpg'),
    // loadImageAndCreateTextureInfo('https://webglfundamentals.org/webgl/resources/leaves.jpg'),
    // loadImageAndCreateTextureInfo('https://webglfundamentals.org/webgl/resources/keyboard.jpg'),
    loadImageAndCreateTextureInfo('./star.jpg'),
    loadImageAndCreateTextureInfo('./leaves.jpg'),
    loadImageAndCreateTextureInfo('./keyboard.jpg'),
  ];

  var drawInfos = [];
  var numToDraw = 2;
  generateDrawInfos(numToDraw)

  function generateDrawInfos(numToDraw){
    for (var ii = 0; ii < numToDraw; ++ii) {
      var drawInfo = {
        srcX:0,  
        srcY:0, 
        srcWidth:0, 
        srcHeight:0,  //取纹理的哪个部分。一般全取。
        dstX:0, 
        dstY:0, 
        dstWidth:400, 
        dstHeight:300,  //最终在canvas上的坐标和大小。按比例铺满
        textureInfo: textureInfos[Math.random() * textureInfos.length | 0], //纹理
      };
      drawInfo.width  = Math.random() * (1 - drawInfo.offX);
      drawInfo.height = Math.random() * (1 - drawInfo.offY);
      drawInfos.push(drawInfo);
    }
  } 

  function draw() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    var i = 0
    drawInfos.forEach(function(drawInfo) {

      // var maxWidth = 1280 < gl.canvas.width ? 800 :gl.canvas.width;
      var maxWidth = gl.canvas.width;
      var tempWidth = maxWidth/2
      var tempHeight = tempWidth *3/4
      drawImage(
        drawInfo.textureInfo.texture, //纹理
        drawInfo.textureInfo.width,   //纹理宽度
        drawInfo.textureInfo.height,  //纹理高度
        0, 0, drawInfo.textureInfo.width, drawInfo.textureInfo.height,  //取纹理的哪个部分。一般全取。
        i, 100, tempWidth, tempHeight); //最终在canvas上的坐标和大小
        i +=tempWidth;
    });
  }

  function render(time) {
    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  // Unlike images, textures do not have a width and height associated
  // with them so we'll pass in the width and height of the texture
  function drawImage(
      tex, texWidth, texHeight,
      srcX, srcY, srcWidth, srcHeight,
      dstX, dstY, dstWidth, dstHeight) {
    if (dstX === undefined) {
      dstX = srcX;
      srcX = 0;
    }
    if (dstY === undefined) {
      dstY = srcY;
      srcY = 0;
    }
    if (srcWidth === undefined) {
      srcWidth = texWidth;
    }
    if (srcHeight === undefined) {
      srcHeight = texHeight;
    }
    if (dstWidth === undefined) {
      dstWidth = srcWidth;
      srcWidth = texWidth;
    }
    if (dstHeight === undefined) {
      dstHeight = srcHeight;
      srcHeight = texHeight;
    }

    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Tell WebGL to use our shader program pair
    gl.useProgram(program);

    // Setup the attributes to pull data from our buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // this matrix will convert from pixels to clip space
    var matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1);

    // this matrix will translate our quad to dstX, dstY
    matrix = m4.translate(matrix, dstX, dstY, 0);

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    matrix = m4.scale(matrix, dstWidth, dstHeight, 1);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Because texture coordinates go from 0 to 1
    // and because our texture coordinates are already a unit quad
    // we can select an area of the texture by scaling the unit quad
    // down
    var texMatrix = m4.translation(srcX / texWidth, srcY / texHeight, 0);
    texMatrix = m4.scale(texMatrix, srcWidth / texWidth, srcHeight / texHeight, 1);

    // Set the texture matrix.
    gl.uniformMatrix4fv(textureMatrixLocation, false, texMatrix);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(textureLocation, 0);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

}
main();
