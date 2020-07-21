// CORS must be enabled, using proxy
//var IMAGE_URL = 'https://cors-anywhere.herokuapp.com/http://lorempixel.com/400/200/people/7/';

// Filters library from view source of page https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
Filters = {};
Filters.getPixels = function(img) {
  var c, _ctx;
  if (img.getContext) {
    c = img;
    try {
      _ctx = c.getContext('2d');
    } catch (e) {}
  }
  if (!_ctx) {
    c = this.getCanvas(img.width, img.height);
    _ctx = c.getContext('2d');
    _ctx.drawImage(img, 0, 0);
  }
  return _ctx.getImageData(0, 0, c.width, c.height);
};

Filters.getCanvas = function(w, h) {
  var c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

Filters.filterImage = function(filter, image, var_args) {
  var args = [this.getPixels(image)];
  for (var i = 2; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.noFilter = function(pixels, args) {
  return pixels;
};

// new custom method (sepia)
//Filters.sepia = function(pixels, args){
  //return 
//}

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    // CIE luminance for the RGB
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return pixels;
};

Filters.brightness = function(pixels, adjustment) {
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    d[i] += adjustment;
    d[i + 1] += adjustment;
    d[i + 2] += adjustment;
  }
  return pixels;
};

Filters.threshold = function(pixels, threshold) {
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v
  }
  return pixels;
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w, h) {
  return this.tmpCtx.createImageData(w, h);
};

Filters.convolute = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = Filters.createImageData(w, h);
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;
      var r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy * sw + scx) * 4;
          var wt = weights[cy * side + cx];
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
          a += src[srcOff + 3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
};

if (!window.Float32Array)
  Float32Array = Array;

Filters.convoluteFloat32 = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = {
    width: w,
    height: h,
    data: new Float32Array(w * h * 4)
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;
      var r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy * sw + scx) * 4;
          var wt = weights[cy * side + cx];
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
          a += src[srcOff + 3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
};
// END Library code

function addFilterToDocument(type, img) {
  var canvasFilter = document.createElement('canvas');
  var ctxFilter = canvasFilter.getContext('2d');
  //ctxFilter.fillStyle = "red";
  //ctxFilter.font = "bold 12px Arial";
  var filterData, text;

  switch (type) {
    case 'noFilter':
      filterData = Filters.filterImage(Filters.noFilter, img);
      text = 'no filter';
      break;
    case 'grayscale':
      filterData = Filters.filterImage(Filters.grayscale, img);
      text = 'grayscale';
      break;
    case 'threshold':
      filterData = Filters.filterImage(Filters.threshold, img, 128);
      text = 'threshold';
      break;
    case 'brightness':
      filterData = Filters.filterImage(Filters.brightness, img, 40);
      text = 'brightness';
      break;
    case 'blurC':
      filterData = Filters.filterImage(Filters.convolute, img, [1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9
      ]);
      text = 'blurC';
      break;

    case 'sharpen':
      filterData = Filters.filterImage(Filters.convolute, img, [0, -1, 0, -1, 5, -1,
        0, -1, 0
      ]);
      text = 'sharpen';
      break;

    default:
      return;
  }

  document.body.appendChild(canvasFilter);
  canvasFilter.style.width = filterData.width + 'px'; // can be overridden in styles
  canvasFilter.style.height = filterData.height + 'px';
  ctxFilter.putImageData(filterData, 0, 0);
}
// this is new custom filter method

function applyFilterToCanvas(type, img) {  
  var filterData;
  switch (type) {
    case 'noFilter':
      filterData = Filters.filterImage(Filters.noFilter, img);
      applyFilterToCanvasCustomFilter(type, img);
      break;
    case 'grayscale':
      filterData = Filters.filterImage(Filters.grayscale, img);
      break;
    case 'threshold':
      filterData = Filters.filterImage(Filters.threshold, img, 128);
      break;
    case 'brightness':
      filterData = Filters.filterImage(Filters.brightness, img, 40);
      break;
    case 'blurC':
      filterData = Filters.filterImage(Filters.convolute, img, [1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9,
        1 / 9, 1 / 9, 1 / 9
      ]);
      break;
    case 'sharpen':
      filterData = Filters.filterImage(Filters.convolute, img, [0, -1, 0, -1, 5, -1,
        0, -1, 0
      ]);
      break;

    default:
      return;
  }
  ctx.putImageData(filterData, 0, 0);
}

function applyFilterToCanvasCustomFilter(type, img) {
  switch (type) {
    case 'sepia':
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'sepia(1)';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      break;
    case 'invert':
       ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'invert(75%)';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);  
    break;
    case 'contrast':
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'contrast(120%)';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);  
    break;
    case 'noFilter':      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);  
    break;
    default:
      return;
  }
}