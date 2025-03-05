export class MazeSolver {
    constructor(mazeGenerator, renderer) {
        this.maze = mazeGenerator;
        this.renderer = renderer;
        this.reset();
    }

    destroy() {
        this.stop();
        this.maze = null;
        this.renderer = null;
        this.visitedCells = null;
        this.pathCells = null;
        this.currentPath = null;
    }

    reset() {
        // Stop any ongoing animation
        this.isAnimating = false;
        
        // Reset animation settings
        this.animationSpeed = 50;
        this.visitedCells = new Set();
        this.pathCells = new Set();
        this.currentPath = [];
        
        // Reset stats
        this.startTime = null;
        this.endTime = null;
        this.cellsExplored = 0;
    }

    stop() {
        this.isAnimating = false;
    }

    async solve() {
        if (!this.maze || !this.maze.startCell || !this.maze.endCell) return;
        
        // Reset state
        this.reset();
        this.startTime = performance.now();
        
        // Initialize data structures for Dijkstra's algorithm
        const unvisited = new Set();
        const distances = new Map();
        const previous = new Map();
        
        // Add all cells to unvisited set and initialize distances
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                unvisited.add(cell);
                distances.set(cell, Infinity);
            }
        }
        
        // Set distance to start as 0
        distances.set(this.maze.startCell, 0);
        
        // Start animation
        this.isAnimating = true;
        
        while (unvisited.size > 0 && this.isAnimating) {
            // Find unvisited cell with minimum distance
            let current = null;
            let minDistance = Infinity;
            
            for (const cell of unvisited) {
                const distance = distances.get(cell);
                if (distance < minDistance) {
                    minDistance = distance;
                    current = cell;
                }
            }
            
            // If we can't find a cell or we've reached the end, break
            if (!current || current === this.maze.endCell) break;
            if (minDistance === Infinity) break;
            
            // Remove current from unvisited
            unvisited.delete(current);
            
            // Get connected neighbors
            const neighbors = this.getConnectedNeighbors(current);
            
            // Update distances to neighbors
            for (const neighbor of neighbors) {
                if (!unvisited.has(neighbor)) continue;
                
                const distance = distances.get(current) + 1;
                if (distance < distances.get(neighbor)) {
                    distances.set(neighbor, distance);
                    previous.set(neighbor, current);
                }
            }
            
            // Visualize exploration
            if (current !== this.maze.startCell) {
                this.visitedCells.add(current);
                this.cellsExplored++;
                await this.visualize();
            }
        }
        
        // If we found the end, construct and visualize path
        if (previous.has(this.maze.endCell)) {
            let current = this.maze.endCell;
            while (current !== this.maze.startCell) {
                this.pathCells.add(current);
                current = previous.get(current);
                if (this.isAnimating) {
                    await this.visualize();
                }
            }
        }
        
        // Record end time and update stats
        this.endTime = performance.now();
        this.updateStats();
    }

    getConnectedNeighbors(cell) {
        const neighbors = [];
        const {row, col} = cell;
        
        // Check all four directions
        if (!cell.walls.top && row > 0) {
            neighbors.push(this.maze.grid[row-1][col]);
        }
        if (!cell.walls.right && col < this.maze.cols-1) {
            neighbors.push(this.maze.grid[row][col+1]);
        }
        if (!cell.walls.bottom && row < this.maze.rows-1) {
            neighbors.push(this.maze.grid[row+1][col]);
        }
        if (!cell.walls.left && col > 0) {
            neighbors.push(this.maze.grid[row][col-1]);
        }
        
        return neighbors;
    }

    async visualize() {
        // Draw the base maze
        this.maze.draw();
        
        // Draw visited cells
        for (const cell of this.visitedCells) {
            this.renderer.drawCell(cell, 'rgba(255, 165, 0, 0.3)'); // Orange with transparency
        }
        
        // Draw solution path
        for (const cell of this.pathCells) {
            this.renderer.drawCell(cell, 'rgba(0, 255, 0, 0.3)'); // Green with transparency
        }
        
        // Add delay for animation
        if (this.isAnimating) {
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
        }
    }

    updateStats() {
        const timeSpent = ((this.endTime - this.startTime) / 1000).toFixed(2);
        const statsDiv = document.getElementById('stats');
        statsDiv.innerHTML = `
            ⏱️ Time: ${timeSpent}s<br>
            🔍 Cells explored: ${this.cellsExplored}<br>
            📏 Path length: ${this.pathCells.size}
        `;
    }
}
