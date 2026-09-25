import subprocess
import os

videos = [
    {
        "id": "rhythms_of_india",
        "url": "https://youtu.be/m8qf5bSmlQQ",
        "title": "Rhythms of India | 4K Cinematic",
        "seek_poster": "00:00:08"
    },
    {
        "id": "maldives_travel",
        "url": "https://youtu.be/XhCkptbe7Z4",
        "title": "Maldives Tropical Waters | 4K",
        "seek_poster": "00:00:05"
    },
    {
        "id": "kerala_cinematic",
        "url": "https://youtu.be/zD43hknPtLc",
        "title": "Welcome to Kerala | 4K Cinematic",
        "seek_poster": "00:00:10"
    }
]

out_dir = "frontend/public/videos/hero"
os.makedirs(out_dir, exist_ok=True)
os.makedirs("tmp_vids", exist_ok=True)

for v in videos:
    vid_id = v["id"]
    url = v["url"]
    print(f"--> Downloading {v['title']} ({url})...")
    raw_path = f"tmp_vids/{vid_id}_raw.mp4"
    final_mp4 = f"{out_dir}/{vid_id}.mp4"
    poster_jpg = f"{out_dir}/{vid_id}_poster.jpg"

    # Download best available video stream (up to 4k/2160p) + audio or video-only
    cmd_dl = [
        "./venv/bin/yt-dlp",
        "-f", "bestvideo[height<=2160]+bestaudio/best[height<=2160]/best",
        "--merge-output-format", "mp4",
        "-o", raw_path,
        "--force-overwrites",
        url
    ]
    subprocess.run(cmd_dl, check=True)

    print(f"--> Optimizing {vid_id}.mp4 for Web FastStart...")
    # Remux/encode with faststart for instantaneous browser autoplay
    cmd_ffmpeg = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-i", raw_path,
        "-c:v", "libx264",
        "-crf", "20",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",  # Strip audio for silent background hero
        final_mp4
    ]
    subprocess.run(cmd_ffmpeg, check=True)

    print(f"--> Generating 4K Poster frame {poster_jpg}...")
    cmd_poster = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-ss", v["seek_poster"],
        "-i", raw_path,
        "-vframes", "1",
        "-q:v", "2",
        poster_jpg
    ]
    subprocess.run(cmd_poster, check=True)
    print(f"DONE: {final_mp4} & {poster_jpg}")

print("All 3 videos processed successfully!")
