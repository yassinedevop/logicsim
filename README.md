# Logic Gate Simulator

A web-based interactive logic gate simulator that allows users to create and test digital logic circuits using various logic gates.

## Features

- **Interactive Canvas**: Drag and drop interface for placing and connecting components
- **Multiple Gate Types**: Supports various logic gates:
  - AND
  - OR
  - NOT
  - NAND
  - NOR
  - XOR
- **Input/Output Components**: 
  - Toggle-able input nodes (click to change state)
  - Output nodes that display the result
- **Real-time Evaluation**: Circuit updates automatically as inputs change
- **Connection Management**:
  - Click-to-connect interface
  - Visual feedback while making connections
  - Delete connections by clicking on them
  - ESC key to cancel connection in progress
- **Component Management**:
  - Drag components to reposition
  - Delete zone at bottom of canvas for removing components
  - Automatic cleanup of connections when components are deleted

## Usage

### Basic Controls

1. **Adding Components**:
   - Click a component type from the toolbar
   - Click on the canvas to place the component

2. **Making Connections**:
   - Click on a connection point (small circle) to start a connection
   - Click on another compatible connection point to complete the connection
   - Press ESC to cancel a connection in progress

3. **Managing Components**:
   - Drag components to move them
   - Drag to the red deletion zone to remove components
   - Click on input nodes to toggle their state (true/false)

4. **Managing Connections**:
   - Click on any connection line to delete it
   - Connections automatically show the signal state (green for true, red for false)

### Connection Rules

- Outputs can only connect to inputs
- Inputs can only connect to outputs
- Logic gates (except NOT) require both inputs to be connected for proper operation
- Multiple connections can be made from a single output
- Each input can only accept one connection

## Visual Indicators

- **Connection Points**: Small circles on components
- **Signal States**:
  - Green: TRUE/HIGH/1
  - Red: FALSE/LOW/0
- **Preview Line**: Dashed line while making connections
- **Delete Zone**: Red area at bottom of canvas
- **Status Messages**: Updates shown in status bar

## Implementation Details

The simulator is built using vanilla JavaScript and HTML5 Canvas. Key classes:

- `Component`: Handles individual logic gate components
- `LogicSimulator`: Manages the overall simulation and user interaction

## Future Enhancements

Potential features to be added:
- Save/Load circuits
- Additional gate types
- Custom component creation
- Circuit validation
- Undo/Redo functionality

## Getting Started

1. Include the required files in your HTML:
```html
<canvas id="canvas" width="800" height="600"></canvas>
<div id="toolbar">
    <!-- Add component buttons here -->
</div>
<div id="status">Ready</div>
```

2. Include the JavaScript file:
```html
<script src="main.js"></script>
```

3. Initialize the simulator:
```javascript
const simulator = new LogicSimulator();
```

## License

[Add your chosen license here] 