class Tile {
    constructor(opts) {
        this.svg = opts.svg;
        this.row = opts.row;
        this.col = opts.col;
        this.size = opts.size;
        this.fill = opts.fill;
        this.number = opts.number;

        this.animationSpeed = 60;

        // Create the svg rect.
        let rectPos = this._getRectPosition(this.row, this.col);
        this.rect = this.svg
            .rect(this.size, this.size)
            .attr({
                fill: this.fill,
                x: rectPos.x,
                y: rectPos.y,
            });

        // Create the svg text.
        let textPos = this._getTextPosition(this.row, this.col);
        this.text = this.svg
            .text(String(this.number))
            .attr({
                x: textPos.x,
                y: textPos.y,
                'text-anchor': 'middle',
                'dominant-baseline': 'hanging',
            });

    }

    move(row, col) {
        let rectPos = this._getRectPosition(row, col);
        this.rect.animate(this.animationSpeed).move(rectPos.x, rectPos.y);

        let textPos = this._getTextPosition(row, col);
        this.text.animate(this.animationSpeed).attr({
            x: textPos.x,
            y: textPos.y,
        });
    }

    _getRectPosition(row, col) {
        return {
            x: this.size * row,
            y: this.size * col,
        }
    }

    _getTextPosition(row, col) {
        return {
            x: this.size * row + this.size / 2,
            y: this.size * col + 5, // TODO Should offset by actual text height
        }
    }
}

class Hole {
    constructor(opts) {
        this.svg = opts.svg;
        this.size = opts.size;
        this.row = opts.row;
        this.col = opts.col;

        // Create a clear svg rect to make click handling easier.
        let rectPos = this._getRectPosition(this.row, this.col);
        this.rect = this.svg
            .rect(this.size, this.size)
            .attr({
                fill: 'rgba(0, 0, 0, 0)',
                x: rectPos.x,
                y: rectPos.y,
            });
    }

    move(row, col) {
        let rectPos = this._getRectPosition(row, col);
        this.rect.move(rectPos.x, rectPos.y);
    }

    _getRectPosition(row, col) {
        return {
            x: this.size * row,
            y: this.size * col,
        }
    }
}


class Puzzle {
    constructor(opts) {
        this.container = opts.container;
        this.size = opts.size;
        this.width = opts.width;
        this.height = opts.height;

        this.svg = SVG(this.container).size(this.width, this.height);

        let tileSize = this.width / this.size;
        this.tiles = [];
        for (let i = 0; i < this.size; i++) {
            this.tiles.push([]);
            for (let j = 0; j < this.size; j++) {
                let num = this.size * j + i + 1;

                if (num == this.size * this.size) {
                    // Create an empty space.
                    this.tiles[i].push(new Hole({
                        svg: this.svg,
                        size: tileSize,
                        row: i,
                        col: j,
                    }));
                }
                else {
                    // Create tile
                    this.tiles[i].push(new Tile({
                        svg: this.svg,
                        fill: '#aaaaaa',
                        size: tileSize,
                        row: i,
                        col: j,
                        number: num,
                    }));
                }
            }
        }

    }

    move(row, col) {
        // TODO
        this.tiles[col][row].move(row, col + 1);
    }
}


let puzzle = new Puzzle({
    container: document.getElementById('puzzle'),
    width: 200,
    height: 200,
    size: 3,
});
