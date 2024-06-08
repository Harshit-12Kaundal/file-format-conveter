import sys
from pdf2docx import Converter

def convert_pdf_to_docx(input_file, output_file):
    cv = Converter(input_file)
    cv.convert(output_file)
    cv.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert.py <input_pdf> <output_docx>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    convert_pdf_to_docx(input_file, output_file)
    print("Conversion completed.")
