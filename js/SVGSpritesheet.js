class SVGSprite {
    /**
     * @param {string} filePath
     * @param {string} content
     * @param {number} width
     * @param {number} height
     */
    constructor(filePath, content, width, height) {
        this.filePath = filePath;
        this.content = content;
        this.width = width;
        this.height = height;
    }
}

class SVGSpriteSheet {
    /**
     * @param {number} width
     * @param {number} height
     * @param {!Array<!SVGSprite>} sprites
     * @param {!Map<!SVGSprite, !{x: number, y: number}>} positions
     */
    constructor(width, height, sprites, positions) {
        this._width = width;
        this._height = height;
        this._sprites = sprites;
        this._positions = positions;

        for (var sprite of this._sprites)
            console.assert(this._positions.has(sprite), 'all sprites must have defined positions!');
    }

    /**
     * @return {number}
     */
    width() {
        return this._width;
    }

    /**
     * @return {number}
     */
    height() {
        return this._height;
    }

    /**
     * @return {!Array<!SVGSprite>}
     */
    sprites() {
        return this._sprites;
    }

    /**
     * @return {!{x: number, y: number}}
     */
    spritePosition(sprite) {
        var position = this._positions.get(sprite);
        console.assert(position, 'do not know position of foreign sprite!');
        return position;
    }

    /**
     * @param {!Array<!SVGSprite>} sprites
     * @return {!SVGSpriteSheet}
     */
    static fromSprites(sprites) {
        console.assert(sprites.length, 'cannot create spritesheet with 0 sprites!');

        var totalWidth = sprites[0].width;
        var totalHeight = sprites[0].height;
        /** @type {!Map<!SVGSprite, !{x: number, y: number}>} */
        var positions = new Map();

        var freeSpaces = new Set();
        freeSpaces.add({x: 0, y: 0, width: totalWidth, height: totalHeight});
        for (var sprite of sprites) {
            var freeSpace = null;
            for (var space of freeSpaces) {
                if (space.width >= sprite.width && space.height >= sprite.height) {
                    freeSpace = space;
                    break;
                }
            }

            if (!freeSpace) {
                var canGrowRight = sprite.height <= totalHeight;
                var canGrowDown  = sprite.width <= totalWidth;
                console.assert(canGrowDown || canGrowRight, 'cannot grow spritesheet in either direction!');
                // Lean towards square sprite sheet.
                var growRightAspectRatio = Math.abs(totalHeight / (totalWidth + sprite.width) - 1);
                var growDownAspectRatio = Math.abs((totalHeight + sprite.height) / totalWidth - 1);
                if (!canGrowDown || (canGrowRight && growRightAspectRatio < growDownAspectRatio)) {
                    freeSpace = {x: totalWidth, y: 0, width: sprite.width, height: totalHeight};
                    totalWidth += sprite.width;
                } else {
                    freeSpace = {x: 0, y: totalHeight, width: totalWidth, height: sprite.height};
                    totalHeight += sprite.height;
                }
            } else {
                freeSpaces.delete(freeSpace);
            }

            positions.set(sprite, {x: freeSpace.x, y: freeSpace.y});

            var rightSpace = {
                x: freeSpace.x + sprite.width,
                y: freeSpace.y,
                width: freeSpace.width - sprite.width,
                height: sprite.height
            };
            var downSpace = {
                x: freeSpace.x,
                y: freeSpace.y + sprite.height,
                width: freeSpace.width,
                height: freeSpace.height - sprite.height
            };
            if (rightSpace.width && rightSpace.height)
                freeSpaces.add(rightSpace);
            if (downSpace.width && downSpace.height)
                freeSpaces.add(downSpace);
        }
        return new SVGSpriteSheet(totalWidth, totalHeight, sprites, positions);
    }
}
