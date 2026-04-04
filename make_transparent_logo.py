from PIL import Image

def fix_logo():
    input_path = r'd:\LogicPlay\frontend\src\assets\L0g1cPLAY.png'
    output_path = r'd:\LogicPlay\frontend\src\assets\L0g1cPLAYicon.png'
    
    img = Image.open(input_path).convert("RGBA")
    pixels = img.load()
    width, height = img.size
    
    # Find bounding box of the blue rectangle to protect it
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if b > r + 30 and b > g + 30 and b > 90:
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                
    margin = 5
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Protect the blue rectangle
            if (min_x - margin <= x <= max_x + margin) and (min_y - margin <= y <= max_y + margin):
                continue
            
            # Smoothly remove white background
            if r > 240 and g > 240 and b > 240:
                pixels[x, y] = (r, g, b, 0)
            elif r > 180 and g > 180 and b > 180 and abs(r-g)<20 and abs(g-b)<20:
                bright = max(r,g,b)
                if bright > 240: bright = 240
                if bright < 180: bright = 180
                alpha = int(255 * (240 - bright) / 60)
                pixels[x, y] = (r, g, b, alpha)
                
    img.save(output_path)
    print("Fixed logo saved successfully!")

if __name__ == '__main__':
    fix_logo()
