class Component {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 60;
        this.height = 40;
        this.inputs = [];
        this.outputs = [];
        this.state = false;
        this.selected = false;
        
        // Initialize input slots based on gate type
        if (type !== 'input' && type !== 'output') {
            this.inputSlots = type === 'not' ? 1 : 2;
            this.outputSlots = 1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw component body
        ctx.fillStyle = this.selected ? '#e0e0ff' : '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;

        if (this.type === 'input' || this.type === 'output') {
            // Draw circle for input/output
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw state indicator for input/output
            ctx.fillStyle = this.state ? '#00ff00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw rectangle for gates
            ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
            ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        }

        // Draw text
        ctx.fillStyle = '#000000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type.toUpperCase(), 0, 0);

        // Draw connection points
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        // Draw input connection points
        if (this.type === 'input' || this.type === 'output') {
            ctx.beginPath();
            ctx.arc(0, this.type === 'input' ? 20 : -20, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            // Draw input connection points for gates
            for (let i = 0; i < this.inputSlots; i++) {
                const y = -this.height/2 + (this.height * (i + 1))/(this.inputSlots + 1);
                
                // Draw connection point circle
                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#000000';
                ctx.beginPath();
                ctx.arc(-this.width/2, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Draw state indicator
                const inputState = this.inputs[i] ? this.inputs[i].evaluate() : false;
                ctx.fillStyle = inputState ? '#00ff00' : '#ff0000';
                ctx.beginPath();
                ctx.arc(-this.width/2, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw output connection points for gates
            this.outputs.forEach((_, index) => {
                const y = -this.height/2 + (this.height * (index + 1))/(this.outputs.length + 1);
                ctx.beginPath();
                ctx.arc(this.width/2, y, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        }

        // Draw connections with state colors
        ctx.lineWidth = 2;
        
        // Draw input connections
        this.inputs.forEach((input, index) => {
            if (input) {
                let startX = input.x;
                let startY = input.y;
                let endX = this.x;
                let endY = this.y;

                // Calculate start point (output of source component)
                if (input.type === 'input' || input.type === 'output') {
                    startY += (input.type === 'input' ? 20 : -20);
                } else {
                    startX += input.width/2;
                }

                // Calculate end point (input of this component)
                if (this.type === 'input' || this.type === 'output') {
                    endY += (this.type === 'input' ? 20 : -20);
                } else {
                    endX -= this.width/2;
                    endY += -this.height/2 + (this.height * (index + 1))/(this.inputSlots + 1);
                }

                // Draw the connection in absolute coordinates
                ctx.restore(); // Restore to remove translation
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = input.evaluate() ? '#00ff00' : '#ff0000';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.save(); // Save again
                ctx.translate(this.x, this.y); // Translate back
            }
        });

        // Draw connection points for gates with state indicators
        if (this.type !== 'input' && this.type !== 'output') {
            // Draw output connection point with state
            const outputY = 0; // Center output
            
            // Draw connection point circle
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.width/2, outputY, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw state indicator
            ctx.fillStyle = this.evaluate() ? '#00ff00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(this.width/2, outputY, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawOrthogonalConnection(ctx, start, end, state) {
        // Draw direct line connection
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y); // Direct line instead of orthogonal
        
        ctx.strokeStyle = state ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add connection points
        ctx.fillStyle = state ? '#00ff00' : '#ff0000';
        [start, end].forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    calculateOrthogonalPath(start, end) {
        // Simply return start and end points for direct connection
        return [start, end];
    }
    getConnectionPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const DETECTION_RADIUS = 10; // Increased from 5 to 10
        
        if (this.type === 'input' || this.type === 'output') {
            // Check if click is near the connection point
            const connectionY = this.type === 'input' ? 20 : -20;
            const distance = Math.sqrt(dx*dx + (dy - connectionY)*(dy - connectionY));
            if (distance <= DETECTION_RADIUS) {
                return this.type === 'input' ? 'output' : 'input';
            }
        } else {
            // For gates, check input and output connection points
            const halfWidth = this.width/2;
            
            // Check input connection points
            for (let i = 0; i < this.inputSlots; i++) {
                const connectionY = -this.height/2 + (this.height * (i + 1))/(this.inputSlots + 1);
                const distance = Math.sqrt((dx + halfWidth)*(dx + halfWidth) + (dy - connectionY)*(dy - connectionY));
                if (distance <= DETECTION_RADIUS) {
                    return 'input';
                }
            }
            
            // Check output connection point
            const outputY = 0; // Center output
            const distance = Math.sqrt((dx - halfWidth)*(dx - halfWidth) + dy*dy);
            if (distance <= DETECTION_RADIUS) {
                return 'output';
            }
        }
        
        return null;
    }

    containsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        
        if (this.type === 'input' || this.type === 'output') {
            return Math.sqrt(dx*dx + dy*dy) <= 20;
        }
        
        return Math.abs(dx) <= this.width/2 && Math.abs(dy) <= this.height/2;
    }

    evaluate() {
        switch (this.type) {
            case 'input':
                return this.state;
            case 'output':
                return this.inputs[0] ? this.inputs[0].evaluate() : false;
            case 'and':
                // Check if we have both inputs and both are true
                return this.inputs.length === 2 && this.inputs.every(input => input && input.evaluate());
            case 'or':
                // Check if we have at least one input that's true
                return this.inputs.some(input => input && input.evaluate());
            case 'not':
                return this.inputs[0] ? !this.inputs[0].evaluate() : false;
            case 'nand':
                // Check if we have both inputs
                return !(this.inputs.length === 2 && this.inputs.every(input => input && input.evaluate()));
            case 'nor':
                return !(this.inputs.some(input => input && input.evaluate()));
            case 'xor':
                // Check if we have both inputs
                return this.inputs.length === 2 && 
                       this.inputs.filter(input => input && input.evaluate()).length % 2 === 1;
            default:
                return false;
        }
    }

    // Add this method to the Component class to check if a point is near a connection line
    isPointNearConnection(x, y, startX, startY, endX, endY) {
        const CLICK_DISTANCE = 5;
        
        // Calculate distance from point to line segment
        const A = x - startX;
        const B = y - startY;
        const C = endX - startX;
        const D = endY - startY;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        
        // Find nearest point on line segment
        let param = -1;
        if (len_sq !== 0) param = dot / len_sq;

        let xx, yy;

        if (param < 0) {
            xx = startX;
            yy = startY;
        } else if (param > 1) {
            xx = endX;
            yy = endY;
        } else {
            xx = startX + param * C;
            yy = startY + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= CLICK_DISTANCE;
    }
}

class LogicSimulator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.components = [];
        this.selectedComponent = null;
        this.connecting = false;
        this.connectionStart = null;
        this.connectionStartType = null;
        this.dragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.selectedType = null;
        this.mousePos = { x: 0, y: 0 };

        // Add delete zone properties
        this.deleteZone = {
            x: 0,
            y: this.canvas.height - 60, // 60 pixels from bottom
            width: this.canvas.width,
            height: 60
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Component selection from toolbar
        document.querySelectorAll('.component').forEach(component => {
            component.addEventListener('click', () => {
                this.selectedType = component.dataset.type;
                document.getElementById('status').textContent = `Selected: ${this.selectedType.toUpperCase()}`;
            });
        });

        // Canvas interactions
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));

        // Add keyboard event listener for ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.connecting) {
                this.connecting = false;
                this.connectionStart = null;
                this.connectionStartType = null;
                document.getElementById('status').textContent = 'Connection cancelled';
                this.update();
            }
        });
    }

    addComponent(x, y, type) {
        const component = new Component(x, y, type);
        this.components.push(component);
        this.update();
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // If we have a selected type, add the component at click position
        if (this.selectedType) {
            this.addComponent(x, y, this.selectedType);
            this.selectedType = null;
            document.getElementById('status').textContent = 'Ready';
            return;
        }

        const clickedComponent = this.components.find(c => c.containsPoint(x, y));
        
        if (clickedComponent) {
            // Remove the input toggle from here
            this.dragging = true;
            this.selectedComponent = clickedComponent;
            this.dragOffset = {
                x: x - clickedComponent.x,
                y: y - clickedComponent.y
            };
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.mousePos = { x, y }; // Update mouse position

        if (this.dragging && this.selectedComponent) {
            this.selectedComponent.x = x - this.dragOffset.x;
            this.selectedComponent.y = y - this.dragOffset.y;
        }
        
        this.update(); // Update on every mouse move to show preview line
    }

    handleMouseUp(e) {
        if (this.dragging && this.selectedComponent) {
            const rect = this.canvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            
            // Check if component is in delete zone
            if (y >= this.deleteZone.y) {
                // Remove all connections to/from this component
                this.deleteComponent(this.selectedComponent);
                document.getElementById('status').textContent = 'Component deleted';
            }
        }
        
        this.dragging = false;
        this.selectedComponent = null;
    }
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        const clickedComponent = this.components.find(c => c.containsPoint(x, y));
        
        if (clickedComponent) {
            const connectionPoint = clickedComponent.getConnectionPoint(x, y);
            
            if (connectionPoint) {
                if (!this.connecting) {
                    // Start connection
                    this.connecting = true;
                    this.connectionStart = clickedComponent;
                    this.connectionStartType = connectionPoint;
                    document.getElementById('status').textContent = 'Connecting...';
                } else {
                    // Try to complete connection
                    if (this.connectionStart !== clickedComponent) {
                        if (this.connectionStartType === 'output' && connectionPoint === 'input') {
                            // First click was output, second was input
                            this.connectComponents(this.connectionStart, clickedComponent);
                            document.getElementById('status').textContent = 'Connected!';
                        } else if (this.connectionStartType === 'input' && connectionPoint === 'output') {
                            // First click was input, second was output
                            this.connectComponents(clickedComponent, this.connectionStart);
                            document.getElementById('status').textContent = 'Connected!';
                        } else {
                            document.getElementById('status').textContent = 'Invalid connection: inputs must connect to outputs';
                        }
                    }
                    // Reset connection state
                    this.connecting = false;
                    this.connectionStart = null;
                    this.connectionStartType = null;
                }
            } else if (clickedComponent.type === 'input' && !this.dragging) {
                // Only toggle if it's an input and we weren't dragging
                clickedComponent.state = !clickedComponent.state;
                this.update();
            }
        } else {
            // Check if we clicked on a connection
            const connection = this.findConnectionAtPoint(x, y);
            if (connection) {
                // Remove the connection
                const { component, inputIndex } = connection;
                const output = component.inputs[inputIndex];
                
                // Remove connection from output's outputs array
                output.outputs = output.outputs.filter(out => out !== component);
                
                // Remove connection from input's inputs array
                component.inputs[inputIndex] = null;
                
                document.getElementById('status').textContent = 'Connection deleted';
                this.update();
            }
        }
    }
    connectComponents(fromOutput, toInput) {
        // Get the input index for the target component
        let inputIndex = 0;
        if (toInput.type !== 'input' && toInput.type !== 'output') {
            // For logic gates, find the first empty input slot
            inputIndex = toInput.inputs.findIndex(input => !input);
            if (inputIndex === -1) {
                inputIndex = toInput.inputs.length;
            }
            if (inputIndex >= toInput.inputSlots) {
                // All inputs are full
                return;
            }
        }

        // Remove any existing connections at this input index
        if (toInput.inputs[inputIndex]) {
            const oldOutput = toInput.inputs[inputIndex];
            oldOutput.outputs = oldOutput.outputs.filter(out => out !== toInput);
        }

        // Set new connections
        toInput.inputs[inputIndex] = fromOutput;
        if (!fromOutput.outputs.includes(toInput)) {
            fromOutput.outputs.push(toInput);
        }

        this.update();
    }
    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the delete zone first (so it appears behind components)
        this.drawDeleteZone();
        
        // Draw all components
        this.components.forEach(component => {
            component.draw(this.ctx);
        });
    
        // Draw preview line while connecting
        if (this.connecting && this.connectionStart) {
            const startPoint = this.getConnectionCoordinates(this.connectionStart, this.connectionStartType);
            
            // Find if mouse is over a potential connection point
            const hoverComponent = this.components.find(c => c.containsPoint(this.mousePos.x, this.mousePos.y));
            let endPoint = this.mousePos;
            
            if (hoverComponent) {
                const connectionPoint = hoverComponent.getConnectionPoint(this.mousePos.x, this.mousePos.y);
                if (connectionPoint) {
                    // If hovering over a valid connection point, snap to it
                    endPoint = this.getConnectionCoordinates(hoverComponent, connectionPoint);
                }
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(startPoint.x, startPoint.y);
            this.ctx.lineTo(endPoint.x, endPoint.y);
            this.ctx.strokeStyle = '#666666';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 3]); // Make line dashed
            this.ctx.stroke();
            this.ctx.setLineDash([]); // Reset line style
        }
    
