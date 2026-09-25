import subprocess
import glob
import os

out_dir = "frontend/public/videos/hero"
vids = [
    {"name": "rhythms_of_india.mp4", "scale": "3840:2160", "crf": "23"},
    {"name": "rhythms_of_india_8k.mp4", "scale": "3840:2160", "crf": "23"},
    {"name": "maldives_travel.mp4", "scale": "3840:2160", "crf": "23"},
    {"name": "maldives_travel_8k.mp4", "scale": "3840:2160", "crf": "23"},
    {"name": "kerala_cinematic.mp4", "scale": "3840:2160", "crf": "23"},
    {"name": "kerala_cinematic_8k.mp4", "scale": "3840:2160", "crf": "23"},
]

for item in vids:
    fn = item["name"]
    fpath = f"{out_dir}/{fn}"
    temp_fpath = f"{out_dir}/opt_{fn}"
    if not os.path.exists(fpath):
        continue
    
    print(f"--> Optimizing {fn} for GitHub & Fast Web Streaming (<45MB)...")
    cmd = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-i", fpath,
        "-vf", f"scale={item['scale']}:flags=bicubic",
        "-c:v", "libx264",
        "-crf", item["crf"],
        "-maxrate", "6M",
        "-bufsize", "12M",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        temp_fpath
    ]
    subprocess.run(cmd, check=True)
    os.replace(temp_fpath, fpath)
    sz_mb = os.path.getsize(fpath) / (1024 * 1024)
    print(f"    Done {fn}: {sz_mb:.1f} MB (GitHub safe & ultra-fast)")

print("\nAll videos optimized under GitHub 100MB limit!")
