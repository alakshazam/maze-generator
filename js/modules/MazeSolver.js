export class MazeSolver {
    destroy() {
        this.stop();
        this.maze = null;
        this.renderer = null;
        this.visitedCells = null;
        this.pathCells = null;
        this.currentPath = null;
    }
    constructor(mazeGenerator, renderer) {
        this.maze = mazeGenerator;
        this.renderer = renderer;
        this.reset();
    }
    
    reset() {
        // Stop any ongoing animation
        this.isAnimating = false;
        
        // Reset animation settings
        this.animationSpeed = 50;
        
        // Create fresh data structures
        this.visitedCells = new Set();
        this.pathCells = new Set();
        this.currentPath = [];
        
        // Reset canvas if available
        if (this.renderer && this.maze) {
            this.renderer.resetCanvas();
            this.renderer.draw(this.maze);
        }
    }

    // Manhattan distance heuristic
    heuristic(cell, goal) {
        return Math.abs(cell.row - goal.row) + Math.abs(cell.col - goal.col);
    }

    // Get valid neighbors that have no walls between them
    getValidNeighbors(cell) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0, wall: 'top' },    // top
            { row: 1, col: 0, wall: 'bottom' },   // bottom
            { row: 0, col: -1, wall: 'left' },    // left
            { row: 0, col: 1, wall: 'right' }     // right
        ];

        for (let dir of directions) {
            const newRow = cell.row + dir.row;
            const newCol = cell.col + dir.col;

            if (newRow >= 0 && newRow < this.maze.rows &&
                newCol >= 0 && newCol < this.maze.cols &&
                this.maze.grid[newRow][newCol]) {
                // Check if there's no wall between the cells
                if (!cell.walls[dir.wall]) {
                    neighbors.push(this.maze.grid[newRow][newCol]);
                }
            }
        }

        return neighbors;
    }

    // A* pathfinding algorithm with visualization
    async solve() {
        if (this.isAnimating) return;
        
        // Reset state and prepare for new solution
        this.reset();
        document.getElementById('stats').innerHTML = 'Solving...';
        this.isAnimating = true;
        
        // Clear previous solution
        this.visitedCells.clear();
        this.pathCells.clear();
        this.currentPath = [];
        
        const start = this.maze.startCell;
        const goal = this.maze.endCell;
        
        // Priority queue for A*
        const openSet = [start];
        const cameFrom = new Map();
        
        // Cost from start to each node
        const gScore = new Map();
        gScore.set(start, 0);
        
        // Estimated total cost from start to goal through each node
        const fScore = new Map();
        fScore.set(start, this.heuristic(start, goal));
        
        const startTime = performance.now();
        let exploredCells = 0;

        while (openSet.length > 0 && this.isAnimating) {
            // Get node with lowest fScore
            const current = openSet.reduce((a, b) => 
                (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
            );
            
            if (current === goal) {
                // Reconstruct and visualize path
                let curr = current;
                while (curr) {
                    this.pathCells.add(curr);
                    curr = cameFrom.get(curr);
                    await this.animateStep();
                }
                
                const endTime = performance.now();
                const timeElapsed = ((endTime - startTime) / 1000).toFixed(2);
                document.getElementById('stats').innerHTML = 
                    `Solved in ${timeElapsed}s<br>` +
                    `Explored ${exploredCells} cells<br>` +
                    `Path length: ${this.pathCells.size} cells`;
                
                this.isAnimating = false;
                return;
            }
            
            openSet.splice(openSet.indexOf(current), 1);
            this.visitedCells.add(current);
            exploredCells++;
            
            // Visualize exploration
            await this.animateStep();
            
            for (let neighbor of this.getValidNeighbors(current)) {
                const tentativeGScore = (gScore.get(current) || 0) + 1;
                
                if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
                    cameFrom.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, goal));
                    
                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
        
        this.isAnimating = false;
        document.getElementById('stats').innerHTML = 'No solution found';
    }

    async animateStep() {
        // Draw the current state
        this.renderer.draw(this.maze, {
            visitedCells: this.visitedCells,
            pathCells: this.pathCells
        });
        
        // Wait for animation frame
        await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
    }

    stop() {
        this.isAnimating = false;
        this.reset();
    }
}
