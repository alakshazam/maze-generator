export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
        this.visited = false;
        this.distance = Infinity; // For path finding
        this.previous = null;    // For path finding
    }
}
