import sys
import fitz  # PyMuPDF
import os

def compress_pdf(input_pdf_path, output_pdf_path):
    try:
        # Open the input PDF
        with fitz.open(input_pdf_path) as doc:
            # Save the compressed PDF
            doc.save(output_pdf_path, garbage=4, deflate=True)
            print(f"Compression successful! Saved to {output_pdf_path}")
        
        # Check file sizes for reference
        original_size = os.path.getsize(input_pdf_path)
        compressed_size = os.path.getsize(output_pdf_path)
        print(f"Original Size: {original_size / 1024:.2f} KB")
        print(f"Compressed Size: {compressed_size / 1024:.2f} KB")

    except Exception as e:
        print(f"Error compressing the PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input_pdf_path> <output_pdf_path>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    compress_pdf(input_path, output_path)
