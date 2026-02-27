document.addEventListener("DOMContentLoaded", () => {
            
    /* ================= 1. CONFIGURATION ================= */
    const CONFIG = {
        shopPhone: "84912345678", 
        amazonUrl: "https://www.amazon.com", 
        timerSeconds: 47, 
        reviewTags:[
            "High Quality", "Fast Shipping", "Great Packaging", 
            "Excellent Service", "Worth the money", "Love it!"
        ],
        // Dùng mã Unicode của FontAwesome (\uf521 = Vương miện, \uf5a2 = Huy chương, \uf02b = Tag, \uf06b = Hộp quà)
        prizes:[
            { id: 0, label: "Golden Prize", color: "#FFD700", text: "#900000", icon: "\uf521", highlight: true }, 
            { id: 1, label: "Silver Award", color: "#E0E0E0", text: "#333333", icon: "\uf5a2", highlight: false },
            { id: 2, label: "50% OFF",      color: "#FF6B6B", text: "#FFFFFF", icon: "\uf02b", highlight: false }, 
            { id: 3, label: "20% OFF",      color: "#4ECDC4", text: "#FFFFFF", icon: "\uf02b", highlight: false }, 
            { id: 4, label: "Gift Card",    color: "#FF9F43", text: "#FFFFFF", icon: "\uf06b", highlight: false }  
        ]
    };

    /* ================= 2. DOM SELECTORS ================= */
    const els = {
        wheelCanvas: document.getElementById('wheelCanvas'),
        spinBtn: document.getElementById('spinBtn'),
        wheelSection: document.getElementById('wheelSection'),
        alreadySpunMsg: document.getElementById('alreadySpunMsg'),
        viewRewardBtn: document.getElementById('viewRewardBtn'),
        modal: document.getElementById('resultModal'),
        prizeResult: document.getElementById('prizeResult'),
        progressBar: document.getElementById('progressBar'),
        timerText: document.getElementById('timerText'),
        statusMessage: document.getElementById('statusMessage'),
        reviewInput: document.getElementById('reviewInput'),   
        tagsContainer: document.getElementById('tagsContainer'),
        copyBtn: document.getElementById('copyBtn'),
        smsLink: document.getElementById('smsLink'),
        waLink: document.getElementById('waLink'),
        headerSection: document.getElementById('headerSection')
    };

    /* ================= 3. CANVAS SETUP ================= */
    const ctx = els.wheelCanvas.getContext('2d');
    const centerX = 160;
    const centerY = 160;
    const radius = 160;
    const PI = Math.PI;
    const TAU = 2 * PI;
    const arc = TAU / CONFIG.prizes.length;
    
    let currentRotation = 0;

    /* ================= 4. CORE FUNCTIONS ================= */

    // Render the Wheel on Canvas
    function drawWheel() {
        CONFIG.prizes.forEach((prize, i) => {
            const angle = i * arc - PI / 2;
            
            // 1. Vẽ nền (Background)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, angle, angle + arc);
            
            if (prize.highlight) {
                let gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, radius);
                gradient.addColorStop(0, "#FFF700"); 
                gradient.addColorStop(1, "#FF8C00"); 
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = prize.color;
            }
            
            ctx.fill();
            
            // 2. Vẽ viền (Border)
            ctx.strokeStyle = prize.highlight ? "#FF4500" : "#FFFFFF";
            ctx.lineWidth = prize.highlight ? 4 : 2;
            ctx.stroke();

            // 3. VẼ TEXT & ICON (Tách riêng biệt)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle + arc / 2);
            ctx.textAlign = "right";
            ctx.textBaseline = "middle"; 
            
            if (prize.highlight) {
                ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
                ctx.shadowBlur = 8;
            }

            // --- A. VẼ CHỮ (TEXT) ---
            ctx.font = prize.highlight ? "800 15px 'Poppins', sans-serif" : "600 13px 'Poppins', sans-serif";
            ctx.fillStyle = prize.text;
            ctx.fillText(prize.label, radius - 20, 0);

            // Đo độ dài của chữ vừa vẽ để tính vị trí cho Icon
            const textWidth = ctx.measureText(prize.label).width;

            // --- B. VẼ ICON (FONT AWESOME) ---
            if (prize.highlight) ctx.shadowBlur = 0; // Tắt đổ bóng cho icon để sắc nét hơn
            
            ctx.font = prize.highlight ? "900 15px 'Font Awesome 6 Free'" : "900 13px 'Font Awesome 6 Free'";
            // Vẽ icon lùi về phía trước chữ 8 pixel
            ctx.fillText(prize.icon, radius - 20 - textWidth - 8, 0); 
            
            ctx.restore();
        });
    }

    function renderTags() {
        els.tagsContainer.innerHTML = '';
        CONFIG.reviewTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = "px-3 py-1 text-xs border border-slate-300 rounded-full text-slate-500 hover:bg-orange-100 hover:text-orange-600 hover:border-orange-300 transition-colors select-none";
            btn.innerText = tag;
            
            btn.onclick = () => {
                btn.classList.add('bg-orange-200');
                setTimeout(() => btn.classList.remove('bg-orange-200'), 200);

                let currentText = els.reviewInput.value;
                if (currentText.length > 0 && !currentText.endsWith(' ')) {
                    currentText += ", "; 
                }
                els.reviewInput.value = currentText + tag;
            };
            els.tagsContainer.appendChild(btn);
        });
    }

    function openModal(prizeName, isReplay = false) {
        els.prizeResult.innerText = prizeName;
        
        const msg = `Hello! I won [${prizeName}] and reviewed on Amazon.`;
        const encoded = encodeURIComponent(msg);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        els.smsLink.href = `sms:${CONFIG.shopPhone}${isIOS ? '&' : '?'}body=${encoded}`;
        els.waLink.href = `https://wa.me/${CONFIG.shopPhone.replace(/\D/g, '')}?text=${encoded}`;

        els.modal.classList.remove('hidden');

        if (!isReplay) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            
            els.progressBar.style.transition = `width ${CONFIG.timerSeconds}s linear`;
            setTimeout(() => { els.progressBar.style.width = '100%'; }, 50);

            let timeLeft = CONFIG.timerSeconds;
            els.timerText.innerText = timeLeft + "s";
            
            const timer = setInterval(() => {
                timeLeft--;
                els.timerText.innerText = timeLeft + "s";
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    els.timerText.innerText = "Done";
                    finishProcessing(); 
                }
            }, 1000);
        } else {
            els.progressBar.style.transition = 'none';
            els.progressBar.style.width = '100%';
            els.timerText.innerText = "Done";
            finishProcessing();
        }
    }

    function finishProcessing() {
        els.smsLink.classList.remove('btn-disabled');
        els.waLink.classList.remove('btn-disabled');
        els.smsLink.classList.add('animate-bounce');
        els.waLink.classList.add('animate-bounce');

        els.statusMessage.innerHTML = '<i class="fa-solid fa-check-circle"></i> Your reward code has been created, claim now!';
        els.statusMessage.classList.remove('animate-pulse', 'text-blue-500');
        els.statusMessage.classList.add('fade-in-green');
    }

    /* ================= 5. EVENT LISTENERS ================= */

    els.spinBtn.onclick = async () => {
        els.spinBtn.disabled = true;
        els.spinBtn.innerHTML = "SPINNING...";
        
        try {
            const response = await fetch('/api/spin');
            if (!response.ok) throw new Error("API Error");
            
            const data = await response.json();
            
            const winnerIndex = data.winnerIndex;
            const prizeName = data.prizeName;
            
            const segmentAngle = 360 / CONFIG.prizes.length;
            const randomOffset = (Math.random() * segmentAngle * 0.8) - (segmentAngle * 0.4);
            const winningAnglePosition = winnerIndex * segmentAngle;
            const targetRotation = (360 * 5) + (360 - winningAnglePosition) + randomOffset;
            
            const currentMod = currentRotation % 360;
            currentRotation = currentRotation - currentMod + targetRotation;

            els.wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                localStorage.setItem('luckyWheel_hasSpun', 'true');
                localStorage.setItem('luckyWheel_prize', prizeName);
                openModal(prizeName, false);
            }, 4000);

        } catch (error) {
            console.error("Spin error:", error);
            alert("Connection error with server, please try again!");
            els.spinBtn.disabled = false;
            els.spinBtn.innerHTML = "SPIN NOW";
        }
    };

    els.copyBtn.onclick = () => {
        const text = els.reviewInput.value;
        
        if (!text.trim()) {
            alert("Please write a review or click tags first!");
            els.reviewInput.focus();
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            const oldHTML = els.copyBtn.innerHTML;
            els.copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            els.copyBtn.classList.add('bg-green-500');
            setTimeout(() => {
                els.copyBtn.innerHTML = oldHTML;
                els.copyBtn.classList.remove('bg-green-500');
            }, 2000);
            window.open(CONFIG.amazonUrl, '_blank');
        });
    };
    
    els.viewRewardBtn.onclick = () => {
        const storedPrize = localStorage.getItem('luckyWheel_prize') || "Unknown Prize";
        openModal(storedPrize, true);
    };

    /* ================= 6. INITIALIZATION ================= */
    const hasSpun = localStorage.getItem('luckyWheel_hasSpun');
    
    renderTags(); 
    
    if (hasSpun === 'true') {
        els.wheelSection.classList.add('hidden');
        els.headerSection.classList.add('hidden');
        els.alreadySpunMsg.classList.remove('hidden');
    } else {
        // Ép trình duyệt phải tải bộ font xong hoàn toàn rồi mới vẽ
        Promise.all([
            document.fonts.load('600 13px "Poppins"'),
            document.fonts.load('900 13px "Font Awesome 6 Free"')
        ]).then(() => {
            setTimeout(() => {
                drawWheel();
                els.wheelSection.classList.remove('hidden', 'opacity-0');
            }, 50); // Khởi tạo độ trễ 50ms để chắc chắn tải xong
        }).catch(() => {
            // Đề phòng máy người dùng chặn tải font, vẫn tự vẽ sau 500ms
            setTimeout(() => {
                drawWheel();
                els.wheelSection.classList.remove('hidden', 'opacity-0');
            }, 500);
        });
    }
});

/* ================= 7. GLOBAL UTILITIES ================= */
function resetApp() {
    if(confirm("Reset the app logic? (This will clear local storage)")) {
        localStorage.removeItem('luckyWheel_hasSpun');
        localStorage.removeItem('luckyWheel_prize');
        location.reload();
    }
}