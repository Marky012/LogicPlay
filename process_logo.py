from PIL import Image
import sys

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # 1. Find bounding box of the blue rectangle
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Detect blueish pixels
            if b > r + 30 and b > g + 30 and b > 100:
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                
    print(f"Blue rectangle bounding box: ({min_x}, {min_y}) to ({max_x}, {max_y})")
    
    # 2. Process image
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Check if inside blue rect (with a tiny margin)
            in_blue_rect = (min_x - 5 <= x <= max_x + 5) and (min_y - 5 <= y <= max_y + 5)
            
            if in_blue_rect:
                # Keep everything inside the blue rectangle exactly as it is!
                continue
                
            # Outside blue rectangle:
            # We want to remove the white/light-grey background.
            # Let's say anything with high brightness and low saturation is background.
            brightness = (r + g + b) / 3
            if brightness > 150:
                # white/grey background -> transparent
                pixels[x, y] = (r, g, b, 0)
            else:
                # dark text "L0g1c" -> make it white, so it contrasts on dark app background
                # Actually, maybe we shouldn't make it pure white if it has anti-aliasing.
                # Let's map it: the darker it is, the more opaque white it becomes.
                # If brightness is 0 -> alpha 255 (white). If brightness is 150 -> alpha 0.
                alpha = int(255 * (1 - brightness / 150))
                pixels[x, y] = (255, 255, 255, alpha)

    img.save(output_path)
    print("Process complete!")

process_logo(r'd:\LogicPlay\frontend\src\assets\L0g1cPLAY.png', r'd:\LogicPlay\frontend\src\assets\L0g1cPLAY.png')
