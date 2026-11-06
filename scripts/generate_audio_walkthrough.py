#!/usr/bin/env python3
"""
Audio narration generator for the product walkthrough demo.
Generates synchronized scene audio files for presentation playback
with exact timing under 3 minutes (~2m 32s total).
"""

import os
import wave
import subprocess
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
UI_AUDIO_DIR = ROOT_DIR / "src" / "ui" / "audio"
UI_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# 7 Detailed Presentation Scenes spoken at calm, authoritative human pace
SCENES = [
    {
        "id": "01_problem",
        "title": "Scene 1: The Problem & Financial Risk",
        "text": "Hello judges. Today, large language models are being deployed across enterprise workflows... but in mission-critical finance, an unverified autonomous AI is dangerous. If an AI agent looks only at top-line gross revenue without auditing the underlying payment processor tables, it hallucinates customer churn... and panics by giving away thousands of dollars in unneeded discounts.",
        "cursor": {"top": "18%", "left": "48%"},
        "action": """highlightElement(doc.querySelector(".kpi-row"));"""
    },
    {
        "id": "02_inquiry",
        "title": "Scene 2: Multi-Agent Orchestration (@analyst SQL)",
        "text": "Here in our production cockpit, the Operations Lead notices an alarming drop in October gross revenue, and asks Switch: Why did repeat purchases drop in the West region last month? Watch how Switch orchestrates the workflow. Instead of guessing, the Analyst Agent translates this business question into verified SQL... querying our live database across eighty enterprise accounts.",
        "cursor": {"top": "68px", "left": "68%"},
        "action": """const btn = doc.querySelector(".btn-primary"); if (btn) btn.click(); highlightElement(doc.querySelector(".room-card"));"""
    },
    {
        "id": "03_audit_catch",
        "title": "Scene 3: Multi-Agent Consensus & Anomaly Audit",
        "text": "Now, observe the Reviewer Agent. A solo AI would stop here and declare an eighty-four percent revenue collapse. But under Switch room governance, our Reviewer executes an automated anomaly audit across the processor refund logs. It discovers eight duplicate refund reversal loops on orders one to three... catching an unrecorded twenty thousand, four hundred and thirty dollar payment gateway glitch!",
        "cursor": {"top": "35%", "left": "75%"},
        "action": """highlightElement(doc.getElementById("metricNet"));"""
    },
    {
        "id": "04_why_switch",
        "title": "Scene 4: Why Switch? (Solo AI Crash Comparison)",
        "text": "On the revenue trajectory chart, we can compare With Switch AI against Without Switch. Notice the dotted red curve. Without Switch's multi-agent consensus, a solo AI model panics, misses the duplicate refunds, and issues a drastic twenty-five percent renewal discount... burning nine thousand, five hundred and fifty dollars in company margin. With Switch, the real numbers are protected.",
        "cursor": {"top": "27%", "left": "42%"},
        "action": """const btnWithout = doc.getElementById("btnWithoutSwitch"); if (btnWithout) btnWithout.click(); highlightElement(doc.querySelector(".chart-card")); setTimeout(() => { const btnWith = doc.getElementById("btnWithSwitch"); if (btnWith) btnWith.click(); }, 4000);"""
    },
    {
        "id": "05_human_gate",
        "title": "Scene 5: Switch Rule #4 (Human Sign-Off Gate)",
        "text": "Next, Switch Rule number four enforces a strict Human-in-the-Loop Sign-Off Gate. Database mutations are physically blocked by declarative policy until the Human Lead reviews the numbers. Using our interactive calibration slider, the manager sets a balanced fifteen percent renewal incentive... preserving thirty-eight thousand dollars in pipeline, and securing thirty-two thousand, four hundred and seventy dollars in net margin.",
        "cursor": {"top": "72%", "left": "30%"},
        "action": """highlightElement(doc.querySelector(".gate-card"));"""
    },
    {
        "id": "06_database_memo",
        "title": "Scene 6: Cryptographic Ledger & Live Database",
        "text": "When the manager clicks Authorize, the transaction is committed directly to our live production database, and cryptographically logged into the immutable Switch Decision Ledger. Every single metric you see is backed by one hundred and sixty live transactions, with zero simulated or fake data.",
        "cursor": {"top": "86%", "left": "22%"},
        "action": """const btnApprove = doc.getElementById("btnApprove"); if (btnApprove && !btnApprove.disabled) btnApprove.click(); highlightElement(doc.getElementById("gateBadge"));"""
    },
    {
        "id": "07_conclusion",
        "title": "Scene 7: Conclusion & Reproducibility",
        "text": "Revenue Desk runs in a single command, backed by a one hundred percent test pass rate. By combining multi-agent consensus, declarative room rules, and a human sign-off gate, Switch transforms unpredictable generative AI into trusted, enterprise-grade financial governance. Thank you!",
        "cursor": {"top": "18%", "left": "80%"},
        "action": """highlightElement(doc.querySelector(".brand-logo"));"""
    }
]

