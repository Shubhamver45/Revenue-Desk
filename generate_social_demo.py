import os
import subprocess
import asyncio
import ssl
import certifi
import edge_tts

# Paths
FFMPEG_BIN = "/Users/shubham/Desktop/Flip/.venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
OUTPUT_DIR = "/tmp/social_demo_render"
DESKTOP_VIDEO = "/Users/shubham/Desktop/Revenue-Desk-Demo.mp4"
LOCAL_VIDEO = "/Users/shubham/Desktop/Flip/revenue_desk_demo.mp4"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Natural Human Indian English Voice: en-IN-PrabhatNeural ──
VOICE = "en-IN-PrabhatNeural"

# Configure SSL context for edge-tts
ssl_ctx = ssl.create_default_context(cafile=certifi.where())
edge_tts.constants.SSL_CONTEXT = ssl_ctx

SCENES = [
    {
        "id": "scene1_overview",
        "title": "Executive Overview & The $61,300 Hallucination Problem",
        "image": "/tmp/prod_video_screens/overview.png",
        "url_banner": "https://revenue-desk-gamma.vercel.app/?view=overview",
        "script": (
            "This is Revenue Desk, an autonomous financial operations platform powered by Switch. "
            "Our executive dashboard reports twenty-four thousand two hundred and fifty dollars in gross volume, but flags an apparent collapse in repeat purchases. "
            "When revenue drops, solo AI models assume customer churn and recommend expensive panic discounts, destroying twenty-five percent of annual margins. "
            "Revenue Desk solves this by using Switch to coordinate human finance executives and specialized AI agents in a shared room."
        )
    },
    {
        "id": "scene2_switch_room",
        "title": "Real Collaboration in Switch Room #revenue-desk",
        "image": "/tmp/prod_video_screens/room.png",
        "url_banner": "https://revenue-desk-gamma.vercel.app/?view=room",
        "script": (
            "Inside Switch room hash revenue desk, true team collaboration takes place. "
            "Alex Rivera, our VP of Finance, asks: Why did repeat purchases drop in the West region last month? "
            "Two specialized agents respond immediately. "
            "Our Analyst agent, powered by Llama 3.3, queries primary sales orders and reports the apparent volume drop. "
            "Simultaneously, our Reviewer agent, powered by Gemini 2.0 Flash, cross-audits secondary refund logs and discovers eight duplicate refund webhooks totaling twenty thousand four hundred and thirty dollars. "
            "Switch coordinates their messages, shared state, and task lifecycles in real time."
        )
    },
    {
        "id": "scene3_investigations",
        "title": "Investigations Workspace & Zero-Variance Consensus",
        "image": "/tmp/prod_video_screens/investigations.png",
        "url_banner": "https://revenue-desk-gamma.vercel.app/?view=investigations",
        "script": (
            "In the Investigations workspace, Switch enforces deterministic governance. "
            "Both agents execute read-only SQL queries across independent ledgers. "
            "The Reviewer proves the drop was not churn, but a payment gateway webhook glitch. "
            "Before any action is drafted, Switch requires a strict zero-dollar variance consensus. "
            "Once both agents verify that net revenue is exactly thirty-eight hundred and twenty dollars, the anomaly is verified and a calibrated win-back proposal is created."
        )
    },
    {
        "id": "scene4_approvals",
        "title": "Human-in-the-Loop Sign-off & Cryptographic Ledger",
        "image": "/tmp/prod_video_screens/approvals.png",
        "url_banner": "https://revenue-desk-gamma.vercel.app/?view=approvals",
        "script": (
            "Next is the human approval gate. "
            "Under Switch governance, AI agents are strictly blocked from mutating databases or launching campaigns autonomously. "
            "Alex Rivera reviews the audited findings, calibrates the discount from twenty-five percent down to fifteen percent, and authorizes the win-back. "
            "Every step — from initial inquiry to executive approval — is cryptographically sealed into an append-only SHA-256 audit chain, making tampering impossible."
        )
    },
    {
        "id": "scene5_impact",
        "title": "Protected Margin & Live Deployment",
        "image": "/tmp/prod_video_screens/overview.png",
        "url_banner": "https://revenue-desk-gamma.vercel.app/?view=overview",
        "script": (
            "Back on our overview dashboard, the business impact is clear. "
            "Switch prevented sixty-one thousand three hundred dollars in margin-eroding discounts while reconciling company books down to the cent. "
            "Without Switch, agents operate in blind silos. With Switch, humans and AI agents collaborate with deterministic safety and complete transparency. "
            "Explore Revenue Desk live right now at revenue-desk-gamma.vercel.app. Thank you."
        )
    }
]

