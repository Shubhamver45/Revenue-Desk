# 🎬 2-Minute Demo Video Walkthrough & Script

Use this exact script when recording your 2 to 3-minute video for the hackathon submission.

---

## ⏱️ Video Breakdown

| Timestamp | Screen Display | Narration / Action |
|-----------|----------------|--------------------|
| **0:00 - 0:25** | Terminal showing banner or Switch Console | **"Hi everyone, this is Revenue Desk. Normally, AI coding agents like Claude Code, Codex, or Cursor sit trapped in single terminals. We used Switch to turn them into active teammates inside a shared room with a human manager."** |
| **0:25 - 0:50** | Manager asking question | **"Here, our sales manager notices a drop in revenue and asks in #revenue-desk: *'Why did repeat purchases drop in the West region last month?'* The Analyst agent queries the database and reports a drop in enterprise orders."** |
| **0:50 - 1:25** | Reviewer catching discrepancy (**The Wow Moment!**) | **"Now watch this: in any standard setup, a human might act on that immediately. But in Revenue Desk, the Reviewer agent independently executes its own verification query. And it catches a major discrepancy: the Analyst missed $20,430 in refunded billing charges! The true drop is even worse."** |
| **1:25 - 1:55** | Action Proposal & Approval Gate | **"With the corrected numbers, the Analyst drafts an executive win-back campaign. But notice: the agent CANNOT execute on its own. It traps execution at an approval gate. The manager types: *'Approved. Change discount from 10% to 15%'*."** |
| **1:55 - 2:30** | Execution & Executive Report | **"Only after human approval does the agent write to the database and log the decision into Switch's permanent audit lineage. Every teammate can now see who checked what, what was decided, and why. That's Revenue Desk."** |

---

## 🚀 Live Demo Commands to Run on Screen

### Step 1: Launch
```bash
python3 main.py
```

### Step 2: Paste the Question
```text
Why did repeat purchases drop in the West region last month?
```

### Step 3: Approve
```text
Approved. Change discount from 10% to 15%.
```

### Step 4: Show the Executive Report
```bash
python3 scripts/export_report.py
```
Open `data/executive_report.html` in your browser to show the visual proof of decisions and campaigns!

