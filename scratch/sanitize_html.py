
import os
import re

def fix_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Escape ampersands in text (between > and <)
    def escape_amp(match):
        text = match.group(0)
        # Skip if it's a script or style block (though our regex shouldn't hit those)
        return text.replace(' & ', ' &amp; ')

    # Replace " & " in text nodes
    # We look for " & " that is not inside a tag
    content = re.sub(r'>([^<]* & [^<]*)<', lambda m: m.group(0).replace(' & ', ' &amp; '), content)
    
    # 2. Escape ampersands in attributes (specifically src, href)
    # This is trickier, but let's target common ones like Google Maps
    content = content.replace('pb=!1m18&', 'pb=!1m18&amp;') # Common in gmaps

    # 3. Percent-encode SVG favicons if found
    content = content.replace('<link rel="icon" href="data:image/svg+xml,<svg', '<link rel="icon" href="data:image/svg+xml,%3Csvg')
    content = content.replace('</svg>">', '%3C/svg%3E">')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

frontend_dir = 'frontend'
for filename in os.listdir(frontend_dir):
    if filename.endswith('.html'):
        fix_html_file(os.path.join(frontend_dir, filename))

# Also check admin dir
admin_dir = 'frontend/admin'
if os.path.exists(admin_dir):
    for filename in os.listdir(admin_dir):
        if filename.endswith('.html'):
            fix_html_file(os.path.join(admin_dir, filename))

print("Fixed ampersands and SVG encoding in all HTML files.")