def main():
    print("=" * 65)
    print("🎙️ Generating High-Fidelity Indian Male Human Voiceover (Voice: Aman - en_IN)...")
    print("🐌 Speaking Rate: 128 WPM (Calm, thoughtful human reading pace)")
    print("=" * 65)

    cue_data = []
    current_time = 0.0
    pause_duration = 1.5  # 1.5s natural human breathing pause between scenes

    wav_files = []

    for idx, scene in enumerate(SCENES):
        scene_id = scene["id"]
        raw_aiff = Path(f"/tmp/{scene_id}_aman_slow.aiff")
        scene_wav = UI_AUDIO_DIR / f"{scene_id}.wav"
        scene_m4a = UI_AUDIO_DIR / f"{scene_id}.m4a"

        # 1. Synthesize narration
        print(f"[{idx+1}/7] Synthesizing {scene['title']}...")
        cmd_say = ["/usr/bin/say", "-v", "Aman", "-r", "128", scene["text"], "-o", str(raw_aiff)]
        subprocess.run(cmd_say, check=True)

        # 2. Convert to standard 16-bit 44.1kHz WAV
        cmd_convert = ["/usr/bin/afconvert", "-f", "WAVE", "-d", "LEI16@44100", str(raw_aiff), str(scene_wav)]
        subprocess.run(cmd_convert, check=True)

        # 3. Convert to AAC M4A
        cmd_m4a = ["/usr/bin/afconvert", "-f", "m4af", "-d", "aac ", str(scene_wav), str(scene_m4a)]
        subprocess.run(cmd_m4a, check=True)

        # Measure duration
        with wave.open(str(scene_wav), "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration = frames / float(rate)

        start_time = round(current_time, 2)
        end_time = round(current_time + duration, 2)

        cue_data.append({
            "start": start_time,
            "end": end_time,
            "title": scene["title"],
            "cursor": scene["cursor"],
            "action": scene["action"]
        })

        wav_files.append((scene_wav, duration))
        current_time = end_time + pause_duration

    # Concatenate all scene WAVs with 1.5s pause
    master_wav = UI_AUDIO_DIR / "master_pitch.wav"
    master_m4a = UI_AUDIO_DIR / "master_pitch.m4a"

    print("\nMerging into master audio track...")
    with wave.open(str(wav_files[0][0]), "rb") as first_wf:
        params = first_wf.getparams()

    with wave.open(str(master_wav), "wb") as out_wf:
        out_wf.setparams(params)
        silence_frames = int(params.framerate * pause_duration)
        silence_bytes = b"\x00" * (silence_frames * params.nchannels * params.sampwidth)

        for i, (wpath, dur) in enumerate(wav_files):
            with wave.open(str(wpath), "rb") as in_wf:
                out_wf.writeframes(in_wf.readframes(in_wf.getnframes()))
            if i < len(wav_files) - 1:
                out_wf.writeframes(silence_bytes)

    # Convert master WAV to M4A
    subprocess.run(["/usr/bin/afconvert", "-f", "m4af", "-d", "aac ", str(master_wav), str(master_m4a)], check=True)

    total_dur = round(current_time - pause_duration, 2)
    minutes = int(total_dur // 60)
    seconds = int(total_dur % 60)

    print("\n" + "=" * 65)
    print(f"✅ Master narration track generated!")
    print(f"⏱️ Exact Duration: {total_dur}s ({minutes}:{seconds:02d})")
    print(f"📁 Output files: {master_wav} & {master_m4a}")
    print("=" * 65)

    import json
    print("\nSCRIPT_CUES for video.html:")
    print(json.dumps(cue_data, indent=4))

if __name__ == "__main__":
    main()
