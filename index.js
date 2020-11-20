const fs = require('fs');
const glob = require('glob');
var jimp = require('jimp');

// Load in dependencies
var Spritesmith = require('spritesmith');

// Create a new spritesmith and process our images
var sprites = [...glob.sync('img/**/*.png')];
var spritesmith = new Spritesmith();
spritesmith.createImages(sprites, function handleImages(err, images) {
  if(err) throw(err);

  // Create our result
  var result = spritesmith.processImages(images);

  const sprites_png = result.image;
  const sprites_json = result.coordinates;

  // Save image
  const write_stream=fs.createWriteStream('dist/sprites.png');
  sprites_png.pipe(write_stream);
  sprites_png.on('end', () => {
    jimp.read('dist/sprites.png', (err, sprites) => {
      if (err) throw err;
      // @2x
      sprites
        .scale(2, jimp.RESIZE_) // resize
        .write('dist/sprites@2x.png'); // save
      });
  });

  // save json.
  
  // This fix here covers a particular case, should be elsewhere
  const sprites_json_fixed = Object.entries(sprites_json).reduce((dst, [key, val]) => {
    dst[key] = {
      x: val.x + 1,
      y: val.y + 1,
      width: val.width - 2,
      height: val.height -2
    };
    return dst;
  }, {});
  fs.writeFileSync('dist/sprites.json', JSON.stringify(sprites_json_fixed, null, 2));

  // @2x
  const sprites_json_2x = Object.entries(sprites_json_fixed).reduce((dst, [key, val]) => {
    dst[key] = {
      x: 2 * val.x,
      y: 2 * val.y,
      width: 2 * val.width,
      height: 2 * val.height
    };
    return dst;
  }, {});
  fs.writeFileSync('dist/sprites@2x.json', JSON.stringify(sprites_json_2x, null, 2));

});
