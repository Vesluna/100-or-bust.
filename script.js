document.addEventListener('DOMContentLoaded', () => {
    // State
    let penalties = [];
    let messageCount = 0;
    let triggeredPenaltyIndices = new Set();
    let isGameOver = false;

    // DOM Elements
    const setupView = document.getElementById('setup-view');
    const gameView = document.getElementById('game-view');
    const resultView = document.getElementById('result-view');
    const gameStatus = document.getElementById('game-status');
    
    const startBtn = document.getElementById('start-game-btn');
    const sendBtn = document.getElementById('send-btn');
    const restartBtn = document.getElementById('restart-btn');
    const manualEndBtn = document.getElementById('manual-end-btn');
    
    const guesserInput = document.getElementById('guesser-input');
    const chatHistory = document.getElementById('chat-history');
    const msgCountDisplay = document.getElementById('msg-count');
    
    const resultTitle = document.getElementById('result-title');
    const finalMsgs = document.getElementById('final-msgs');
    const finalPenalties = document.getElementById('final-penalties');
    const finalScore = document.getElementById('final-score');
    const penaltyList = document.getElementById('penalty-list');
    const penaltyChecks = document.querySelectorAll('.penalty-check');

    // Start Game
    startBtn.addEventListener('click', () => {
        const pInputs = [
            document.getElementById('p1').value.trim(),
            document.getElementById('p2').value.trim(),
            document.getElementById('p3').value.trim(),
            document.getElementById('p4').value.trim(),
            document.getElementById('p5').value.trim()
        ];

        if (pInputs.some(p => !p)) {
            alert('Mastermind, please set all 5 penalties!');
            return;
        }

        penalties = pInputs;
        setupView.classList.add('hidden');
        gameView.classList.remove('hidden');
        gameStatus.textContent = "Guesser's Turn: Reach 100% or Bust!";
    });

    // Penalty Tracking
    penaltyChecks.forEach(check => {
        check.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (e.target.checked) {
                triggeredPenaltyIndices.add(index);
                // Check for "The Sweep" (all 5 triggered)
                if (triggeredPenaltyIndices.size === 5) {
                    endGame("The Sweep! All penalties triggered.");
                }
            } else {
                triggeredPenaltyIndices.delete(index);
            }
        });
    });

    // Handle Message Sending
    function sendMessage() {
        if (isGameOver) return;
        
        const text = guesserInput.value.trim();
        if (!text) return;

        // Add message to UI
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message guesser';
        msgDiv.textContent = text;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Update count
        messageCount++;
        msgCountDisplay.textContent = messageCount;
        guesserInput.value = '';

        // Check for "The Century"
        if (messageCount >= 100) {
            endGame("The Century! 100 messages reached.");
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    guesserInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    manualEndBtn.addEventListener('click', () => {
        if (confirm("End the game now and calculate the score?")) {
            endGame("Game ended by Mastermind.");
        }
    });

    // Termination Logic
    function endGame(reason) {
        isGameOver = true;
        gameView.classList.add('hidden');
        resultView.classList.remove('hidden');
        gameStatus.textContent = reason || "Game Over";

        calculateFinalScore();
    }

    function calculateFinalScore() {
        let totalDeduction = 0;
        triggeredPenaltyIndices.forEach(index => {
            totalDeduction += (index + 1); // Penalty 1 is -1, Penalty 2 is -2, etc.
        });

        const score = messageCount - totalDeduction;
        const isVictory = score === 100;

        // Update UI
        resultTitle.textContent = isVictory ? "VICTORY!" : "BUST!";
        resultTitle.className = isVictory ? "victory" : "defeat";
        
        finalMsgs.textContent = messageCount;
        finalPenalties.textContent = `-${totalDeduction}`;
        finalScore.textContent = score;

        // Reveal penalties
        penaltyList.innerHTML = '';
        penalties.forEach((p, i) => {
            const li = document.createElement('li');
            const status = triggeredPenaltyIndices.has(i) ? "🚩 TRIGGERED" : "✅ CLEAN";
            li.innerHTML = `<strong>Penalty ${i+1} (-${i+1} pts):</strong> ${p} <span style="float:right">${status}</span>`;
            penaltyList.appendChild(li);
        });
    }

    restartBtn.addEventListener('click', () => {
        location.reload();
    });
});
