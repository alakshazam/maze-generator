import { Cell } from './Cell.js';
import { MazeRenderer } from './MazeRenderer.js';

export class MazeGenerator {
    destroy() {
        if (this.renderer) {
            this.renderer.destroy();
            this.renderer = null;
        }
        this.grid = null;
        this.startCell = null;
        this.endCell = null;
    }
    constructor(width, height, cellSize) {
        this.canvas = document.getElementById('mazeCanvas');
        this.cellSize = cellSize;
        this.cols = Math.floor(width / cellSize);
        this.rows = Math.floor(height / cellSize);
        
        // Ensure minimum size and add extra space for markers
        this.cols = Math.max(10, this.cols);
        this.rows = Math.max(10, this.rows);
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
        
        this.renderer = new MazeRenderer(this.canvas, cellSize);
        this.initializeGrid();
    }

    initializeGrid() {
        // Initialize grid with all cells
        this.grid = Array(this.rows).fill(null)
            .map((_, row) => Array(this.cols).fill(null)
                .map((_, col) => new Cell(row, col)));
        this.current = this.grid[0][0];
    }

    getRandomShape() {
        // Keep the maze rectangular for now to ensure proper path generation
        return;
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

    getConnectedNeighbors(cell) {
        const neighbors = [];
        const {row, col} = cell;
        const directions = [
            {row: -1, col: 0, wall: 'top'},
            {row: 1, col: 0, wall: 'bottom'},
            {row: 0, col: -1, wall: 'left'},
            {row: 0, col: 1, wall: 'right'}
        ];

        for (let dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols && 
                this.grid[newRow][newCol]) {
                // Check if there's no wall between the cells
                if (!cell.walls[dir.wall]) {
                    neighbors.push(this.grid[newRow][newCol]);
                }
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

    setEntranceAndExit(maxAttempts = 5) {
        if (maxAttempts <= 0) {
            // If we've tried too many times, reset to a simple grid
            this.initializeGrid();
            this.setSimpleEntranceExit();
            return;
        }

        // Reset visited status for all cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].visited = false;
                }
            }
        }

        // Find valid cells for entrance (top row)
        const entranceCandidates = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[0][col]) {
                entranceCandidates.push({row: 0, col});
            }
        }

        // Find valid cells for exit (bottom row)
        const exitCandidates = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.grid[this.rows - 1][col]) {
                exitCandidates.push({row: this.rows - 1, col});
            }
        }

        // If we have valid candidates, set entrance and exit
        if (entranceCandidates.length > 0 && exitCandidates.length > 0) {
            // Set entrance
            const entranceIndex = Math.floor(Math.random() * entranceCandidates.length);
            this.startPos = entranceCandidates[entranceIndex];
            this.startCell = this.grid[this.startPos.row][this.startPos.col];
            this.startCell.walls.top = false;  // Create opening in top wall

            // Set exit - try to choose an exit far from entrance
            let maxDistance = 0;
            let bestExitIndex = 0;

            for (let i = 0; i < exitCandidates.length; i++) {
                const exit = exitCandidates[i];
                const distance = Math.abs(exit.col - this.startPos.col);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    bestExitIndex = i;
                }
            }

            this.endPos = exitCandidates[bestExitIndex];
            this.endCell = this.grid[this.endPos.row][this.endPos.col];
            this.endCell.walls.bottom = false;  // Create opening in bottom wall

            // Ensure the cells are properly connected
            this.findSolution();
            if (this.solution.length === 0) {
                // If no path exists, try again with a different entrance/exit
                this.setEntranceAndExit(maxAttempts - 1);
            }
        } else {
            // If no valid candidates found, reinitialize and try again
            this.initializeGrid();
            this.getRandomShape();
            this.setEntranceAndExit(maxAttempts - 1);
        }
    }

    setSimpleEntranceExit() {
        // Fallback method that creates a simple, guaranteed solvable maze
        this.startPos = {row: 0, col: Math.floor(this.cols / 2)};
        this.endPos = {row: this.rows - 1, col: Math.floor(this.cols / 2)};
        
        this.startCell = this.grid[this.startPos.row][this.startPos.col];
        this.endCell = this.grid[this.endPos.row][this.endPos.col];
        
        this.startCell.walls.top = false;
        this.endCell.walls.bottom = false;
        
        // Create a direct path between start and end
        let currentRow = this.startPos.row;
        while (currentRow < this.endPos.row) {
            const currentCell = this.grid[currentRow][this.startPos.col];
            const nextCell = this.grid[currentRow + 1][this.startPos.col];
            currentCell.walls.bottom = false;
            nextCell.walls.top = false;
            currentRow++;
        }
    }

    findSolution() {
        if (!this.startCell || !this.endCell) return;

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

        // Use Dijkstra's algorithm to find shortest path
        this.startCell.distance = 0;
        const unvisited = [this.startCell];

        while (unvisited.length > 0) {
            // Get cell with minimum distance
            const current = unvisited.reduce((min, cell) => 
                cell.distance < min.distance ? cell : min
            );

            if (current === this.endCell) break;

            // Remove current from unvisited
            const index = unvisited.indexOf(current);
            unvisited.splice(index, 1);
            current.visited = true;

            // Check all connected neighbors
            const neighbors = this.getConnectedNeighbors(current);
            for (let neighbor of neighbors) {
                if (!neighbor.visited) {
                    const distance = current.distance + 1;
                    if (distance < neighbor.distance) {
                        neighbor.distance = distance;
                        neighbor.previous = current;
                        if (!unvisited.includes(neighbor)) {
                            unvisited.push(neighbor);
                        }
                    }
                }
            }
        }

        // Build solution path
        this.solution = [];
        let current = this.endCell;
        while (current) {
            this.solution.unshift(current);
            current = current.previous;
        }
    }

    generate() {
        // Initialize grid with all cells
        this.initializeGrid();
        
        // Start from a random cell
        const startRow = Math.floor(Math.random() * this.rows);
        const startCol = Math.floor(Math.random() * this.cols);
        this.current = this.grid[startRow][startCol];
        
        // Mark the starting cell as visited
        this.current.visited = true;
        this.stack = [this.current];
        
        // Use depth-first search with backtracking to generate the maze
        while (this.stack.length > 0) {
            const neighbors = this.getUnvisitedNeighbors(this.current);
            
            if (neighbors.length > 0) {
                // Choose a random unvisited neighbor
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                const next = randomNeighbor.cell;
                
                // Remove walls between current cell and chosen neighbor
                this.removeWalls(this.current, next, randomNeighbor.wall);
                
                // Mark the chosen neighbor as visited and move to it
                next.visited = true;
                this.stack.push(next);
                this.current = next;
            } else {
                // No unvisited neighbors, backtrack
                this.current = this.stack.pop();
            }
        }

        // Set entrance and exit points
        this.setEntranceAndExit();

        // Find solution path
        this.findSolution();

        // Draw the maze
        this.renderer.draw(this);
    }
}
