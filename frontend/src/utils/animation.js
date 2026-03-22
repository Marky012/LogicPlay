export const sketch = (p) => {
    let wires     = [];
    let canvasRect = null;
    let pan = { x: 0, y: 0 };
    let scale = 1;

    p.setup = () => {
        p.createCanvas(1, 1)
         .style('position', 'absolute')
         .style('top', '0')
         .style('left', '0')
         .style('pointer-events', 'none');
        p.frameRate(30);
    };

    p.draw = () => {
        p.clear();
        if (!canvasRect) return;

        p.push();
        p.translate(pan.x, pan.y);
        p.scale(scale);

        wires.forEach(wire => {
            if (wire.value === null || wire.value === undefined) return;

            const isHigh = wire.value === 1;

            /* Neon green for HIGH, dim slate-blue for LOW */
            const signalColor = isHigh
                ? p.color(57, 255, 20)        // neon green
                : p.color(51, 78, 170);       // dim blue

            /* Glow: draw a blurred thick line behind, then a crisp thin one */
            const dashOffset  = (p.frameCount * (isHigh ? 3 : 1.5)) % 24;

            /* ── Glow pass (thick, transparent) ── */
            p.drawingContext.save();
            p.drawingContext.shadowBlur  = isHigh ? 14 : 4;
            p.drawingContext.shadowColor = isHigh ? 'rgba(57,255,20,0.8)' : 'rgba(51,78,170,0.3)';

            p.strokeWeight(isHigh ? 4 : 2);
            p.stroke(signalColor);
            p.drawingContext.setLineDash([12, 8]);
            p.drawingContext.lineDashOffset = -dashOffset;

            p.noFill();
            p.bezier(
                wire.x1, wire.y1,
                wire.x1 + 50, wire.y1,
                wire.x2 - 50, wire.y2,
                wire.x2, wire.y2
            );

            p.drawingContext.restore();
        });

        p.drawingContext.setLineDash([]); // reset
        p.pop();
    };

    p.updateData = (newData) => {
        wires      = newData.wires;
        canvasRect = newData.rect;
        if (newData.pan) pan = newData.pan;
        if (newData.scale !== undefined) scale = newData.scale;
        
        if (canvasRect) {
            p.resizeCanvas(canvasRect.width, canvasRect.height);
        }
    };
};
