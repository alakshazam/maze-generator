export class MazeRenderer {
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCell(cell, color = null) {
        const x = (cell.col + 1) * this.cellSize;  // +1 for the border
        const y = (cell.row + 1) * this.cellSize;  // +1 for the border

        // Fill cell if color provided
        if (color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }

        // Draw walls
        this.ctx.strokeStyle = '#000';
        this.ctx.beginPath();
        
        if (cell.walls.top) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + this.cellSize, y);
        }
        if (cell.walls.right) {
            this.ctx.moveTo(x + this.cellSize, y);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.bottom) {
            this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.stroke();
    }

    drawEntrance(x, y) {
        const startX = (x + 1) * this.cellSize;
        const startY = (y + 1) * this.cellSize;
        
        this.ctx.fillStyle = '#4CAF50';  // Green
        this.ctx.beginPath();
        this.ctx.arc(startX + this.cellSize / 2, startY + this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawExit(x, y) {
        const endX = (x + 1) * this.cellSize;
        const endY = (y + 1) * this.cellSize;
        
        this.ctx.fillStyle = '#f44336';  // Red
        this.ctx.beginPath();
        this.ctx.arc(endX + this.cellSize / 2, endY + this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
