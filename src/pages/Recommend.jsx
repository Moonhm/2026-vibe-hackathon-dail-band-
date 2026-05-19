import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions, getRecommendations } from "../data/recommendations";
import BottomNav from "../components/BottomNav";
import { IMG_FALLBACK } from "../utils/constants";
import "./Recommend.css";
const RESULT_KEY = "nolrugaja_recommend_result";

function loadSaved() {
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function Recommend() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = intro, 1..N = questions, N+1 = result
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [isPrev, setIsPrev] = useState(false);
  const [saved, setSaved] = useState(loadSaved);

  const totalSteps = questions.length;

  function handleAnswer(option) {
    const newAnswers = [...answers, option.tags];
    setAnswers(newAnswers);

    if (step < totalSteps) {
      setStep(step + 1);
    }

    if (step === totalSteps) {
      const allTags = newAnswers.flat();
      const recResults = getRecommendations(allTags);
      const entry = { results: recResults, savedAt: new Date().toISOString() };
      try { localStorage.setItem(RESULT_KEY, JSON.stringify(entry)); } catch {}
      setSaved(entry);
      setResults(recResults);
      setIsPrev(false);
      setStep(totalSteps + 1);
    }
  }

  function handleShowPrev() {
    if (!saved) return;
    setResults(saved.results);
    setIsPrev(true);
    setStep(totalSteps + 1);
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setResults(null);
    setIsPrev(false);
  }

  if (step === 0) {
    return (
      <div className="recommend-page">
        <div className="recommend-intro">
          <span className="intro-icon">🗺️</span>
          <h2>나에게 맞는 여행지 찾기</h2>
          <p>
            5가지 질문에 답하면 당신의 여행 성향을 분석해<br />
            딱 맞는 국내 여행지와 추천 관광지를 알려드립니다!
          </p>
          <button className="btn-start" onClick={() => setStep(1)}>
            테스트 시작하기
          </button>
          <button
            className="btn-prev"
            onClick={handleShowPrev}
            disabled={!saved}
          >
            {saved
              ? `이전 결과 보기 · ${formatDate(saved.savedAt)}`
              : "이전 결과 없음"}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (step <= totalSteps) {
    const q = questions[step - 1];
    const progress = ((step - 1) / totalSteps) * 100;

    return (
      <div className="recommend-page">
        <div className="quiz-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="step-label">
            {step} / {totalSteps}
          </p>
          <h2 className="question-text">{q.text}</h2>
          <div className="options-grid">
            {q.options.map((opt) => (
              <button
                key={opt.text}
                className="option-btn"
                onClick={() => handleAnswer(opt)}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="recommend-page">
      <div className="result-container">
        {isPrev && saved && (
          <p className="result-prev-notice">
            📅 이전 테스트 결과 · {formatDate(saved.savedAt)}
          </p>
        )}
        <h2 className="result-title">당신을 위한 추천 여행지</h2>
        <p className="result-sub">분석 결과, 이런 여행지가 잘 맞을 것 같아요!</p>

        <div className="result-cards">
          {results.map((dest, i) => (
            <div key={dest.id} className={`result-card rank-${i + 1}`}>
              {i === 0 && <span className="rank-badge">Best Match</span>}
              <img src={dest.image} alt={dest.name}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK; }} />
              <div className="result-info">
                <h3>{dest.name}</h3>
                <p>{dest.description}</p>
                <div className="tags" style={{ marginBottom: 10 }}>
                  {dest.tags.map((tag) => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <div className="best-festivals">
                  <strong>추천 명소</strong>
                  <ul>
                    {dest.bestFestivals.map((f) => (
                      <li key={f.name}>
                        {f.id ? (
                          <button
                            className="bf-link"
                            onClick={() => navigate(`/detail/${f.id}`)}
                          >
                            {f.name} →
                          </button>
                        ) : (
                          f.name
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="dest-tip">💡 {dest.tip}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="btn-restart" onClick={restart}>
            다시 테스트하기
          </button>
          {isPrev && (
            <button className="btn-restart btn-restart-outline" onClick={restart}>
              처음으로
            </button>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
