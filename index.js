class Tile {
    constructor(opts) {
        this.svg = opts.svg;
        this.x = opts.x;
        this.y = opts.y;
        this.size = opts.size;
        this.fill = opts.fill;
        this.number = opts.number;

        // Create the svg rect.
        this.rect = this.svg
            .rect(this.size, this.size)
            .attr({
                fill: this.fill,
                x: this.x,
                y: this.y,
            });

        // Create the svg text.
        let textPos = this._getTextPosition(this.x, this.y);
        this.text = this.svg
            .text(String(this.number))
            .attr({
                x: textPos.x,
                y: textPos.y,
                'text-anchor': 'middle',
                'dominant-baseline': 'hanging',
            });

    }

    move(x, y) {
        this.rect.move(x, y);

        let textPos = this._getTextPosition(x, y);
        this.text.attr({
            x: textPos.x,
            y: textPos.y,
        });
    }

    _getTextPosition(x, y) {
        return {
            x: x + this.size / 2,
            y: y + 5, // TODO Should offset by actual text height
        }
    }
}

class Hole {
    constructor(opts) {
        this.svg = opts.svg;
        this.size = opts.size;
        this.x = opts.x;
        this.y = opts.y;

        // Create a clear svg rect to make click handling easier.
        this.rect = this.svg
            .rect(this.size, this.size)
            .attr({
                fill: 'rgba(0, 0, 0, 0)',
                x: this.x,
                y: this.y,
            });
    }

    move(x, y) {
        this.rect.move(x, y);
    }
}


class Puzzle {
    constructor(opts) {
        this.svg = opts.svg;
        this.size = opts.size;
        this.width = opts.width;
        this.height = opts.height;

        let tileSize = this.width / this.size;
        this.tiles = [];
        for (let i = 0; i < this.size; i++) {
            this.tiles.push([]);
            for (let j = 0; j < this.size; j++) {
                let num = this.size * j + i + 1;
                let x = tileSize * i;
                let y = tileSize * j;

                if (num == this.size * this.size) {
                    // Create an empty space.
                    this.tiles[i].push(new Hole({
                        svg: container,
                        size: tileSize,
                        x: x,
                        y: y,
                    }));
                }
                else {
                    // Create tile
                    this.tiles[i].push(new Tile({
                        svg: container,
                        fill: '#aaaaaa',
                        size: tileSize,
                        x: x,
                        y: y,
                        number: num,
                    }));
                }
            }
        }
        console.log(this.tiles);

    }
}


let w = 200;
let h = 200;
let container = SVG('puzzle').size(w, h);
let puzzle = new Puzzle({
    svg: container,
    width: w,
    height: h,
    size: 3,
});
