import cairosvg
import os

OUTPUT_DIR = "/workspace/public"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# The app icon SVG (navy bg with cream compass pin)
app_icon_svg = '''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
<rect width="200" height="200" rx="44" fill="#1E2A45"/>
<g transform="translate(34,24) scale(0.94)">
    <path d="M 60 6 C 32 6 10 28 10 56 C 10 85 36 108 60 137 C 84 108 110 85 110 56 C 110 28 88 6 60 6 Z"
          fill="none" stroke="#F6EFE2" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="60" cy="58" r="34" fill="none" stroke="#F6EFE2" stroke-width="3.5"/>
    <line x1="60" y1="24" x2="60" y2="15" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="60" y1="92" x2="60" y2="101" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="94" y1="58" x2="103" y2="58" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="26" y1="58" x2="17" y2="58" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="53,58 60,21 67,58" fill="#F6EFE2"/>
    <polygon points="53,58 60,123 67,58" fill="#C1552C"/>
    <circle cx="60" cy="58" r="7" fill="#1E2A45" stroke="#F6EFE2" stroke-width="2.5"/>
  </g>
</svg>'''

# Generate different sizes
sizes = [16, 32, 192, 512]
for size in sizes:
    output_path = os.path.join(OUTPUT_DIR, f"icon-{size}.png")
    cairosvg.svg2png(
        bytestring=app_icon_svg.encode('utf-8'),
        write_to=output_path,
        output_width=size,
        output_height=size,
    )
    print(f"Generated: {output_path} ({size}x{size})")

# Apple touch icon (180x180)
cairosvg.svg2png(
    bytestring=app_icon_svg.encode('utf-8'),
    write_to=os.path.join(OUTPUT_DIR, "apple-touch-icon.png"),
    output_width=180,
    output_height=180,
)
print("Generated: apple-touch-icon.png (180x180)")

# Favicon (32x32 — standard)
cairosvg.svg2png(
    bytestring=app_icon_svg.encode('utf-8'),
    write_to=os.path.join(OUTPUT_DIR, "favicon.png"),
    output_width=32,
    output_height=32,
)
print("Generated: favicon.png (32x32)")

# Also save the SVG itself as favicon
with open(os.path.join(OUTPUT_DIR, "favicon.svg"), "w") as f:
    f.write(app_icon_svg)
print("Generated: favicon.svg")

# Maskable icon (with padding for safe zone)
maskable_svg = '''<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
<rect width="512" height="512" fill="#1E2A45"/>
<g transform="translate(106,86) scale(2.4)">
    <path d="M 60 6 C 32 6 10 28 10 56 C 10 85 36 108 60 137 C 84 108 110 85 110 56 C 110 28 88 6 60 6 Z"
          fill="none" stroke="#F6EFE2" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="60" cy="58" r="34" fill="none" stroke="#F6EFE2" stroke-width="3.5"/>
    <line x1="60" y1="24" x2="60" y2="15" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="60" y1="92" x2="60" y2="101" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="94" y1="58" x2="103" y2="58" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="26" y1="58" x2="17" y2="58" stroke="#F6EFE2" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="53,58 60,21 67,58" fill="#F6EFE2"/>
    <polygon points="53,58 60,123 67,58" fill="#C1552C"/>
    <circle cx="60" cy="58" r="7" fill="#1E2A45" stroke="#F6EFE2" stroke-width="2.5"/>
  </g>
</svg>'''

cairosvg.svg2png(
    bytestring=maskable_svg.encode('utf-8'),
    write_to=os.path.join(OUTPUT_DIR, "icon-512-maskable.png"),
    output_width=512,
    output_height=512,
)
print("Generated: icon-512-maskable.png (512x512)")

print("\nAll icons generated successfully!")
