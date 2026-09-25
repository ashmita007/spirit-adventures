import subprocess
import os

print("=== Starting 8K Video Processing for Hero Scenes ===")

out_dir = "frontend/public/videos/hero"
videos = [
    {
        "id": "rhythms_of_india",
        "title": "Rhythms of India"
    },
    {
        "id": "maldives_travel",
        "title": "Maldives Tropical Waters"
    },
    {
        "id": "kerala_cinematic",
        "title": "Kerala Cinematic"
    }
]

for v in videos:
    vid_id = v["id"]
    in_mp4 = f"{out_dir}/{vid_id}.mp4"
    out_8k_mp4 = f"{out_dir}/{vid_id}_8k.mp4"
    
    print(f"\n--> Upscaling {v['title']} to 8K Ultra-HD (7680x4320)...")
    cmd = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-i", in_mp4,
        "-vf", "scale=7680:4320:flags=lanczos,unsharp=5:5:0.7:5:5:0.0",
        "-c:v", "hevc_videotoolbox",
        "-b:v", "35M",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        out_8k_mp4
    ]
    subprocess.run(cmd, check=True)
    print(f"    8K Master saved: {out_8k_mp4}")

print("\n=== 8K Ultra-HD processing successfully finished for all videos! ===")
