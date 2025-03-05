# Visual Maze Generator and Solver

An interactive web-based maze generator and solver that uses the A* pathfinding algorithm to visually demonstrate the solving process.

## Features

- Random maze generation using depth-first search
- Visual maze solving using A* pathfinding algorithm
- Real-time visualization of the solving process
- Interactive controls for generating and solving mazes
- Statistics display showing solve time and explored cells

## Try It Out

Visit [https://[your-username].github.io/maze-generator](https://[your-username].github.io/maze-generator) to try the maze generator!

## How to Use

1. Click "New Maze" to generate a random maze
2. Click "Solve Maze" to watch the A* algorithm find the optimal path
3. The solving process will be visualized:
   - Orange cells show explored paths
   - Green cells show the final solution path
   - Stats will display solving time and number of cells explored

## Development

To run locally:
1. Clone the repository
2. Run `python3 -m http.server 8000` in the project directory
3. Open `http://localhost:8000` in your browser
