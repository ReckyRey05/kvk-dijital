from PIL import Image
import sys
import os

img_path = sys.argv[1]
img = Image.open(img_path)
width, height = img.size

w2 = width // 2
h2 = height // 2

# 1. Icon Only (Top Left)
# Crop tighter to avoid the label "Icon Only" at the top
icon_only = img.crop((0, int(h2*0.2), w2, h2))
icon_only.save("public/logo-icon.jpg")

# 2. Logo Horizontal (Top Right)
logo_horizontal = img.crop((w2, int(h2*0.2), width, h2))
logo_horizontal.save("public/logo-horizontal.jpg")

# 3. Dark Luxury (Bottom Left)
dark_luxury = img.crop((0, h2 + int(h2*0.2), w2, height))
dark_luxury.save("public/logo-dark-luxury.jpg")

# 4. Monochrome (Bottom Right)
monochrome = img.crop((w2, h2 + int(h2*0.2), width, height))
monochrome.save("public/logo-monochrome.jpg")

print(f"Image {width}x{height} cropped successfully into 4 parts.")
