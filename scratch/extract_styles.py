import re
import os

def extract_styles(filepath, css_filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    style_pattern = re.compile(r'style="([^"]+)"')
    styles = []
    
    def replacer(match):
        style_content = match.group(1)
        class_name = f'extracted-{os.path.basename(filepath).split(".")[0]}-{len(styles)}'
        styles.append((class_name, style_content))
        return f'data-extracted-style="{class_name}"'

    modified_content = style_pattern.sub(replacer, content)
    
    def merge_classes(match):
        full_tag = match.group(0)
        class_match = re.search(r'class="([^"]+)"', full_tag)
        extracted_match = re.search(r'data-extracted-style="([^"]+)"', full_tag)
        
        if extracted_match:
            new_class = extracted_match.group(1)
            full_tag = re.sub(r'\s*data-extracted-style="[^"]+"', '', full_tag)
            
            if class_match:
                old_class = class_match.group(1)
                full_tag = full_tag.replace(f'class="{old_class}"', f'class="{old_class} {new_class}"')
            else:
                full_tag = re.sub(r'(/?>)$', rf' class="{new_class}"\1', full_tag)
                
        return full_tag

    modified_content = re.sub(r'<[a-zA-Z0-9\-]+[^>]*>', merge_classes, modified_content)
    
    if styles:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(modified_content)
            
        css_additions = '\n\n/* Extracted inline styles from ' + os.path.basename(filepath) + ' */\n'
        for class_name, style_content in styles:
            css_additions += f'.{class_name} {{ {style_content} }}\n'
            
        with open(css_filepath, 'a', encoding='utf-8') as f:
            f.write(css_additions)
            
        print(f'Extracted {len(styles)} styles from {os.path.basename(filepath)}')

extract_styles(r'd:\loca\frontend\index.html', r'd:\loca\frontend\css\style.css')
extract_styles(r'd:\loca\frontend\login.html', r'd:\loca\frontend\css\auth.css')
extract_styles(r'd:\loca\frontend\order.html', r'd:\loca\frontend\css\style.css')
extract_styles(r'd:\loca\frontend\admin\admin-billing.html', r'd:\loca\frontend\css\admin.css')
