import sys
from pdf2docx import Converter
import os
import traceback

def convert_pdf_to_docx(input_file, output_file):
    try:
        # Log file paths
        print(f"Input file: {input_file}")
        print(f"Output file: {output_file}")

        # Convert paths to absolute paths
        input_file = os.path.abspath(input_file)
        output_file = os.path.abspath(output_file)

        print(f"Absolute input file: '{input_file}'")
        print(f"Absolute output file: '{output_file}'")

        # Check if input file exists
        if not os.path.exists(input_file):
            raise FileNotFoundError(f"Input file does not exist: {input_file}")

        # Create a PDF to DOCX converter object
        cv = Converter(input_file)
        
        # Perform the conversion
        cv.convert(output_file, start=0, end=None)
        
        # Close the converter object
        cv.close()

        print("Conversion completed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert.py <input_pdf> <output_docx>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    convert_pdf_to_docx(input_file, output_file)
