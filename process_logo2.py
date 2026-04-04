from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # Let's find the bounding box of the blue rectangle
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            # detect blueish pixels
            if b > r + 30 and b > g + 30 and b > 90:
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                
    print(f"Blue rectangle bounds: X:({min_x}, {max_x}) Y:({min_y}, {max_y})")
    
    for y in range(height):
        for x in range(width):
            r, g, b, _ = pixels[x, y]
            
            # Margin ensures we don't accidentally erase the edges of the blue rect
            margin = 3
            if (min_x - margin <= x <= max_x + margin) and (min_y - margin <= y <= max_y + margin):
                # Leave blue rectangle entirely untouched
                continue
                
            L = (r + g + b) / 3.0
            
            # Background is around L=248, dark text is around L=80
            # We want alpha=0 at L>=240, and alpha=255 at L<=150
            if L >= 240:
                alpha = 0
            elif L <= 150:
                alpha = 255
            else:
                alpha = int(255 * (240 - L) / (240 - 150))
                
            pixels[x, y] = (255, 255, 255, alpha)

    img.save(output_path)
    print(f"Saved processed logo to {output_path}")

process_logo(r'd:\LogicPlay\frontend\src\assets\L0g1cPLAY.png', r'd:\LogicPlay\frontend\src\assets\L0g1cPLAY_transparent.png')
