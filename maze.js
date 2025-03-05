class Cell {
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

class MazeGenerator {
    constructor(width, height, cellSize) {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = cellSize;
        this.cols = Math.floor(width / cellSize);
        this.rows = Math.floor(height / cellSize);
        
        // Add extra space around the maze for entrance/exit markers
        this.canvas.width = (this.cols + 2) * cellSize;
        this.canvas.height = (this.rows + 2) * cellSize;
        
        this.grid = [];
        this.stack = [];
        this.current = null;
        this.startCell = null;
        this.endCell = null;
        this.startPos = null;  // {row, col} for entrance
        this.endPos = null;   // {row, col} for exit
        this.solution = [];
        
        this.initializeGrid();
    }

    initializeGrid() {
        // Create the grid of cells
        for (let row = 0; row < this.rows; row++) {
            let rowArray = [];
            for (let col = 0; col < this.cols; col++) {
                rowArray.push(new Cell(row, col));
            }
            this.grid.push(rowArray);
        }
        this.current = this.grid[0][0];
    }

    getRandomShape() {
        // Create a random shape by marking some cells as invalid
        const centerRow = Math.floor(this.rows / 2);
        const centerCol = Math.floor(this.cols / 2);
        const radius = Math.min(this.rows, this.cols) / 3;

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                // Create various random shapes by combining different mathematical functions
                const distanceFromCenter = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
                const angle = Math.atan2(row - centerRow, col - centerCol);
                const randomFactor = Math.sin(angle * 3) * radius / 4;

                if (distanceFromCenter > radius + randomFactor) {
                    this.grid[row][col] = null;
                }
            }
        }
    }

    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const {row, col} = cell;

        // Check all four directions
        const directions = [
            {row: -1, col: 0, wall: 'top'},    // top
            {row: 1, col: 0, wall: 'bottom'},   // bottom
            {row: 0, col: -1, wall: 'left'},    // left
            {row: 0, col: 1, wall: 'right'}     // right
        ];

        for (let dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols && 
                this.grid[newRow][newCol] && 
                !this.grid[newRow][newCol].visited) {
                neighbors.push({
                    cell: this.grid[newRow][newCol],
                    wall: dir.wall
                });
            }
        }

        return neighbors;
    }

    removeWalls(current, next, wall) {
        const oppositeWalls = {
            'top': 'bottom',
            'right': 'left',
            'bottom': 'top',
            'left': 'right'
        };

        current.walls[wall] = false;
        next.walls[oppositeWalls[wall]] = false;
    }

    generate() {
        this.getRandomShape();
        
        // Find a valid starting cell
        let startRow = 0;
        let startCol = 0;
        let foundStart = false;
        
        // Search for a valid starting cell
        for (let row = 0; row < this.rows && !foundStart; row++) {
            for (let col = 0; col < this.cols && !foundStart; col++) {
                if (this.grid[row][col] !== null) {
                    startRow = row;
                    startCol = col;
                    foundStart = true;
                }
            }
        }
        
        // If no valid cell found, reset grid and try again
        if (!foundStart) {
            // Reset grid to ensure all cells are valid
            this.grid = [];
            this.initializeGrid();
            startRow = 0;
            startCol = 0;
        }
        
        this.current = this.grid[startRow][startCol];
        this.current.visited = true;
        this.stack = [this.current];

        while (this.stack.length > 0) {
            const neighbors = this.getUnvisitedNeighbors(this.current);
            
            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                const next = randomNeighbor.cell;
                this.removeWalls(this.current, next, randomNeighbor.wall);
                next.visited = true;
                this.stack.push(next);
                this.current = next;
            } else {
                this.current = this.stack.pop();
            }
        }
        
        // Set entrance and exit points
        this.setEntranceAndExit();
        
        // Find solution path
        this.findSolution();

        this.draw();
    }

    draw() {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Offset all drawing by one cell size to make room for markers
        const offsetX = this.cellSize;
        const offsetY = this.cellSize;
        
        // Draw all cells and walls
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (!cell) continue;

                const x = offsetX + col * this.cellSize;
                const y = offsetY + row * this.cellSize;

                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();

                // Draw walls, skipping the entrance and exit
                if (cell.walls.top && !(row === this.startPos.row && col === this.startPos.col)) {
                    this.ctx.moveTo(x, y);
                    this.ctx.lineTo(x + this.cellSize, y);
                }
                if (cell.walls.right) {
                    this.ctx.moveTo(x + this.cellSize, y);
                    this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
                }
                if (cell.walls.bottom && !(row === this.endPos.row && col === this.endPos.col)) {
                    this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
                    this.ctx.lineTo(x, y + this.cellSize);
                }
                if (cell.walls.left) {
                    this.ctx.moveTo(x, y + this.cellSize);
                    this.ctx.lineTo(x, y);
                }

                this.ctx.stroke();
            }
        }
        
        // Draw start marker (outside the maze)
        if (this.startPos) {
            const x = offsetX + this.startPos.col * this.cellSize;
            const y = this.startPos.row === 0 ? 0 : offsetY + (this.rows + 0.5) * this.cellSize;
            
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
        
        // Draw end marker (outside the maze)
        if (this.endPos) {
            const x = offsetX + this.endPos.col * this.cellSize;
            const y = this.endPos.row === this.rows-1 ? offsetY + (this.rows + 1) * this.cellSize : 0;
            
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
    
    setEntranceAndExit() {
        // Reset all cells' visited status for pathfinding
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].visited = false;
                }
            }
        }
        
        // Find valid cells in the top row for entrance
        const topCells = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[0][col]) {
                topCells.push({col, row: 0});
            }
        }
        
        // Find valid cells in the bottom row for exit
        const bottomCells = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[this.rows - 1][col]) {
                bottomCells.push({col, row: this.rows - 1});
            }
        }
        
        // Randomly select entrance and exit
        if (topCells.length > 0 && bottomCells.length > 0) {
            // Set entrance (start)
            const startIndex = Math.floor(Math.random() * topCells.length);
            this.startPos = topCells[startIndex];
            this.startCell = this.grid[this.startPos.row][this.startPos.col];
            this.startCell.walls.top = false;  // Remove top wall for entrance
            
            // Set exit (finish)
            const endIndex = Math.floor(Math.random() * bottomCells.length);
            this.endPos = bottomCells[endIndex];
            this.endCell = this.grid[this.endPos.row][this.endPos.col];
            this.endCell.walls.bottom = false;  // Remove bottom wall for exit
        }
        
        // Find cells along the outer edge only
        const edgeCells = [];
        
        // Top and bottom edges
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[0][col]) edgeCells.push({cell: this.grid[0][col], edge: 'top'});
            if (this.grid[this.rows-1][col]) edgeCells.push({cell: this.grid[this.rows-1][col], edge: 'bottom'});
        }
        
        // Left and right edges (excluding corners already counted)
        for (let row = 1; row < this.rows-1; row++) {
            if (this.grid[row][0]) edgeCells.push({cell: this.grid[row][0], edge: 'left'});
            if (this.grid[row][this.cols-1]) edgeCells.push({cell: this.grid[row][this.cols-1], edge: 'right'});
        }
        
        // If no edge cells, use any valid cells (fallback)
        if (edgeCells.length === 0) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.grid[row][col]) {
                        const edge = row === 0 ? 'top' : 
                                   row === this.rows-1 ? 'bottom' : 
                                   col === 0 ? 'left' : 
                                   col === this.cols-1 ? 'right' : null;
                        edgeCells.push({cell: this.grid[row][col], edge});
                    }
                }
            }
        }
        
        // Randomly select start and end from edge cells
        if (edgeCells.length >= 2) {
            // Select start point
            const startIndex = Math.floor(Math.random() * edgeCells.length);
            const startInfo = edgeCells[startIndex];
            this.startCell = startInfo.cell;
            
            // Create opening in the outer wall for start
            if (startInfo.edge === 'top') this.startCell.walls.top = false;
            else if (startInfo.edge === 'right') this.startCell.walls.right = false;
            else if (startInfo.edge === 'bottom') this.startCell.walls.bottom = false;
            else if (startInfo.edge === 'left') this.startCell.walls.left = false;
            
            // Find the farthest cell from start for end point
            let maxDistance = 0;
            let farthestCellInfo = null;
            
            // Breadth-first search to find distances
            this.startCell.distance = 0;
            const queue = [this.startCell];
            
            while (queue.length > 0) {
                const current = queue.shift();
                current.visited = true;
                
                const neighbors = this.getConnectedNeighbors(current);
                for (const neighbor of neighbors) {
                    if (!neighbor.visited) {
                        neighbor.distance = current.distance + 1;
                        neighbor.previous = current;
                        neighbor.visited = true;
                        queue.push(neighbor);
                        
                        // Check if this is a farthest edge cell
                        const isEdgeCell = edgeCells.some(ec => ec.cell === neighbor);
                        if (isEdgeCell && neighbor.distance > maxDistance) {
                            maxDistance = neighbor.distance;
                            farthestCellInfo = edgeCells.find(ec => ec.cell === neighbor);
                        }
                    }
                }
            }
            
            // If no farthest edge cell found, pick another edge cell
            if (!farthestCellInfo) {
                // Filter out the start cell
                const remainingEdgeCells = edgeCells.filter(ec => ec.cell !== this.startCell);
                if (remainingEdgeCells.length > 0) {
                    farthestCellInfo = remainingEdgeCells[Math.floor(Math.random() * remainingEdgeCells.length)];
                } else {
                    farthestCellInfo = {cell: this.startCell, edge: startInfo.edge};
                }
            }
            
            // Set end cell
            this.endCell = farthestCellInfo.cell;
            
            // Create opening in the outer wall for end
            if (farthestCellInfo.edge === 'top') this.endCell.walls.top = false;
            else if (farthestCellInfo.edge === 'right') this.endCell.walls.right = false;
            else if (farthestCellInfo.edge === 'bottom') this.endCell.walls.bottom = false;
            else if (farthestCellInfo.edge === 'left') this.endCell.walls.left = false;
            
        } else if (edgeCells.length === 1) {
            // Only one cell available
            const cellInfo = edgeCells[0];
            this.startCell = cellInfo.cell;
            this.endCell = cellInfo.cell;
            
            // Create opening in the outer wall
            if (cellInfo.edge === 'top') this.startCell.walls.top = false;
            else if (cellInfo.edge === 'right') this.startCell.walls.right = false;
            else if (cellInfo.edge === 'bottom') this.startCell.walls.bottom = false;
            else if (cellInfo.edge === 'left') this.startCell.walls.left = false;
        } else {
            // No cells available
            this.startCell = null;
            this.endCell = null;
        }
        
        // Reset visited status for all cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].visited = false;
                    this.grid[row][col].distance = Infinity;
                    this.grid[row][col].previous = null;
                }
            }
        }
    }
    
    getConnectedNeighbors(cell) {
        const neighbors = [];
        const {row, col} = cell;
        
        // Check all four directions
        if (!cell.walls.top && row > 0 && this.grid[row-1][col]) {
            neighbors.push(this.grid[row-1][col]);
        }
        if (!cell.walls.right && col < this.cols-1 && this.grid[row][col+1]) {
            neighbors.push(this.grid[row][col+1]);
        }
        if (!cell.walls.bottom && row < this.rows-1 && this.grid[row+1][col]) {
            neighbors.push(this.grid[row+1][col]);
        }
        if (!cell.walls.left && col > 0 && this.grid[row][col-1]) {
            neighbors.push(this.grid[row][col-1]);
        }
        
        return neighbors;
    }
    
    findSolution() {
        if (!this.startCell || !this.endCell) {
            this.solution = [];
            return;
        }
        
        // Reset all cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].visited = false;
                    this.grid[row][col].distance = Infinity;
                    this.grid[row][col].previous = null;
                }
            }
        }
        
        // Dijkstra's algorithm to find shortest path
        this.startCell.distance = 0;
        const unvisited = [];
        
        // Add all cells to unvisited list
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    unvisited.push(this.grid[row][col]);
                }
            }
        }
        
        while (unvisited.length > 0) {
            // Find unvisited cell with minimum distance
            unvisited.sort((a, b) => a.distance - b.distance);
            const current = unvisited.shift();
            
            // If we reached the end or there's no path
            if (current.distance === Infinity) break;
            if (current === this.endCell) break;
            
            current.visited = true;
            
            // Check all connected neighbors
            const neighbors = this.getConnectedNeighbors(current);
            for (const neighbor of neighbors) {
                if (!neighbor.visited) {
                    const distance = current.distance + 1;
                    if (distance < neighbor.distance) {
                        neighbor.distance = distance;
                        neighbor.previous = current;
                    }
                }
            }
        }
        
        // Reconstruct path from end to start
        this.solution = [];
        let current = this.endCell;
        
        while (current && current !== this.startCell) {
            this.solution.push(current);
            current = current.previous;
        }
    }
}

// Initialize the maze generator
let mazeGen;

function initMaze() {
    console.log('Initializing maze...');
    const defaultSize = 600;
    const size = Math.max(defaultSize, Math.min(window.innerWidth - 40, window.innerHeight - 100));
    mazeGen = new MazeGenerator(size, size, 30);
    mazeGen.generate();
    console.log('Maze generated.');
}

// Add event listeners
document.getElementById('regenerateBtn').addEventListener('click', () => {
    console.log('Regenerate button clicked.');
    initMaze();
});
window.addEventListener('load', () => {
    console.log('Window loaded.');
    initMaze();
});
window.addEventListener('resize', () => {
    console.log('Window resized.');
    initMaze();
});
