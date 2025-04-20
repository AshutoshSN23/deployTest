import React, { useEffect, useState } from 'react';

const Gemini = ({ videoData }) => {
  const [quizData, setQuizData] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = async () => {
    setQuizStarted(true);
    setLoading(true);
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      const prompt = `
${videoData}

Based only on the above content, generate 20 multiple-choice questions with 4 options each (A, B, C, D). 
Each question should be followed by 4 options and a clear correct answer.

IMPORTANT:
- Use the **same language** as the original content above.
- Do not translate into English.
- Respect the original tone and linguistic style.

Format each question like this:

Q: <question>
A. <option 1>
B. <option 2>
C. <option 3>
D. <option 4>
Answer: <correct option letter>
`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/\*/g, '');
      setQuizData(text);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setQuizData('Failed to load quiz content.');
    } finally {
      setLoading(false);
    }
  };

  const parseQuiz = (text) => {
    if (!text || typeof text !== 'string') return [];

    const qaBlocks = text.split(/(?:^|\n)Q[:：]/).filter(Boolean);

    return qaBlocks.map(block => {
      const lines = block.trim().split('\n').filter(Boolean);
      const question = lines[0]?.trim();

      const options = {};
      lines.slice(1, 5).forEach(line => {
        const match = line.match(/^([A-D])[.．]\s*(.*)/);
        if (match) {
          options[match[1]] = match[2].trim();
        }
      });

      const answerLine = lines.find(line => line.startsWith('Answer:'));
      const correctKey = answerLine?.match(/Answer:\s*([A-D])/i)?.[1];
      const correctAnswer = options[correctKey];

      return {
        question,
        options: Object.values(options),
        correctAnswer,
      };
    }).filter(qa => qa.question && qa.correctAnswer && qa.options?.length === 4);
  };

  const quizList = parseQuiz(quizData);

  const handleAnswer = (selectedOption) => {
    const current = quizList[currentQuestion];
    setUserAnswers(prev => [
      ...prev,
      {
        selected: selectedOption,
        correct: current.correctAnswer,
        question: current.question,
        options: current.options
      }
    ]);

    if (currentQuestion + 1 === quizList.length) {
      setShowResult(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResult(false);
    setQuizStarted(false);
    setQuizData('');
  };

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f4f6f8',
      minHeight: '100vh',
    }}>
      <h2 style={{
        marginBottom: '1rem',
        color: '#333',
        textAlign: 'center'
      }}>
        Quiz Mode
      </h2>

      {!quizStarted ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={startQuiz}
            style={{
              padding: '0.8rem 1.6rem',
              fontSize: '1.2rem',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ▶️ Start Quiz
          </button>
        </div>
      ) : loading ? (
        <p style={{ textAlign: 'center', fontSize: '1.2rem', color:'blue' }}>⏳ Generating quiz questions...</p>
      ) : showResult ? (
        <div>
          <h3 style={{ textAlign: 'center', color:'black' }}>
            🎉 You scored {userAnswers.filter(ans => ans.selected === ans.correct).length} out of {quizList.length}
          </h3>
          <button onClick={restartQuiz}
            style={{
              margin: '1rem auto',
              display: 'block',
              padding: '0.6rem 1.2rem',
              fontSize: '1rem',
              backgroundColor: '#43a047',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Restart
          </button>
          {userAnswers.map((entry, index) => (
            <div key={index}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
              }}>
              <p style={{ fontWeight: '600', color: '#1976d2' }}>
                Q{index + 1}: {entry.question}
              </p>
              {entry.options.map((opt, i) => {
                const isSelected = opt === entry.selected;
                const isCorrect = opt === entry.correct;
                let bgColor = '#e3f2fd';

                if (isSelected && isCorrect) bgColor = '#c8e6c9'; // green
                else if (isSelected && !isCorrect) bgColor = '#ffcdd2'; // red
                else if (isCorrect) bgColor = '#c5e1a5'; // highlight correct

                return (
                  <div key={i} style={{
                    backgroundColor: bgColor,
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    color:'black'
                  }}>
                    {opt}
                  </div>
                );
              })}
              <p style={{color:'black'}}><strong>Correct:</strong> {entry.correct}</p>
              <p  style={{color:'black'}}><strong>You selected:</strong> {entry.selected}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease-in-out',
        }}>
          <p style={{
            fontWeight: '600',
            fontSize: '1.1rem',
            color: '#1976d2',
            marginBottom: '1rem',
          }}>
            Q{currentQuestion + 1}: {quizList[currentQuestion]?.question}
          </p>
          {quizList[currentQuestion]?.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              style={{
                display: 'block',
                marginBottom: '0.8rem',
                padding: '0.6rem 1rem',
                width: '100%',
                textAlign: 'left',
                fontSize: '1rem',
                backgroundColor: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#333'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gemini;
