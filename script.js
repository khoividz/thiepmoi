document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const introOverlay = document.getElementById('introOverlay');
    const typingText = document.getElementById('typingText');
    const mainContent = document.getElementById('mainContent');
    const invitationCard = document.getElementById('invitationCard');
    const openButton = document.getElementById('openButton');
    const invitationDetails = document.getElementById('invitationDetails');
    const messageBlocks = document.querySelectorAll('.message-block');
    const footerNote = document.querySelector('.footer-note');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const particlesContainer = document.getElementById('particlesContainer');
    const cupcakeWrapper = document.getElementById('cupcakeImage');

    const ctx = confettiCanvas.getContext('2d');
    let confettiAnimationId = null;
    let confettiParticles = [];
    let isConfettiActive = false;
    let typingInterval;
    let resizeTimer;

    // --- Configuration ---
    const TYPING_TEXT = 'From: Huy Hoàng';
    const TYPING_SPEED = 130;

    // --- Initialize Canvas Size ---
    function resizeCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            resizeCanvas();
        }, 250);
    });
    resizeCanvas();

    // --- Typing Effect ---
    function startTypingEffect() {
        return new Promise((resolve) => {
            let charIndex = 0;
            typingText.textContent = '';
            
            typingInterval = setInterval(() => {
                if (charIndex < TYPING_TEXT.length) {
                    typingText.textContent += TYPING_TEXT.charAt(charIndex);
                    charIndex++;
                } else {
                    clearInterval(typingInterval);
                    setTimeout(resolve, 1500); // Wait 1.5s after typing
                }
            }, TYPING_SPEED);
        });
    }

    // --- Transition to Main Card ---
    async function transitionToMain() {
        // Fade out intro
        introOverlay.classList.add('fade-out');
        
        // After intro starts fading, reveal main content with zoom+blur transition
        setTimeout(() => {
            mainContent.classList.add('revealed');
        }, 200);
        
        // Remove intro from DOM after transition
        setTimeout(() => {
            introOverlay.classList.remove('active');
            if (typingInterval) clearInterval(typingInterval);
        }, 1200);
    }

    // --- Create Floating Background Particles ---
    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 8 + 3;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 6 + 8;
        const delay = Math.random() * 4;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${startX}px`;
        particle.style.bottom = `-20px`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation ends
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, (duration + delay) * 1000 + 500);
    }

    function generateAmbientParticles() {
        setInterval(createParticle, 800);
        // Initial batch
        for (let i = 0; i < 5; i++) {
            setTimeout(createParticle, i * 300);
        }
    }

    // --- Confetti System ---
    class ConfettiParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.speedX = (Math.random() - 0.5) * 12;
            this.speedY = Math.random() * -12 - 4;
            this.gravity = 0.5;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 12;
            this.opacity = 1;
            this.decay = Math.random() * 0.02 + 0.008;
            this.color = `hsla(${Math.random() * 60 + 330}, 80%, 70%, ${this.opacity})`; // Pink palette
            this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
        }

        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            
            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            }
            
            ctx.restore();
        }
    }

    function spawnConfettiBurst(x, y, count = 80) {
        for (let i = 0; i < count; i++) {
            confettiParticles.push(new ConfettiParticle(x, y));
        }
    }

    function animateConfetti() {
        if (!isConfettiActive) return;
        
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        confettiParticles = confettiParticles.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 50);
        
        confettiParticles.forEach(p => {
            p.update();
            p.draw(ctx);
        });
        
        if (confettiParticles.length > 0) {
            confettiAnimationId = requestAnimationFrame(animateConfetti);
        } else {
            stopConfetti();
        }
    }

    function startConfetti() {
        stopConfetti(); // Clear previous
        confettiParticles = [];
        isConfettiActive = true;
        
        // Burst from multiple positions
        const centerX = confettiCanvas.width / 2;
        const centerY = confettiCanvas.height / 2;
        
        spawnConfettiBurst(centerX - 100, centerY - 80, 70);
        spawnConfettiBurst(centerX + 120, centerY - 50, 70);
        spawnConfettiBurst(centerX, centerY - 120, 60);
        
        // Additional bursts from sides
        setTimeout(() => spawnConfettiBurst(centerX - 200, centerY, 40), 150);
        setTimeout(() => spawnConfettiBurst(centerX + 200, centerY, 40), 250);
        
        confettiAnimationId = requestAnimationFrame(animateConfetti);
        
        // Auto stop after 4 seconds if still running
        setTimeout(() => {
            if (isConfettiActive && confettiParticles.length === 0) stopConfetti();
        }, 5000);
    }

    function stopConfetti() {
        isConfettiActive = false;
        if (confettiAnimationId) {
            cancelAnimationFrame(confettiAnimationId);
            confettiAnimationId = null;
        }
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles = [];
    }

    // --- Reveal Content Sequentially ---
    function revealContent() {
        invitationDetails.classList.add('visible');
        
        // Stagger animation for each block
        const blocks = [...messageBlocks, footerNote];
        blocks.forEach((block, index) => {
            setTimeout(() => {
                block.classList.add('visible-block');
            }, 150 * (index + 1));
        });
    }

    // --- Mouse Parallax for Cupcake ---
    function handleParallax(e) {
        if (!cupcakeWrapper || window.innerWidth < 768) return;
        
        const rect = cupcakeWrapper.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateY = (mouseX / (window.innerWidth / 2)) * 8;
        const rotateX = (mouseY / (window.innerHeight / 2)) * -6;
        
        cupcakeWrapper.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    }

    function resetParallax() {
        if (cupcakeWrapper) {
            cupcakeWrapper.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translateY(0)';
        }
    }

    // --- Event Listeners ---
    openButton.addEventListener('click', (e) => {
        // Prevent multiple clicks
        if (invitationDetails.classList.contains('visible')) {
            // Still trigger confetti burst on additional clicks, but smaller
            const rect = openButton.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            spawnConfettiBurst(x, y, 30);
            if (!isConfettiActive) {
                isConfettiActive = true;
                confettiAnimationId = requestAnimationFrame(animateConfetti);
            }
            return;
        }
        
        // First click: reveal content + confetti
        revealContent();
        
        const rect = openButton.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        startConfetti();
        
        // Button subtle animation feedback
        openButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            openButton.style.transform = '';
        }, 200);
        
        // Change button text after reveal
        setTimeout(() => {
            openButton.querySelector('.button-text').textContent = '🎉 Quẩy thôi!';
        }, 600);
    });

    // Parallax listeners
    document.addEventListener('mousemove', handleParallax);
    document.addEventListener('mouseleave', resetParallax);

    // Touch devices: disable parallax but keep floating animation
    window.addEventListener('touchstart', () => {
        resetParallax();
    }, { passive: true });

    // --- Start Sequence ---
    async function initSequence() {
        generateAmbientParticles();
        await startTypingEffect();
        transitionToMain();
    }

    initSequence();

    // --- Clean up on page unload ---
    window.addEventListener('beforeunload', () => {
        stopConfetti();
        if (typingInterval) clearInterval(typingInterval);
        particlesContainer.innerHTML = '';
    });
});