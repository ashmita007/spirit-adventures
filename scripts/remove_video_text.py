import subprocess
import os

print("=== Starting Text Removal for Hero Videos ===")

out_dir = "frontend/public/videos/hero"
os.makedirs(out_dir, exist_ok=True)

# Define clean time ranges (removing intro titles, logos, end credits)
clean_configs = [
    {
        "id": "rhythms_of_india",
        "title": "Rhythms of India",
        "start_time": "00:00:16",
        "duration": "00:00:52",  # from 00:16 to 01:08 (pure scenery, no title cards, no end credits)
        "poster_time": "00:00:02", # relative to start (00:18 = Taj Mahal & sunrise)
        "crop_letterbox": "crop=in_w:in_w*9/16:0:(in_h-(in_w*9/16))/2" # crop cinematic black bars to full 16:9
    },
    {
        "id": "maldives_travel",
        "title": "Maldives Tropical Waters",
        "start_time": "00:00:05",  # skip intro "MALDIVES" text overlay (0-5s)
        "duration": "00:00:52",   # to 00:57 (no end text)
        "poster_time": "00:00:10", # relative to start
        "crop_letterbox": None
    },
    {
        "id": "kerala_cinematic",
        "title": "Kerala Cinematic",
        "start_time": "00:00:00",  # start from tea estates
        "duration": "00:01:34",   # trim before "CREATED BY HUGMOUSS" end title card (at 01:35)
        "poster_time": "00:00:05", # relative to start
        "crop_letterbox": None
    }
]

for cfg in clean_configs:
    vid_id = cfg["id"]
    final_mp4 = f"{out_dir}/{vid_id}.mp4"
    temp_clean = f"{out_dir}/{vid_id}_clean_temp.mp4"
    poster_jpg = f"{out_dir}/{vid_id}_poster.jpg"
    
    print(f"\n--> Processing {cfg['title']} ({vid_id})...")
    print(f"    Trimming text: Start={cfg['start_time']}, Duration={cfg['duration']}")

    vf_filters = []
    if cfg["crop_letterbox"]:
        vf_filters.append(cfg["crop_letterbox"])

    filter_str = ",".join(vf_filters) if vf_filters else "null"

    cmd_trim = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-ss", cfg["start_time"],
        "-i", final_mp4,
        "-t", cfg["duration"],
        "-vf", filter_str,
        "-c:v", "libx264",
        "-crf", "18",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-an",
        temp_clean
    ]

    subprocess.run(cmd_trim, check=True)

    # Replace original with clean version
    os.replace(temp_clean, final_mp4)
    print(f"    Clean video saved: {final_mp4}")

    # Generate fresh clean poster frame
    print(f"    Generating text-free poster frame...")
    cmd_poster = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-ss", cfg["poster_time"],
        "-i", final_mp4,
        "-vframes", "1",
        "-q:v", "2",
        poster_jpg
    ]
    subprocess.run(cmd_poster, check=True)
    print(f"    Clean poster saved: {poster_jpg}")

print("\n=== Text removal successfully completed for all videos! ===")
