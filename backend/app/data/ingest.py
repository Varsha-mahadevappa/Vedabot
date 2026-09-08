"""
One-time ingestion script: reads Vedic corpus files, chunks them,
embeds with sentence-transformers, and stores in ChromaDB.
Run once: python -m app.data.ingest
"""

import os
import re
import hashlib
from pathlib import Path
import chromadb
from sentence_transformers import SentenceTransformer

CORPUS_DIR = Path(__file__).parent / "vedic_corpus"
CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")
COLLECTION_NAME = "vedic_knowledge"


def compute_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def parse_corpus_file(filepath: Path) -> list[dict]:
    """Parse structured Vedic text file into chunks with metadata."""
    chunks = []
    content = filepath.read_text(encoding="utf-8")

    # Extract top-level metadata
    source_match = re.search(r"SOURCE:\s*(.+)", content)
    category_match = re.search(r"CATEGORY:\s*(.+)", content)
    desc_match = re.search(r"DESCRIPTION:\s*(.+)", content)

    source = source_match.group(1).strip() if source_match else filepath.stem
    category = category_match.group(1).strip() if category_match else "General"
    description = desc_match.group(1).strip() if desc_match else ""

    # Split into entries by "---" separator
    entries = content.split("---")
    for entry in entries[1:]:  # Skip header block
        entry = entry.strip()
        if not entry:
            continue

        # Extract TEXT or DEFINITION field as primary chunk content
        text_match = re.search(r"(?:TEXT|DEFINITION):\s*(.+?)(?=\nSANSKRIT:|\nTRANSLITERATION:|\nNOTE:|\Z)", entry, re.DOTALL)
        sanskrit_match = re.search(r"SANSKRIT:\s*(.+?)(?=\nTRANSLITERATION:|\nNOTE:|\Z)", entry, re.DOTALL)
        trans_match = re.search(r"TRANSLITERATION:\s*(.+?)(?=\nNOTE:|\Z)", entry, re.DOTALL)
        note_match = re.search(r"NOTE:\s*(.+)", entry)

        if not text_match:
            continue

        text = text_match.group(1).strip()
        sanskrit = sanskrit_match.group(1).strip() if sanskrit_match else ""
        transliteration = trans_match.group(1).strip() if trans_match else ""
        note = note_match.group(1).strip() if note_match else ""

        # Extract chapter/verse/hymn/sutra info
        chapter = ""
        verse = ""
        for label in ["CHAPTER", "MANDALA", "PADA", "UPANISHAD"]:
            m = re.search(rf"{label}:\s*(.+)", entry)
            if m:
                chapter = m.group(1).strip()
                break
        for label in ["VERSE", "HYMN", "SUTRA", "CONCEPT"]:
            m = re.search(rf"{label}:\s*(.+)", entry)
            if m:
                verse = m.group(1).strip()
                break

        # Build rich chunk text for embedding
        chunk_text = f"{text}"
        if note:
            chunk_text += f" {note}"
        if transliteration:
            chunk_text += f" [{transliteration}]"

        chunks.append({
            "text": chunk_text,
            "source": source,
            "category": category,
            "chapter": chapter,
            "verse": verse,
            "sanskrit": sanskrit,
            "transliteration": transliteration,
            "source_hash": compute_hash(source),  # hash by source title — matches on-chain registry
        })

    return chunks


def ingest():
    print("Initializing ChromaDB...")
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    # Delete existing collection if re-ingesting
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"Deleted existing collection '{COLLECTION_NAME}'")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    print("Loading embedding model (this may take a minute on first run)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    all_chunks = []
    for filepath in CORPUS_DIR.glob("*.txt"):
        print(f"Parsing: {filepath.name}")
        chunks = parse_corpus_file(filepath)
        all_chunks.extend(chunks)
        print(f"  -> {len(chunks)} chunks extracted")

    print(f"\nTotal chunks: {len(all_chunks)}")
    print("Generating embeddings...")

    texts = [c["text"] for c in all_chunks]
    embeddings = model.encode(texts, show_progress_bar=True).tolist()

    ids = [f"chunk_{i}" for i in range(len(all_chunks))]
    metadatas = [
        {
            "source": c["source"],
            "category": c["category"],
            "chapter": c["chapter"],
            "verse": c["verse"],
            "sanskrit": c["sanskrit"],
            "transliteration": c["transliteration"],
            "source_hash": c["source_hash"],
        }
        for c in all_chunks
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    print(f"\nIngestion complete. {len(all_chunks)} chunks stored in ChromaDB at '{CHROMA_PATH}'")

    # Print summary
    source_counts = {}
    for c in all_chunks:
        source_counts[c["source"]] = source_counts.get(c["source"], 0) + 1
    print("\nKnowledge Base Summary:")
    for src, count in sorted(source_counts.items()):
        print(f"  {src}: {count} chunks")


if __name__ == "__main__":
    ingest()
