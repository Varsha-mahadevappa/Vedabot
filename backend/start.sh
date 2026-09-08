#!/bin/bash
echo "Running corpus ingestion..."
python -m app.data.ingest
echo "Starting server..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8002}
