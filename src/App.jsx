import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'

const maxTurns = 6;
const WORD_LENGTH = 5;
const WORDS = [
  'plant', // Spike plant
  'clutch', // (cut to 'clutc' if needed)
  'spray', // spray pattern
  'smoke', // controllers like Brimstone
  'ghost', // pistol
  'judge', // shotgun
  'viper', // agent
  'valor', // from Valorant
  'pearl', // map
  'split', // map
  'flash', // flash ability
  'spike', // bomb
  'spray', // firing style
  'boost', // movement trick
  'clear', // clear a corner
  'entry', // entry fragger
  'plant', // spike plant again
  'macro', // big picture strat
  'smurf',  // alt account
  'reyna'
];


function App() {
  const [ guesses, setGuesses ] = useState(Array(maxTurns).fill(null));
  const [ currentGuess, setCurrentGuess ] = useState('');
  const [ solution, setSolution ] = useState(getRandomWord()); // State to hold the solution word
  const [ gameOver, setGameOver ] = useState(false); // State to track if the game is over
  const [ gameId, setGameId ] = useState(0);

  function restartGame() {
    setSolution(getRandomWord());
    setGuesses(Array(maxTurns).fill(null));
    setCurrentGuess('');
    setGameOver(false);
    setGameId((prev) => prev + 1);
  }

  function shareResults() {
    const emojiLines = guesses
      .filter((g) => g !== null)
      .map((guess) => {
        const solutionChars = solution.split('');
        const guessChars = guess.split('');
        const result = Array(WORD_LENGTH).fill('⬛️');

        // First pass: correct
        for (let i = 0; i < WORD_LENGTH; i++) {
          if (guessChars[i] === solutionChars[i]) {
            result[i] = '🟩';
            solutionChars[i] = null;
          }
        }

        // Second pass: present
        for (let i = 0; i < WORD_LENGTH; i++) {
          if (result[i] === '🟩') continue;
          const idx = solutionChars.indexOf(guessChars[i]);
          if (idx !== -1) {
            result[i] = '🟨';
            solutionChars[idx] = null;
          }
        }

        return result.join('');
      });

    const shareText = `Valordle\n${emojiLines.join('\n')}`;

    // Try standard clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(shareText)
        .then(() => alert('✅ Copied to clipboard!'))
        .catch(() => fallbackCopy(shareText));
    } else {
      fallbackCopy(shareText);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // avoid scrolling
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      alert(successful ? "✅ Copied to clipboard!" : "❌ Copy failed.");
    } catch (err) {
      alert("❌ Copy failed.");
    }

    document.body.removeChild(textarea);
  }


  useEffect(() => {
    if (gameOver) return;
    const handleKeyDown = (event) => { // Handle key presses for input
      if (event.key === 'Enter') {
        if (currentGuess.length === WORD_LENGTH) {
          setGuesses((prevGuesses) => {
            const newGuesses = [...prevGuesses];
            const index = prevGuesses.findIndex(g => g === null);
            newGuesses[index] = currentGuess;

            // ✅ Check if guess is correct
            if (currentGuess === solution) {
              setGameOver(true);
            }

            return newGuesses;
          });
          setCurrentGuess('');
        }
      } else if (event.key === 'Backspace') { // Remove the last character from the current guess
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(event.key)) { // Check if the key is a letter
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + event.key.toLowerCase());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Cleanup event listener on unmount

  return (
    <div className="App">
      <h1>Valordle</h1>
      <div className="board" key={gameId}>
        {guesses.map((guess, i) => {
          const isCurrent = i === guesses.findIndex(g => g === null);
          return (
            <Line key={`${gameId}-${i}`} guess={isCurrent ? currentGuess : guess ?? ""}
            isSubmitted={!isCurrent}
            solution={solution}
            />
          );
        })}
      </div>
      {gameOver && (
      <div className="game-over">
        🎉 Game Over! You guessed the word!
        <br />
        <button className="restart-btn" onClick={restartGame}>
          🔁 Play Again
        </button>
        <br />
        <button className="share-btn" onClick={shareResults}>
          📤 Share Result
        </button>
      </div>
    )}
    </div>
  );

  
}

// Destructure the guess prop and render each letter
function Line({ guess, isSubmitted, solution }) {
  const tiles = [];

  // Track letter matches
  const solutionChars = solution.split('');
  const guessChars = guess.split('');
  const result = Array(WORD_LENGTH).fill(''); // 'correct', 'present', 'absent'

  // First pass: correct letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === solutionChars[i]) {
      result[i] = 'correct';
      solutionChars[i] = null; // Mark as used
    }
  }

  // Second pass: present letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] !== '' || !guessChars[i]) continue;

    const index = solutionChars.indexOf(guessChars[i]);
    if (index !== -1) {
      result[i] = 'present';
      solutionChars[index] = null; // Mark as used
    } else {
      result[i] = 'absent';
    }
  }

  // Create tiles
  for (let i = 0; i < WORD_LENGTH; i++) {
    const letter = guessChars[i] || '';
    let className = 'tile';

    if (isSubmitted) {
      className += ' ' + result[i];
    } else if (letter) {
      className += ' filled';
    }

    tiles.push(
      <div key={i} className={className}>
        {letter}
      </div>
    );
  }

  return <div className="line">{tiles}</div>;
}

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}


export default App
