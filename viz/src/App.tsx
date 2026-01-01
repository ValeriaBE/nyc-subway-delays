import { useEffect, useState } from "react";
import "./App.css";
import type { OtpRow } from "./types";
import { loadOtpData } from "./utils/loadOtpData";
import { StoryShell } from "./components/StoryShell";

function App() {
  const [data, setData] = useState<OtpRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOtpData()
      .then(setData)
      .catch((e) => {
        console.error(e);
        setError("Failed to load data.");
      });
  }, []);

  if (error) return <div className="app">Error: {error}</div>;
  if (!data) return <div className="app">Loading…</div>;

  return (
    <div className="app">
      <StoryShell data={data} />
    </div>
  );
}

export default App;
