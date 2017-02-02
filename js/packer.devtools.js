DevtoolsPacker = function() { };

DevtoolsPacker.prototype = {
  fit: function(blocks) {
    var sprites = blocks.map(block => new SVGSprite('', '', block.w, block.h));
    var spriteSheet = SVGSpriteSheet.fromSprites(sprites);

    for (var i = 0; i < sprites.length; ++i)
        blocks[i].fit = spriteSheet.spritePosition(sprites[i]);

    this.root = {
        w: spriteSheet.width(),
        h: spriteSheet.height()
    };
  },
}