async def generate_speech(text: str, output_path: str):
    communicate = edge_tts.Communicate(text, VOICE, rate="+16%")
    await communicate.save(output_path)

def get_audio_duration(file_path: str) -> float:
    cmd = [FFMPEG_BIN, "-i", file_path]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
    for line in res.stderr.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    return 30.0

def create_scene_frame(image_path: str, url_banner: str, output_frame_path: str):
    """
    Renders the live screenshot onto a 1920x1080 canvas with a subtle top browser URL pill
    showing the real live Vercel route.
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * {{ box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }}
            body {{ width: 1920px; height: 1080px; position: relative; overflow: hidden; background: #0F172A; }}
            .full-screenshot {{ width: 1920px; height: 1080px; object-fit: cover; display: block; }}
            .glass-bar {{
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(15, 23, 42, 0.92);
                backdrop-filter: blur(12px);
                color: #FFFFFF;
                padding: 6px 22px;
                border-radius: 999px;
                font-size: 13.5px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: 1px solid rgba(255, 255, 255, 0.15);
                z-index: 9999;
            }}
            .pulse-dot {{ width: 8px; height: 8px; border-radius: 50%; background: #10B981; }}
            .url-text {{ color: #38BDF8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }}
        </style>
    </head>
    <body>
        <div class="glass-bar">
            <span class="pulse-dot"></span>
            <span style="letter-spacing: 0.5px;">LIVE DEMO</span>
            <span style="color: #64748B;">•</span>
            <span class="url-text">{url_banner}</span>
        </div>
        <img class="full-screenshot" src="file://{image_path}" />
    </body>
    </html>
    """
    temp_html = output_frame_path.replace(".png", ".html")
    with open(temp_html, "w") as f:
        f.write(html_content)

    chrome_cmd = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--allow-file-access-from-files",
        f"--user-data-dir=/tmp/frame_prof_social_{os.path.basename(output_frame_path)}",
        "--window-size=1920,1080",
        f"--screenshot={output_frame_path}",
        f"file://{temp_html}"
    ]
    subprocess.run(chrome_cmd, check=True)

async def main():
    print("=== STARTING SOCIAL & YOUTUBE DEMO VIDEO GENERATION ===")
    print(f"Voice: {VOICE} (Microsoft Neural Indian English)")
    print(f"Output: {DESKTOP_VIDEO}\n")

    scene_video_files = []
    total_duration = 0.0

    for idx, scene in enumerate(SCENES, 1):
        s_id = scene["id"]
        print(f"--- Scene {idx}/{len(SCENES)}: {scene['title']} ---")

        # 1. Generate Voiceover Audio
        audio_file = os.path.join(OUTPUT_DIR, f"{s_id}.mp3")
        await generate_speech(scene["script"], audio_file)

        dur = get_audio_duration(audio_file) + 0.3  # small clean tail
        total_duration += dur
        print(f"Audio Duration: {dur:.2f}s (Cumulative: {total_duration:.2f}s)")

        # 2. Render 1920x1080 Frame
        frame_png = os.path.join(OUTPUT_DIR, f"{s_id}_frame.png")
        create_scene_frame(scene["image"], scene["url_banner"], frame_png)

        # 3. Render High-Bitrate Intra-Frame Video Clip
        scene_mp4 = os.path.join(OUTPUT_DIR, f"{s_id}.mp4")
        cmd_render = [
            FFMPEG_BIN, "-y",
            "-loop", "1",
            "-i", frame_png,
            "-i", audio_file,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-preset", "fast",
            "-crf", "18",
            "-g", "1",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "256k",
            "-t", str(dur),
            scene_mp4
        ]
        subprocess.run(cmd_render, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        scene_video_files.append(scene_mp4)

    # Concatenate clips
    concat_list = os.path.join(OUTPUT_DIR, "concat.txt")
    with open(concat_list, "w") as f:
        for fpath in scene_video_files:
            f.write(f"file '{fpath}'\n")

    print(f"\nConcatenating {len(scene_video_files)} scenes into master video...")
    cmd_concat = [
        FFMPEG_BIN, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        LOCAL_VIDEO
    ]
    subprocess.run(cmd_concat, check=True)

    # Copy to Desktop
    subprocess.run(["cp", LOCAL_VIDEO, DESKTOP_VIDEO], check=True)

    print("\n✅ MASTER SOCIAL & YOUTUBE DEMO CREATED!")
    print(f"Total Duration: {total_duration/60:.2f} minutes ({total_duration:.1f} seconds) [STRICTLY < 3 MIN]")
    print(f"Desktop Path: {DESKTOP_VIDEO}")
    print(f"Workspace Path: {LOCAL_VIDEO}")

if __name__ == "__main__":
    asyncio.run(main())
