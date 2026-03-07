export const sketch = (p) => {
    let wires = [];
    let canvasRect = null;
  
    p.setup = () => {
        // Create an empty canvas to act as the overlay
        p.createCanvas(1, 1).style('position', 'absolute').style('top', '0').style('left', '0').style('pointer-events', 'none');
        p.frameRate(30);
    };
  
    p.draw = () => {
        p.clear();
        
        if (!canvasRect) return;

        p.strokeWeight(4);

        // Draw active signals traveling along wires
        wires.forEach(wire => {
            if (wire.value !== null && wire.value !== undefined) {
               // Calculate color based on value (1 = red, 0 = blue)
               const signalColor = wire.value === 1 ? p.color(255, 50, 50) : p.color(50, 100, 255);
               
               // Animate dashes along the wire for "flow"
               const dashOffset = (p.frameCount * 2) % 20;

               p.stroke(signalColor);
               p.drawingContext.setLineDash([10, 10]);
               p.drawingContext.lineDashOffset = -dashOffset;

               // Use rough bezier approximation (matches Canvas.js SVG paths)
               p.noFill();
               p.bezier(
                   wire.x1, wire.y1,
                   wire.x1 + 40, wire.y1,
                   wire.x2 - 40, wire.y2,
                   wire.x2, wire.y2
               );
            }
        });

        p.drawingContext.setLineDash([]); // Reset dash
    };
  
    // Function exposed to React to update data
    p.updateData = (newData) => {
        wires = newData.wires;
        canvasRect = newData.rect;

        // Resize canvas if needed
        if (canvasRect) {
            p.resizeCanvas(canvasRect.width, canvasRect.height);
        }
    };
};
