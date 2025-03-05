import { Cell } from './Cell.js';
import { MazeRenderer } from './MazeRenderer.js';

export class MazeGenerator {
    constructor(width, height, cellSize) {
        this.canvas = document.getElementById('mazeCanvas');
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
        
        this.renderer = new MazeRenderer(this.canvas, cellSize);
        this.initializeGrid();
    }

    destroy() {
        this.grid = [];
        this.stack = [];
        this.current = null;
        this.startCell = null;
        this.endCell = null;
        this.solution = [];
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

    getNeighbors(cell) {
        const neighbors = [];
        const {row, col} = cell;
        
        // Check all four directions
        const directions = [
            {row: -1, col: 0, wall: 'top'},    // Top
            {row: 0, col: 1, wall: 'right'},   // Right
            {row: 1, col: 0, wall: 'bottom'},  // Bottom
            {row: 0, col: -1, wall: 'left'}    // Left
        ];
        
        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            
            if (newRow >= 0 && newRow < this.rows && 
                newCol >= 0 && newCol < this.cols && 
                !this.grid[newRow][newCol].visited) {
                const neighbor = {
                    cell: this.grid[newRow][newCol],
                    wall: dir.wall
                };
                neighbors.push(neighbor);
            }
        }
        
        return neighbors;
    }

    removeWalls(current, next, wall) {
        // Remove walls between current and next cell
        switch(wall) {
            case 'top':
                current.walls.top = false;
                next.walls.bottom = false;
                break;
            case 'right':
                current.walls.right = false;
                next.walls.left = false;
                break;
            case 'bottom':
                current.walls.bottom = false;
                next.walls.top = false;
                break;
            case 'left':
                current.walls.left = false;
                next.walls.right = false;
                break;
        }
    }

    generate() {
        // Reset everything
        this.destroy();
        this.initializeGrid();
        this.renderer.clear();
        
        // Start with the first cell
        this.current = this.grid[0][0];
        this.current.visited = true;
        this.stack.push(this.current);
        
        // Continue until we've visited all cells
        while (this.stack.length > 0) {
            this.current = this.stack.pop();
            const neighbors = this.getNeighbors(this.current);
            
            if (neighbors.length > 0) {
                this.stack.push(this.current);
                
                // Choose random neighbor
                const randIndex = Math.floor(Math.random() * neighbors.length);
                const next = neighbors[randIndex];
                
                // Remove walls between current and chosen cell
                this.removeWalls(this.current, next.cell, next.wall);
                
                // Mark the chosen cell as visited and push it to the stack
                next.cell.visited = true;
                this.stack.push(next.cell);
            }
        }
        
        // Set entrance and exit
        this.startPos = {row: 0, col: 0};
        this.endPos = {row: this.rows - 1, col: this.cols - 1};
        this.startCell = this.grid[this.startPos.row][this.startPos.col];
        this.endCell = this.grid[this.endPos.row][this.endPos.col];
        
        // Draw the maze
        this.draw();
    }

    draw() {
        this.renderer.clear();
        
        // Draw all cells
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.renderer.drawCell(this.grid[row][col]);
            }
        }
        
        // Draw entrance and exit
        this.renderer.drawEntrance(this.startPos.row, this.startPos.col);
        this.renderer.drawExit(this.endPos.row, this.endPos.col);
    }
}
