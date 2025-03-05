export class MazeRenderer {
    destroy() {
        if (this.ctx && this.canvas) {
            // Clear the entire canvas
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Remove context reference
            this.ctx = null;
            this.canvas = null;
        }
    }
    static COLORS = {
        BACKGROUND: '#ffffff',
        WALL: '#000000',
        VISITED: 'rgba(255, 165, 0, 0.2)',
        PATH: '#4CAF50',
        START: '#2196F3',
        END: '#f44336'
    };
    constructor(canvas, cellSize) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
    }

    resetCanvas() {
        if (!this.ctx || !this.canvas) return;
        
        // Reset transform and clear
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset all canvas state
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.filter = 'none';
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.strokeStyle = MazeRenderer.COLORS.WALL;
        this.ctx.fillStyle = MazeRenderer.COLORS.BACKGROUND;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'butt';
        this.ctx.lineJoin = 'miter';
        
        // Clear background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(maze, solverState = null) {
        if (!maze) return;
        
        // Reset canvas completely
        this.resetCanvas();
        
        // Offset all drawing by one cell size to make room for markers
        const offsetX = this.cellSize;
        const offsetY = this.cellSize;
        
        // Draw all cells and walls
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const cell = maze.grid[row][col];
                if (!cell) continue;

                const x = offsetX + col * this.cellSize;
                const y = offsetY + row * this.cellSize;

                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();

                // Draw walls, skipping the entrance and exit
                if (cell.walls.top && !(row === maze.startPos?.row && col === maze.startPos?.col)) {
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + this.cellSize, y);
                }
                if (cell.walls.right) {
                    this.ctx.moveTo(x + this.cellSize, y);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                }
                if (cell.walls.bottom && !(row === maze.endPos?.row && col === maze.endPos?.col)) {
                    this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.lineTo(x, y + this.cellSize);
                }
                if (cell.walls.left) {
                    this.ctx.moveTo(x, y + this.cellSize);
                    this.ctx.lineTo(x, y);
                }

                this.ctx.stroke();
                
                // Draw solver visualization if available
                if (solverState && cell) {
                    // Draw visited cells first (underneath path)
                    if (solverState.visitedCells?.has(cell)) {
                        this.ctx.fillStyle = MazeRenderer.COLORS.VISITED;
                        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    }
                    
                    // Draw path cells on top
                    if (solverState.pathCells?.has(cell)) {
                        this.ctx.fillStyle = MazeRenderer.COLORS.PATH;
                        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                    }
                }
                
                // Draw cell walls on top of everything
                this.ctx.strokeStyle = MazeRenderer.COLORS.WALL;
                this.ctx.beginPath();
            }
        }
        
        this.drawStartMarker(maze);
        this.drawEndMarker(maze);
    }

    drawStartMarker(maze) {
        if (!maze.startPos) return;

        const offsetX = this.cellSize;
        const x = offsetX + maze.startPos.col * this.cellSize;
        const y = maze.startPos.row === 0 ? 0 : offsetX + (maze.rows + 0.5) * this.cellSize;
        
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.cellSize/2, y);
        this.ctx.lineTo(x + this.cellSize, y + this.cellSize/2);
        this.ctx.lineTo(x, y + this.cellSize/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add 'S' label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${this.cellSize/3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('S', x + this.cellSize/2, y + this.cellSize/3);
    }

    drawEndMarker(maze) {
        if (!maze.endPos) return;

        const offsetX = this.cellSize;
        const x = offsetX + maze.endPos.col * this.cellSize;
        const y = maze.endPos.row === maze.rows-1 ? offsetX + (maze.rows + 1) * this.cellSize : 0;
        
        this.ctx.fillStyle = '#F44336';
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.cellSize/2, y);
        this.ctx.lineTo(x + this.cellSize, y + this.cellSize/2);
        this.ctx.lineTo(x, y + this.cellSize/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add 'F' label
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${this.cellSize/3}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('F', x + this.cellSize/2, y + this.cellSize/3);
    }
}
