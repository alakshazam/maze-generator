import { MazeGenerator } from './modules/MazeGenerator.js';
import { MazeSolver } from './modules/MazeSolver.js';

let mazeGen;
let mazeSolver;

function resetCanvas() {
    const canvas = document.getElementById('mazeCanvas');
    const width = Math.min(window.innerWidth - 100, 500);
    const height = Math.min(window.innerHeight - 100, 500);
    
    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;
    
    return canvas;
}

function initMaze() {
    console.log('Initializing maze...');
    const cellSize = 25;
    
    // Reset canvas and get dimensions
    const canvas = resetCanvas();
    const width = canvas.width;
    const height = canvas.height;
    
    // Nullify existing instances
    if (mazeSolver) {
        mazeSolver.destroy();
        mazeSolver = null;
    }
    if (mazeGen) {
        mazeGen.destroy();
        mazeGen = null;
    }
    
    // Create completely new instances
    mazeGen = new MazeGenerator(canvas, width, height, cellSize);
    mazeGen.generate();
    
    // Create new solver with fresh state
    mazeSolver = new MazeSolver(mazeGen, mazeGen.renderer);
    
    // Reset stats
    document.getElementById('stats').innerHTML = '';
}

// Initialize maze when the window loads
window.addEventListener('load', initMaze);

// Add event listener for regenerate button
document.getElementById('regenerateBtn').addEventListener('click', () => {
    console.log('Regenerate button clicked.');
    // Force a complete reset and regeneration
    initMaze();
});

// Add event listener for solve button
document.getElementById('solveBtn').addEventListener('click', async () => {
    console.log('Solve button clicked.');
    if (mazeSolver) {
        mazeSolver.stop(); // Stop any ongoing solving animation
        await mazeSolver.solve();
    }
});
