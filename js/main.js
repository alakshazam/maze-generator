import { MazeGenerator } from '/maze-generator/js/modules/MazeGenerator.js';
import { MazeSolver } from '/maze-generator/js/modules/MazeSolver.js';

let mazeGen;
let mazeSolver;

function resetCanvas() {
    const canvas = document.getElementById('mazeCanvas');
    // Store original dimensions
    const originalWidth = canvas.width;
    const originalHeight = canvas.height;
    
    // Reset canvas by recreating it
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'mazeCanvas';
    newCanvas.width = originalWidth;
    newCanvas.height = originalHeight;
    
    // Replace old canvas
    canvas.parentNode.replaceChild(newCanvas, canvas);
    return newCanvas;
}

function initMaze() {
    console.log('Initializing maze...');
    const cellSize = 25;
    const width = Math.min(window.innerWidth - 100, 500);
    const height = Math.min(window.innerHeight - 100, 500);
    
    // Completely destroy and recreate canvas
    const freshCanvas = resetCanvas();
    
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
    mazeGen = new MazeGenerator(width, height, cellSize);
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
