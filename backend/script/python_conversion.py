import sys
import os
from docx2pdf import convert

def docx_to_pdf(input_path, output_path=None):
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input file '{input_path}' does not exist.")
    if not input_path.lower().endswith('.docx'):
        raise ValueError("Input file must be a .docx file.")
    convert(input_path, output_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python python_conversion.py <input.docx> [output.pdf]")
        sys.exit(1)
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    try:
        docx_to_pdf(input_file, output_file)
        print("Conversion successful.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)