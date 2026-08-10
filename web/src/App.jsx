import React, {useState} from "react";
import KeywordEditor from "./components/KeywordEditor.jsx";
import JsonPreview from "./components/JsonPreview.jsx";
import seed from "./data/category-keywords.json";

export default function App() {
  const [data, setData] = useState(seed);

  return (
    <div className="sb-root">
      <header className="sb-header">
        <h1 className="sb-wordmark">Try-On Words</h1>
        <p className="sb-sub">Palavras aceitas pelo Try-on · Sizebay</p>
      </header>

      <div className="sb-grid">
        <KeywordEditor data={data} setData={setData} />
        <JsonPreview data={data} setData={setData} />
      </div>
    </div>
  );
}
