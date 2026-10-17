import os
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
OUTPUT_ZIP = os.path.join(ROOT_DIR, "cosy-reality-complete.zip")
PUBLIC_ZIP = os.path.join(ROOT_DIR, "public", "cosy-reality-complete.zip")

EXCLUDE_DIRS = {
    "node_modules",
    "dist",
    ".git",
    ".vite",
    "__pycache__",
    ".turbo",
}

EXCLUDE_FILES = {
    ".env",
    ".env.local",
    "cosy-reality-complete.zip",
    "scripts/test-firestore-connection.ts",
}

def should_exclude(rel_path):
    parts = rel_path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return True
    if rel_path in EXCLUDE_FILES:
        return True
    if rel_path.endswith(".zip"):
        return True
    return False

print("=" * 60)
print("COSY REALITY — PROJECT SOURCE ARCHIVE PACKAGER")
print("=" * 60)
print(f"Root Directory: {ROOT_DIR}")
print(f"Output Target:  {OUTPUT_ZIP}")

file_count = 0
total_uncompressed_bytes = 0

with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
    for dirpath, dirnames, filenames in os.walk(ROOT_DIR):
        # Exclude unwanted directories in place
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS and not d.startswith(".git")]
        
        for filename in filenames:
            abs_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(abs_path, ROOT_DIR)
            
            if should_exclude(rel_path):
                continue
            
            file_size = os.path.getsize(abs_path)
            total_uncompressed_bytes += file_size
            zipf.write(abs_path, rel_path)
            file_count += 1

# Also place a copy in public/ so it can be directly downloaded via web browser
os.makedirs(os.path.dirname(PUBLIC_ZIP), exist_ok=True)
shutil.copyfile(OUTPUT_ZIP, PUBLIC_ZIP)

compressed_size = os.path.getsize(OUTPUT_ZIP)

print("-" * 60)
print(f"Archived Files Count: {file_count}")
print(f"Uncompressed Size:    {total_uncompressed_bytes / (1024 * 1024):.2f} MB")
print(f"Compressed ZIP Size:  {compressed_size / (1024 * 1024):.2f} MB")
print(f"Generated Location:   {OUTPUT_ZIP}")
print(f"Public Download Path: {PUBLIC_ZIP}")
print("=" * 60)
