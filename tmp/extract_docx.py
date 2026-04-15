import zipfile
import xml.etree.ElementTree as ET
import os

def get_docx_text(path):
    if not os.path.exists(path):
        return f"File {path} not found"
    
    try:
        with zipfile.ZipFile(path) as zip_ref:
            xml_content = zip_ref.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for paragraph in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = [node.text for node in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
                if texts:
                    paragraphs.append(''.join(texts))
            return '\n'.join(paragraphs)
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

# Process files
print("CONTENT_START_DOC")
print(get_docx_text('CS3A-CABERO_JOHN_MARK_Part_III.docx'))
print("CONTENT_END_DOC")

print("CONTENT_START_TEMPLATE")
print(get_docx_text('sample-template-1.docx'))
print("CONTENT_END_TEMPLATE")
