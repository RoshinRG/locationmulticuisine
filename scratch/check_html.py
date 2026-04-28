import sys
import re

def check_html(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for unescaped ampersands (not followed by # or a-z)
    amp_matches = re.finditer(r'&(?!(?:[a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+);)', content)
    errors = []
    for m in amp_matches:
        line = content.count('\n', 0, m.start()) + 1
        errors.append(f"Unescaped ampersand at line {line}")
    
    # Check for unclosed tags (naive check)
    stack = []
    # Simplified regex for tags
    tags = re.finditer(r'<(/?)([a-z1-6]+)([^>]*)>', content, re.IGNORECASE)
    self_closing = {'meta', 'link', 'br', 'hr', 'img', 'input', 'source', 'area', 'base', 'col', 'embed', 'keygen', 'param', 'track', 'wbr'}
    
    for t in tags:
        is_closing = t.group(1) == '/'
        tag_name = t.group(2).lower()
        if tag_name in self_closing:
            if is_closing:
                errors.append(f"Closing tag for self-closing element <{tag_name}> at line {content.count('\n', 0, t.start()) + 1}")
            continue
        
        if is_closing:
            if not stack:
                errors.append(f"Unexpected closing tag </{tag_name}> at line {content.count('\n', 0, t.start()) + 1}")
            else:
                last = stack.pop()
                if last != tag_name:
                    errors.append(f"Mismatched tag: expected </{last}>, found </{tag_name}> at line {content.count('\n', 0, t.start()) + 1}")
        else:
            stack.append(tag_name)
    
    for left in stack:
        errors.append(f"Unclosed tag: <{left}>")
        
    return errors

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_html.py <filename>")
    else:
        errs = check_html(sys.argv[1])
        if not errs:
            print("No structural errors found.")
        for e in errs:
            print(e)
