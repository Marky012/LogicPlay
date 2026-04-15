export const sketch = (p) => {
    let wires     = [];
    let canvasRect = null;
    let pan = { x: 0, y: 0 };
    let scale = 1;
    let theme = 'dark';

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
            const isLight = theme === 'light';

            /* Neon green for HIGH, dim/theme-aware color for LOW */
            const signalColor = isHigh
                ? p.color(57, 255, 20) // neon green
                : isLight 
                    ? p.color(70, 80, 110, 160) // darker blue-gray for light
                    : p.color(51, 78, 170);       // dim blue for dark

            const dashOffset = (p.frameCount * (isHigh ? 3 : 1.5)) % 24;

            /* ── Pass 1: Glow / Shadow Layer ── */
            p.drawingContext.save();
            p.drawingContext.shadowBlur  = isHigh ? 14 : 4;
            p.drawingContext.shadowColor = isHigh 
                ? 'rgba(57,255,20,0.6)' 
                : isLight ? 'rgba(0,0,0,0.05)' : 'rgba(51,78,170,0.2)';

            p.noFill();
            p.strokeWeight(isHigh ? 3.5 : 2);
            p.stroke(signalColor);
            
            // Dashing logic: only for active (high) signals or subtle for dark mode
            if (isHigh || !isLight) {
                p.drawingContext.setLineDash([12, 8]);
                p.drawingContext.lineDashOffset = -dashOffset;
            } else {
                p.drawingContext.setLineDash([]);
            }

            p.bezier(
                wire.x1, wire.y1,
                wire.x1 + 50, wire.y1,
                wire.x2 - 50, wire.y2,
                wire.x2, wire.y2
            );
            p.drawingContext.restore();

            /* ── Pass 2: Sharp Inner Core (prevent "broken" look) ── */
            p.push();
            p.noFill();
            p.strokeWeight(isHigh ? 1.5 : 1);
            p.stroke(isHigh ? (isLight ? p.color(200, 255, 180, 200) : p.color(255, 255, 255, 180)) : signalColor);
            p.drawingContext.setLineDash([]); // Core is solid
            p.bezier(
                wire.x1, wire.y1,
                wire.x1 + 50, wire.y1,
                wire.x2 - 50, wire.y2,
                wire.x2, wire.y2
            );
            p.pop();
        });

        p.drawingContext.setLineDash([]); // reset global state
        p.pop();
    };

    p.updateData = (newData) => {
        wires      = newData.wires;
        canvasRect = newData.rect;
        if (newData.pan) pan = newData.pan;
        if (newData.scale !== undefined) scale = newData.scale;
        if (newData.theme) theme = newData.theme;
        
        if (canvasRect) {
            p.resizeCanvas(canvasRect.width, canvasRect.height);
        }
    };
};
