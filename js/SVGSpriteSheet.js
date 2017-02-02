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

SVGSprite.SortOrder = {
    Width: (a, b) => b.width - a.width,
    Height: (a, b) => b.height - a.height,
    MaxSide: (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
    Area: (a, b) => b.width * b.height - a.width * a.height
};

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
     * @return {string}
     */
    svgText() {
        if (this._svgText)
            return this._svgText;
        var svgs = [];
        for (var sprite of this._sprites) {
            var svg = sprite.content.trim();
            if (svg.startsWith('<?xml')) {
                var headerIndexEnd = svg.indexOf('?>');
                svg = svg.substring(headerIndexEnd + 2);
            }

            var position = this._positions.get(sprite);

            // Wrap sprite to SVG container with proper position.
            svg = [
                `<svg x="${position.x}" y="${position.y}" width="${sprite.width}" height="${sprite.height}">`,
                svg,
                '</svg>'
            ].join('');
            svgs.push(svg);
        }
        return [
            '<?xml version="1.0" encoding="utf-8"?>',
            `<svg width="${this._width}" height="${this._height}" xmlns="http://www.w3.org/2000/svg">`,
            svgs.join('\n'),
            '</svg>'
        ].join('\n');
    }

    /**
     * @param {!Array<!SVGSprite>} sprites
     * @param {!SVGSprite.SortOrder} spriteComparator
     * @param {number} rightPadding
     * @param {number} bottomPadding
     * @return {!SVGSpriteSheet}
     */
    static fromSprites(sprites, spriteComparator, rightPadding, bottomPadding) {
        console.assert(sprites.length, 'cannot create spritesheet with 0 sprites!');
        if (spriteComparator)
            sprites.sort(spriteComparator);

        var totalWidth = sprites[0].width + rightPadding;
        var totalHeight = sprites[0].height + bottomPadding;
        /** @type {!Map<!SVGSprite, !{x: number, y: number}>} */
        var positions = new Map();

        var freeSpaces = new Set();
        freeSpaces.add({x: 0, y: 0, width: totalWidth, height: totalHeight});
        for (var sprite of sprites) {
            var spriteWidth = sprite.width + rightPadding;
            var spriteHeight = sprite.height + bottomPadding;
            var freeSpace = null;
            for (var space of freeSpaces) {
                if (space.width >= spriteWidth && space.height >= spriteHeight) {
                    freeSpace = space;
                    break;
                }
            }

            if (!freeSpace) {
                var canGrowRight = spriteHeight <= totalHeight;
                var canGrowDown  = spriteWidth <= totalWidth;
                console.assert(canGrowDown || canGrowRight, 'cannot grow spritesheet in either direction!');
                // Lean towards square sprite sheet.
                var growRightAspectRatio = Math.abs(totalHeight / (totalWidth + spriteWidth) - 1);
                var growDownAspectRatio = Math.abs((totalHeight + spriteHeight) / totalWidth - 1);
                if (!canGrowDown || (canGrowRight && growRightAspectRatio < growDownAspectRatio)) {
                    freeSpace = {x: totalWidth, y: 0, width: spriteWidth, height: totalHeight};
                    totalWidth += spriteWidth;
                } else {
                    freeSpace = {x: 0, y: totalHeight, width: totalWidth, height: spriteHeight};
                    totalHeight += spriteHeight;
                }
            } else {
                freeSpaces.delete(freeSpace);
            }

            positions.set(sprite, {x: freeSpace.x, y: freeSpace.y});

            var rightSpace = {
                x: freeSpace.x + spriteWidth,
                y: freeSpace.y,
                width: freeSpace.width - spriteWidth,
                height: spriteHeight
            };
            var downSpace = {
                x: freeSpace.x,
                y: freeSpace.y + spriteHeight,
                width: freeSpace.width,
                height: freeSpace.height - spriteHeight
            };
            if (rightSpace.width && rightSpace.height)
                freeSpaces.add(rightSpace);
            if (downSpace.width && downSpace.height)
                freeSpaces.add(downSpace);
        }
        return new SVGSpriteSheet(totalWidth, totalHeight, sprites, positions);
    }
}

if (typeof module !== 'undefined') {
    module.exports.SVGSprite = SVGSprite;
    module.exports.SVGSpriteSheet = SVGSpriteSheet;
}
