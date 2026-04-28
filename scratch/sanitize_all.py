import os
import re
import sys

def sanitize_file(filepath):
    print(f"Sanitizing {filepath}...")
    with open(filepath, 'rb') as f:
        raw = f.read()
    
    # Remove BOM if present
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    
    try:
        content = raw.decode('utf-8')
    except UnicodeDecodeError:
        content = raw.decode('latin-1')

    # 1. Normalize line endings to CRLF
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    content = content.replace('\n', '\r\n')
    
    # 2. Remove trailing whitespace
    content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
    
    # 3. Fix unescaped ampersands in text nodes (naive)
    # Don't touch scripts or styles
    parts = re.split(r'(<(?:script|style).*?>.*?</(?:script|style)>)', content, flags=re.DOTALL | re.IGNORECASE)
    for i in range(len(parts)):
        if not parts[i].lower().startswith('<script') and not parts[i].lower().startswith('<style'):
            # Only replace & if NOT part of an entity
            parts[i] = re.sub(r'&(?!(?:[a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+);)', '&amp;', parts[i])
    content = "".join(parts)
    
    # 4. Standardize decimals in style attributes (e.g. .5rem -> 0.5rem)
    content = re.sub(r'style="([^"]*?)(?<!\d)\.(\d+)', r'style="\1 0.\2', content)
    # Wait, the above regex is complex. Let's simplify.
    def fix_decimal(m):
        return m.group(0).replace(':.', ':0.').replace(' .', ' 0.').replace(',.', ',0.')
    
    content = re.sub(r'style="[^"]+"', fix_decimal, content)

    with open(filepath, 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(content)

def main(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith('.html'):
                sanitize_file(os.path.join(root, file))

if __name__ == "__main__":
    main(sys.argv[1])
