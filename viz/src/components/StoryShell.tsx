// src/components/StoryShell.tsx
import React, { useMemo, useState } from "react";
import { Scrollama, Step } from "react-scrollama";
import { motion } from "framer-motion";
import type { OtpRow } from "../types";
import type { QueensLine } from "../lineMeta";
import { QUEENS_LINES } from "../lineMeta";
import { RankingChart } from "./viz/RankingChart";
import { TimelineSmallMultiples } from "./viz/TimelineSmallMultiples";
import { SubwayBullet } from "./SubwayBullet";

type Scene = "intro" | "ranking" | "winner" | "timeline" | "outro";

function computeAvgByLine(rows: OtpRow[]) {
  const sums = new Map<string, { sum: number; n: number }>();
  for (const r of rows) {
    const cur = sums.get(r.line) ?? { sum: 0, n: 0 };
    cur.sum += r.otp_pct;
    cur.n += 1;
    sums.set(r.line, cur);
  }
  return Array.from(sums.entries())
    .map(([line, v]) => ({ line, avg: v.sum / v.n }))
    .sort((a, b) => a.avg - b.avg);
}

export function StoryShell({ data }: { data: OtpRow[] }) {
  const [scene, setScene] = useState<Scene>("intro");
  const [selectedLine, setSelectedLine] = useState<QueensLine>("7");

  const weekday = useMemo(
    () => data.filter((d) => d.day_type_label === "Weekday"),
    [data]
  );

  const ranking = useMemo(() => computeAvgByLine(weekday), [weekday]);

  const winner = useMemo(() => {
    // highest average OTP among QUEENS_LINES
    let best: QueensLine = "7";
    let bestAvg = -Infinity;
    for (const l of QUEENS_LINES) {
      const row = ranking.find((r) => r.line === l);
      if (!row) continue;
      if (row.avg > bestAvg) {
        bestAvg = row.avg;
        best = l as QueensLine;
      }
    }
    return best;
  }, [ranking]);

  const onStepEnter = ({ data }: { data: Scene }) => {
    setScene(data);
    if (data === "winner") setSelectedLine(winner);
  };

  return (
    <div className="story">
      <header className="storyHeader">
        <h1>Queens → Manhattan: Which train actually holds up?</h1>
        <p>
          I hate going to the city because it always takes forever. These trains
          are usually reliable… until they aren’t. Using 10 years of MTA terminal
          on-time performance, we’ll compare the Queens-to-Manhattan lines I
          actually take:{" "}
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            {QUEENS_LINES.map((l) => (
              <span
                key={l}
                style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
              >
                <SubwayBullet line={l} size={22} />
              </span>
            ))}
          </span>
        </p>
      </header>

      {/* Option B layout: each step includes its own viz, both scroll together */}
      <Scrollama offset={0.6} onStepEnter={onStepEnter}>
        {/* INTRO */}
        <Step data={"intro"}>
          <div className="stepRow">
            <div className={`stepCard ${scene === "intro" ? "active" : ""}`}>
              <h3>The commute question</h3>
              <p>
                When I’m going from Queens to Manhattan, I want one thing:{" "}
                <b>a predictable trip</b>. Even if a line is “pretty reliable,”
                the occasional bad month can make it feel awful.
              </p>
              <p>
                We’ll look at <b>weekday</b> reliability from 2015–2024, because
                that’s when commutes matter most.
              </p>
            </div>

            <motion.div
              className="vizCard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h2>What we’re measuring</h2>
              <p style={{ marginTop: 6, color: "rgba(0,0,0,0.72)", lineHeight: 1.6 }}>
                Terminal on-time performance = the % of scheduled trips that
                arrive on time at the terminal. It’s not “minutes delayed,” but
                it’s a clean way to compare reliability across lines over time.
              </p>
              <div style={{ marginTop: 12, fontSize: 12, color: "rgba(0,0,0,0.65)" }}>
                Scroll to see the decade-long ranking and then the timeline.
              </div>
            </motion.div>
          </div>
        </Step>

        {/* RANKING */}
        <Step data={"ranking"}>
          <div className="stepRow">
            <div className={`stepCard ${scene === "ranking" ? "active" : ""}`}>
              <h3>First, the decade-long ranking</h3>
              <p>
                Let’s settle the argument: which line has the best (and worst)
                average on-time performance across the last decade?
              </p>
              <p style={{ color: "rgba(0,0,0,0.72)" }}>
                Ranking is based on <b>weekday</b> monthly performance from{" "}
                <b>2015–2024</b>.
              </p>
            </div>

            <motion.div
              className="vizCard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h2>Average on-time performance (Weekdays, 2015–2024)</h2>
              <RankingChart data={weekday} />
            </motion.div>
          </div>
        </Step>

        {/* WINNER SPOTLIGHT */}
        <Step data={"winner"}>
          <div className="stepRow">
            <div className={`stepCard ${scene === "winner" ? "active" : ""}`}>
              <h3>The “most reliable” winner</h3>
              <p>
                Over the full decade, the highest average belongs to{" "}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <SubwayBullet line={winner} size={24} /> <b>{winner}</b>
                </span>
                .
              </p>
              <p style={{ color: "rgba(0,0,0,0.72)" }}>
                But averages can hide pain. Next we look at how reliability
                changes month-to-month.
              </p>

              <div style={{ marginTop: 10 }}>
                <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(0,0,0,0.7)" }}>
                    Spotlight a line:
                  </span>
                  <select
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value as QueensLine)}
                    style={{ padding: "6px 10px", borderRadius: 10 }}
                  >
                    {QUEENS_LINES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <motion.div
              className="vizCard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h2>Ranking with spotlight</h2>
              <RankingChart data={weekday} highlightLine={selectedLine} />
            </motion.div>
          </div>
        </Step>

        {/* TIMELINE */}
        <Step data={"timeline"}>
          <div className="stepRow">
            <div className={`stepCard ${scene === "timeline" ? "active" : ""}`}>
              <h3>Reliability over time</h3>
              <p>
                Here’s the monthly timeline for each Queens-to-Manhattan line.
                Click a bullet to spotlight it. Look for dips — those are the
                months where “it took forever” becomes real.
              </p>
              <p style={{ color: "rgba(0,0,0,0.72)" }}>
                Next upgrade: we’ll quantify “occasional delays” using volatility
                and “bad month” rates.
              </p>
            </div>

            <motion.div
              className="vizCard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h2>Monthly timeline (Weekdays)</h2>
              <TimelineSmallMultiples
                data={weekday}
                highlightLine={selectedLine}
                onSelectLine={setSelectedLine}
              />
            </motion.div>
          </div>
        </Step>

        {/* OUTRO */}
        <Step data={"outro"}>
          <div className="stepRow">
            <div className={`stepCard ${scene === "outro" ? "active" : ""}`}>
              <h3>Takeaway</h3>
              <p>
                The line with the best average isn’t always the one that feels
                best day-to-day. “Usually reliable” can still mean “sometimes
                catastrophic.”
              </p>
              <ul style={{ lineHeight: 1.7, color: "rgba(0,0,0,0.75)" }}>
                <li>
                  Next: compute <b>volatility</b> (how unpredictable each line is)
                </li>
                <li>
                  Next: count <b>bad months</b> (e.g., months below 75% OTP)
                </li>
                <li>
                  Add annotations for notable dips
                </li>
              </ul>
            </div>

            <motion.div
              className="vizCard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h2>What we’ll add next</h2>
              <p style={{ marginTop: 6, color: "rgba(0,0,0,0.72)", lineHeight: 1.6 }}>
                Volatility + bad-month frequency will make your story match how
                the commute feels: mostly fine, occasionally brutal.
              </p>
            </motion.div>
          </div>
        </Step>
      </Scrollama>
    </div>
  );
}
