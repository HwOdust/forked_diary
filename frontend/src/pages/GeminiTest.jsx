import { useState } from "react";

function GeminiTest() {
    const [msg, setMsg] = useState("");
    const [result, setResult] = useState("");

    const askGemini = () => {
        fetch("http://localhost:8080/gemini?msg=" + encodeURIComponent(msg))
            .then(res => res.text())
            .then(data => setResult(data))
            .catch(err => console.log(err));
    };

    return (
        <div>
            <h2>Gemini 테스트</h2>

            <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="예: 내일 3시에 병원 예약"
            />

            <button onClick={askGemini}>보내기</button>

            <pre>{result}</pre>
        </div>
    );
}

export default GeminiTest;