        // Update output states
        this.components.forEach(component => {
            if (component.type === 'output') {
                component.state = component.evaluate();
            }
        });
    }
    getConnectionCoordinates(component, connectionType) {
        let x = component.x;
        let y = component.y;

        if (component.type === 'input' || component.type === 'output') {
            y += component.type === 'input' ? 20 : -20;
        } else {
            if (connectionType === 'output') {
                x += component.width/2;
            } else {
                x -= component.width/2;
                const inputIndex = component.inputs.length;
                y += -component.height/2 + (component.height * (inputIndex + 1))/(component.inputSlots + 1);
            }
        }
        
        return { x, y };
    }

    // Add this method to the LogicSimulator class to find a connection at a point
    findConnectionAtPoint(x, y) {
        for (const component of this.components) {
            for (let i = 0; i < component.inputs.length; i++) {
                const input = component.inputs[i];
                if (!input) continue;

                // Calculate connection coordinates
                let startX = input.x;
                let startY = input.y;
                let endX = component.x;
                let endY = component.y;

                // Calculate start point (output of source component)
                if (input.type === 'input' || input.type === 'output') {
                    startY += (input.type === 'input' ? 20 : -20);
                } else {
                    startX += input.width/2;
                }

                // Calculate end point (input of this component)
                if (component.type === 'input' || component.type === 'output') {
                    endY += (component.type === 'input' ? 20 : -20);
                } else {
                    endX -= component.width/2;
                    endY += -component.height/2 + (component.height * (i + 1))/(component.inputSlots + 1);
                }

                if (component.isPointNearConnection(x, y, startX, startY, endX, endY)) {
                    return { component, inputIndex: i };
                }
            }
        }
        return null;
    }

    // Add this method to draw the delete zone
    drawDeleteZone() {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Semi-transparent red
        this.ctx.fillRect(this.deleteZone.x, this.deleteZone.y, this.deleteZone.width, this.deleteZone.height);
        
        // Add text
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Drop here to delete', this.canvas.width / 2, this.deleteZone.y + this.deleteZone.height / 2);
    }

    // Add this method to handle component deletion:
    deleteComponent(component) {
        // Remove connections where this component is the input
        this.components.forEach(c => {
            c.inputs = c.inputs.filter(input => input !== component);
        });
        
        // Remove connections where this component is the output
        component.outputs.forEach(output => {
            output.inputs = output.inputs.filter(input => input !== component);
        });
        
        // Remove the component from the components array
        this.components = this.components.filter(c => c !== component);
        
        this.update();
    }
}

// Initialize the simulator
const simulator = new LogicSimulator(); 