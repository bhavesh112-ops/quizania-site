document.addEventListener('DOMContentLoaded', function() {
  // Loader Hide after Page Load
  window.addEventListener("load", function() {
    document.getElementById("loader").style.display = "none";
  });

  // Elements
  const termsCheckbox = document.getElementById('terms');
  const startBtn = document.getElementById('startBtn');
  const paymentMessage = document.getElementById('paymentMessage');
  const timerDisplay = document.getElementById('timerDisplay');
  const qrCode = document.getElementById('qrCode');
  const quizEl = document.getElementById('quiz');
  const questionBox = document.getElementById('questionBox');
  const optionsBox = document.getElementById('optionsBox');
  const timerEl = document.getElementById('timer');
  const paymentInstruction = document.getElementById('paymentInstruction');
  const downloadBtn = document.getElementById('download-btn');

  // Variables
  let currentQuestion = 0;
  let score = 0;
  let answers = [];
  let totalTime = 0;
  let quizInterval, quizTime;

  // Full Question Bank (20 Questions)
  const allQuestions = [
    { q: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], correct: 2 },
    { q: "Which planet is known as the 'Red Planet'?", options: ["Earth", "Venus", "Mars", "Jupiter"], correct: 2 },
    { q: "Who wrote the play 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Leo Tolstoy", "Mark Twain"], correct: 1 },
    { q: "What is the chemical symbol for water?", options: ["CO2", "H2O", "O2", "NaCl"], correct: 1 },
    { q: "Which organ pumps blood throughout the human body?", options: ["Brain", "Liver", "Heart", "Lung"], correct: 2 },
    { q: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], correct: 2 },
    { q: "Who was the first person to walk on the moon?", options: ["Neil Armstrong", "Yuri Gagarin", "Buzz Aldrin", "Michael Collins"], correct: 1 },
    { q: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2 },
    { q: "Which is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"], correct: 1 },
    { q: "Which country is famous for inventing pizza?", options: ["France", "Italy", "Spain", "Greece"], correct: 1 },
    { q: "What is the square root of 81?", options: ["8", "9", "7", "6"], correct: 1 },
    { q: "In which country is the Taj Mahal located?", options: ["India", "Pakistan", "Bangladesh", "Nepal"], correct: 1 },
    { q: "What is the process of plants making their food called?", options: ["Germination", "Photosynthesis", "Transpiration", "Respiration"], correct: 1 },
    { q: "Which metal is liquid at room temperature?", options: ["Gold", "Mercury", "Silver", "Copper"], correct: 1 },
    { q: "Who is known as the 'Father of Computers'?", options: ["Albert Einstein", "Charles Babbage", "Isaac Newton", "Alan Turing"], correct: 1 },
    { q: "What is the smallest prime number?", options: ["0", "1", "2", "3"], correct: 2 },
    { q: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
    { q: "What does 'www' stand for in a website browser?", options: ["World Wide Web", "World Wired Web", "Wide World Web", "Web World Wide"], correct: 1 },
    { q: "Who painted the Mona Lisa?", options: ["Vincent Van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], correct: 2 },
    { q: "Which language is used to create webpages?", options: ["HTML", "C++", "Python", "Java"], correct: 1 }
  ];

  // Shuffle Function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleArray(allQuestions);
  const questions = allQuestions.slice(0, 10);

  // Terms Checkbox Event
  termsCheckbox.addEventListener('change', () => {
    if (termsCheckbox.checked) {
      qrCode.innerHTML = ""; // Clear previous QR
      new QRCode(qrCode, {
        text: "upi://pay?pa=bhaveshprajapat436@ibl&pn=Quizania&am=5",
        width: 200,
        height: 200,
      });

      let timeLeft = 120;
      qrCode.style.display = 'block';
      downloadBtn.style.display = 'block';
      paymentInstruction.style.display = 'block';

      const interval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerDisplay.textContent = `Complete payment within ${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft === 60) {
          paymentMessage.style.display = 'block';
        }
        if (timeLeft === 115) {
          startBtn.style.display = 'block';
        }
        if (timeLeft < 0) {
          clearInterval(interval);
          timerDisplay.textContent = "";
        }

        timeLeft--;
      }, 1000);

    } else {
      qrCode.style.display = 'none';
      qrCode.innerHTML = "";
      timerDisplay.textContent = "";
      paymentMessage.style.display = 'none';
      startBtn.style.display = 'none';
      downloadBtn.style.display = 'none';
      paymentInstruction.style.display = 'none';
    }
  });

  // Download QR Button Event
  downloadBtn.addEventListener('click', function() {
    const canvas = qrCode.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'payment_qr.png';
      link.click();
    } else {
      alert('QR code not generated yet!');
    }
  });

  // Start Button Event
  startBtn.addEventListener('click', () => {
    const name = document.getElementById('name').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const city = document.getElementById('city').value.trim();
    const termsAccepted = document.getElementById('terms').checked;
    const mobileValid = /^[0-9]{10}$/.test(mobile);

    if (!name || !mobile || !city) {
      alert("Please fill all required fields (Name, Mobile, City).");
      return;
    }
    if (!mobileValid) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }
    if (!termsAccepted) {
      alert("Please accept the Terms & Conditions.");
      return;
    }

    document.getElementById('loader').style.display = 'flex'; // Show loader
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none'; // Hide loader after 1s
      document.getElementById('registerForm').style.display = 'none';
      quizEl.style.display = 'block';
      loadQuestion();
    }, 1000); // 1 second loader effect
  });

  function loadQuestion() {
    if (currentQuestion >= questions.length) return endQuiz();

    updateProgressBar();

    questionBox.style.opacity = 0;
    optionsBox.style.opacity = 0;

    setTimeout(() => {
      const q = questions[currentQuestion];
      questionBox.textContent = `Q${currentQuestion + 1}. ${q.q}`;
      optionsBox.innerHTML = "";

      q.options.forEach((opt, i) => {
        const btn = document.createElement("div");
        btn.className = "option";
        btn.textContent = opt;
        btn.onclick = () => {
          answers.push(i);
          if (i === q.correct) score++;
          clearInterval(quizInterval);
          totalTime += 20 - quizTime;
          currentQuestion++;
          loadQuestion();
        };
        optionsBox.appendChild(btn);
      });

      questionBox.style.opacity = 1;
      optionsBox.style.opacity = 1;

      quizTime = 20;
      timerEl.textContent = `Time left: ${quizTime}s`;

      quizInterval = setInterval(() => {
        quizTime--;
        timerEl.textContent = `Time left: ${quizTime}s`;
        if (quizTime <= 0) {
          clearInterval(quizInterval);
          answers.push(null);
          currentQuestion++;
          totalTime += 20;
          loadQuestion();
        }
      }, 1000);

    }, 300);
  }

  function updateProgressBar() {
    const progress = (currentQuestion / questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
  }

  function endQuiz() {
    quizEl.innerHTML = `
      <h2>🎉 Your quiz has been submitted!</h2>
      <p>📅 Result will be announced on <strong>30th April 2025</strong>.</p>
      <p>Thank you for participating in <b>Quizania</b>!</p>
      <canvas id="confettiCanvas" style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;"></canvas>
    `;

    fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value,
        mobile: document.getElementById('mobile').value,
        city: document.getElementById('city').value,
        referral: document.getElementById('referral').value,
        score,
        avgTime: (totalTime / questions.length).toFixed(2),
        answers
      })
    }).then(res => res.json())
      .then(data => {
        if (!data.success) alert("Failed to submit!");
      });

    setTimeout(startConfetti, 200);
  }

  function startConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  }

}); // End of DOMContentLoaded
