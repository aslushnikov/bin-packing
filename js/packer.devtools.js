DevtoolsPacker = function() { };

DevtoolsPacker.prototype = {
  fit: function(blocks, padding) {
    var sprites = blocks.map(block => new SVGSprite('', '', block.w, block.h));
    var spriteSheet = SVGSpriteSheet.fromSprites(sprites, null, padding, padding);

    for (var i = 0; i < sprites.length; ++i)
        blocks[i].fit = spriteSheet._positions.get(sprites[i]);

    this.root = {
        w: spriteSheet.width(),
        h: spriteSheet.height()
    };
  },
}


