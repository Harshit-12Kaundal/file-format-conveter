import os
import pickle
import pdfplumber
import faiss
import numpy as np
import torch
import sys

from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from sentence_transformers import SentenceTransformer


# -----------------------------
# PATHS
# -----------------------------

VECTOR_FOLDER = "vector_store"
os.makedirs(VECTOR_FOLDER, exist_ok=True)


# -----------------------------
# LOAD EMBEDDING MODEL
# -----------------------------

device = "cuda" if torch.cuda.is_available() else "cpu"

embed_model = SentenceTransformer(
    "all-MiniLM-L6-v2",
    device=device
)

# -----------------------------
# LOAD LLM
# -----------------------------

model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)


# -----------------------------
# READ PDF
# -----------------------------

def read_pdf(path):

    text = ""

    with pdfplumber.open(path) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    return text


# -----------------------------
# SPLIT TEXT
# -----------------------------

def split_text(text, chunk_size=500, overlap=100):

    chunks = []
    start = 0

    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    return chunks
    # return [c.strip() for c in chunks if len(c.strip()) > 50]


# -----------------------------
# VECTOR PATHS
# -----------------------------

def get_paths(pdf_path):

    file_name = os.path.basename(pdf_path)

    index_path = os.path.join(VECTOR_FOLDER, file_name + ".index")
    meta_path = os.path.join(VECTOR_FOLDER, file_name + ".pkl")

    return index_path, meta_path


# -----------------------------
# BUILD VECTOR DB
# -----------------------------

def build_vector_db(pdf_path):

    print("Creating vector database...")

    text = read_pdf(pdf_path)

    chunks = split_text(text)

    metadata = []

    for chunk in chunks:

        metadata.append({
            "document": pdf_path,
            "text": chunk
        })

    embeddings = embed_model.encode(chunks, convert_to_numpy=True)

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings.astype("float32"))

    index_path, meta_path = get_paths(pdf_path)

    faiss.write_index(index, index_path)

    with open(meta_path, "wb") as f:
        pickle.dump(metadata, f)

    print("Vector DB created successfully")


# -----------------------------
# LOAD VECTOR DB
# -----------------------------

def load_vector_db(pdf_path):

    index_path, meta_path = get_paths(pdf_path)

    index = faiss.read_index(index_path)

    with open(meta_path, "rb") as f:
        metadata = pickle.load(f)

    return index, metadata


# -----------------------------
# ANSWER QUESTION
# -----------------------------

def answer_question(pdf_path, question):

    index, metadata = load_vector_db(pdf_path)

    q_embedding = embed_model.encode([question], convert_to_numpy=True)

    distances, indices = index.search(q_embedding.astype("float32"), k=2)

    context = ""

    for i in indices[0]:

        chunk = metadata[i]["text"][:800]

        context += chunk + "\n"

        prompt = f"""
        <|system|>
        You are a document question answering assistant.

        Instructions:
        - Answer ONLY using the provided context.
        - Extract the exact answer from the text when possible.
        - If the answer is not found, respond: "Not found in the document".
        - Keep the answer short and factual.

        <|user|>
        Context:
        {context}

        Question:
        {question}

        Answer:
"""

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=2048
    ).to(model.device)

    output = model.generate(
        **inputs,
        max_new_tokens=300,
        temperature=0.1,
        do_sample=True
    )

    answer = tokenizer.decode(
        output[0][inputs["input_ids"].shape[-1]:],
        skip_special_tokens=True
    )
    answer = answer.split("Question:")[0]
    answer = answer.split("<|user|>")[0]

    return answer.strip()


# -----------------------------
# MAIN
# -----------------------------

mode = sys.argv[1]

if mode == "upload":

    pdf_path = sys.argv[2]

    build_vector_db(pdf_path)

elif mode == "ask":

    pdf_path = sys.argv[2]
    question = sys.argv[3]

    answer = answer_question(pdf_path, question)

    print(answer)