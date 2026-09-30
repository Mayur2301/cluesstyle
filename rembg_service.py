"""
Background-removal microservice using rembg (U-2-Net).

Setup:
    pip install fastapi uvicorn python-multipart rembg onnxruntime pillow

Run:
    uvicorn rembg_service:app --host 0.0.0.0 --port 7860

First request will download the u2net.onnx model (~176MB) automatically
into ~/.u2net — subsequent requests are fast.

Endpoint:
    POST /remove-bg
      form-data: file=<image>
      returns: image/png with transparent background
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session
import io

app = FastAPI(title="ID Card BG Removal Service")

# Allow your Next.js dev/prod origins to call this directly if you ever
# skip the Next.js proxy route. Tighten this list for production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# Load the U-2-Net model once at startup, not per-request.
_session = new_session("u2net")

MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8MB


@app.post("/remove-bg")
async def remove_bg(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    raw = await file.read()
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 8MB)")

    try:
        output_bytes = remove(raw, session=_session)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Background removal failed: {exc}")

    return Response(content=output_bytes, media_type="image/png")


@app.get("/health")
async def health():
    return {"status": "ok"}