/* ==========================================================================
   THEME ACCENT SELECTOR & INTERACTION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initThemeCustomizer();
    initMobileMenu();
    initTypingEffect();
    initNeuralNetworkCanvas();
    initCardGlowSpotlight();
    initSkillFilters();
    initProjectModals();
    initScrollSpy();
    initContactForm();
});

function initThemeCustomizer() {
    const toggleBtn = document.querySelector('.theme-toggle-btn');
    const optionsPanel = document.querySelector('.theme-options');
    const colorBtns = document.querySelectorAll('.color-btn');

    // Toggle options panel visibility
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        optionsPanel.classList.toggle('open');
    });

    // Close panel on clicking elsewhere
    document.addEventListener('click', () => {
        optionsPanel.classList.remove('open');
    });

    optionsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Switch theme colors
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            
            // Remove other theme classes
            document.body.className = '';
            document.body.classList.add(theme);

            // Set active state
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Optional: Close options after selection
            optionsPanel.classList.remove('open');

            // Force repaint of canvas theme lines (fetched inside the canvas loop)
            updateCanvasThemeColor();
        });
    });
}

/* ==========================================================================
   MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-link');

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        menuBtn.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuBtn.classList.remove('active');
        });
    });
}

/* ==========================================================================
   AUTO-TYPING TERMINAL EFFECT
   ========================================================================== */
function initTypingEffect() {
    const typedTextSpan = document.getElementById("typed-text");
    
    const textArray = [
        "Final-year B.Tech AIML student @ KITS",
        "Building intelligent NLP & CV systems",
        "Fine-tuning LLMs for production solutions",
        "Kaggle enthusiast & open source contributor"
    ];
    
    const typingSpeed = 60;
    const erasingSpeed = 30;
    const newTextDelay = 2000; // Delay between texts
    let textArrayIndex = 0;
    let charIndex = 0;
    
    function type() {
        if (charIndex < textArray[textArrayIndex].length) {
            typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(erase, newTextDelay);
        }
    }
    
    function erase() {
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingSpeed);
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) textArrayIndex = 0;
            setTimeout(type, typingSpeed + 500);
        }
    }
    
    // Start typing
    if (textArray.length) setTimeout(type, 1000);
}

/* ==========================================================================
   NEURAL NETWORK CANVAS BACKGROUND
   ========================================================================== */
let canvasThemeColor = '#00f0ff'; // Fallback

function updateCanvasThemeColor() {
    // Dynamically retrieve accent variable color from computed styles
    const computedAccent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    if (computedAccent) {
        canvasThemeColor = computedAccent;
    }
}

function initNeuralNetworkCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    updateCanvasThemeColor();

    let particles = [];
    const maxParticles = width < 768 ? 40 : 90;
    const connectionDist = 120;
    
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        createParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Mouse repulsion/magnetic field
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    // Move slightly away
                    this.x += (dx / dist) * force * 1.5;
                    this.y += (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = canvasThemeColor;
            ctx.fill();
        }
    }

    function createParticles() {
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(particles[i].x - particles[j].x, 2) +
                    Math.pow(particles[i].y - particles[j].y, 2)
                );
                
                if (dist < connectionDist) {
                    // Normalize alpha based on distance
                    const alpha = (1 - dist / connectionDist) * 0.12;
                    ctx.strokeStyle = hexToRgba(canvasThemeColor, alpha);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            // Connect to mouse
            if (mouse.x !== null && mouse.y !== null) {
                const mouseDist = Math.sqrt(
                    Math.pow(particles[i].x - mouse.x, 2) +
                    Math.pow(particles[i].y - mouse.y, 2)
                );
                if (mouseDist < mouse.radius) {
                    const alpha = (1 - mouseDist / mouse.radius) * 0.18;
                    ctx.strokeStyle = hexToRgba(canvasThemeColor, alpha);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    // Helper utility to convert Hex codes or HSL to RGBA for canvas operations
    function hexToRgba(hex, alpha) {
        if (hex.startsWith('hsl')) {
            // If it is HSL from theme, we can just rewrite it
            return hex.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
        }
        // Assuming hex formats like #00f0ff or #fff
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c = hex.substring(1).split('');
            if(c.length === 3){
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c>>16)&255, (c>>8)&255, c&255].join(',') + ',' + alpha + ')';
        }
        return hex;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

/* ==========================================================================
   GLASS CARD SPOTLIGHT GLOW EFFECT
   ========================================================================== */
function initCardGlowSpotlight() {
    const cards = document.querySelectorAll('.glass');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
}

/* ==========================================================================
   SKILLS FILTERING
   ========================================================================== */
function initSkillFilters() {
    const tabBtns = document.querySelectorAll('.skill-tab-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    // Trigger skills bar animation on page load for all visible skills
    animateSkillBars();

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state of button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            skillCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    // Re-trigger fade in
                    card.style.animation = 'none';
                    card.offsetHeight; /* trigger reflow */
                    card.style.animation = 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
                } else {
                    card.style.display = 'none';
                }
            });

            // Re-trigger skill bar filling animation
            animateSkillBars();
        });
    });

    function animateSkillBars() {
        const fills = document.querySelectorAll('.skill-card:not([style*="display: none"]) .skill-bar-fill');
        fills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = width;
            }, 50);
        });
    }
}

/* ==========================================================================
   PROJECT MODALS (DYNAMIC INJECTION)
   ========================================================================== */
const projectsData = {
    neuroscan: {
        title: "NeuroScan",
        tagline: "Brain Tumor Classifier",
        metric: "98.4% Accuracy",
        metricLabel: "Validation Accuracy",
        duration: "3 Weeks (College Project)",
        github: "https://github.com/musipatlaharicharan?tab=repositories",
        problem: "Manual reading of MRI scans is highly time-consuming, prone to human error, and delays critical patient interventions during emergencies.",
        solution: "Designed a fine-tuned ResNet-50 Convolutional Neural Network inside PyTorch. Applied data augmentation (rotations, scaling, shear) to counter classroom dataset imbalances, followed by custom dense classifier head fine-tuning.",
        result: "Achieved a verified validation accuracy of 98.4% with a low false-negative rate. Built a modular inference code pipeline utilizing ONNX compilation which reduces image evaluation to 80ms on CPU.",
        pipeline: ["MRI Input", "ResNet-50 Feature Map", "Global Average Pooling", "Dense Prediction Classifier", "Output Diagnosis"],
        tech: ["PyTorch", "Python", "ONNX Runtime", "OpenCV", "Scikit-image"]
    },
    kitsbot: {
        title: "KITS-Bot",
        tagline: "Campus RAG Chatbot",
        metric: "120ms Latency",
        metricLabel: "Inference Speed",
        duration: "1 Month (Hackfest Submission)",
        github: "https://github.com/musipatlaharicharan?tab=repositories",
        problem: "Academic rules, syllabus PDFs, and timetable modifications are dispersed across different department files. Students struggle to find answers immediately.",
        solution: "Established a Retrieval-Augmented Generation (RAG) system. Loaded administrative files, split documents using RecursiveCharacterTextSplitter, processed text embeddings via HuggingFace models, and saved arrays inside a FAISS Vector Database.",
        result: "Implemented localized text query parsing that provides verified guidelines within 120ms. Restricts hallucinations by grounding LLM responses directly on embedded university PDFs.",
        pipeline: ["Student Query", "FAISS Similarity Search", "Prompt Augmentation", "Llama-3 Generator", "Answer Output"],
        tech: ["LangChain", "HuggingFace API", "FAISS DB", "Llama-3-8B", "FastAPI"]
    },
    aerodetect: {
        title: "AeroDetect",
        tagline: "Real-time Edge Drone Detection",
        metric: "45 FPS Inference",
        metricLabel: "Edge Device Velocity",
        duration: "2 Months (College Workshop Lab)",
        github: "https://github.com/musipatlaharicharan?tab=repositories",
        problem: "Drone cameras require quick, energy-efficient object locators to perform object tracking without overheating high-payload processors.",
        solution: "Fine-tuned a YOLOv8-nano model on custom aerial photography labels. Optimized performance bottlenecks by quantizing float32 weights into float16 models and compiling using ONNX engines.",
        result: "Achieved robust real-time tracking performance at 45 Frames Per Second on a standard CPU edge workstation, reducing power utilization by 35% compared to baseline YOLO setups.",
        pipeline: ["Camera Video Input", "YOLOv8-Nano Backbone", "Neck Layer Convolutions", "ONNX Runtime Layer", "Coordinate Detection"],
        tech: ["YOLOv8", "ONNX", "OpenCV Engine", "Python", "Raspberry Pi 4"]
    }
};

function initProjectModals() {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('modalCloseBtn');
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const btn = card.querySelector('.open-modal-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card links
            const projectId = card.getAttribute('data-project-id');
            const data = projectsData[projectId];
            
            if (data) {
                injectModalContent(data);
                modal.classList.add('open');
                document.body.style.overflow = 'hidden'; // Lock background scrolling
            }
        });

        // Make the whole card clickable to view modal (if clicked outside GitHub link)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.link-github') && !e.target.closest('.btn')) {
                const projectId = card.getAttribute('data-project-id');
                const data = projectsData[projectId];
                
                if (data) {
                    injectModalContent(data);
                    modal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = ''; // Release scroll lock
    }

    function injectModalContent(data) {
        // Build Pipeline nodes elements dynamically
        let pipelineHTML = '';
        if (data.pipeline && data.pipeline.length) {
            pipelineHTML = `
                <div class="pipeline-visual">
                    <div class="pipeline-nodes">
                        ${data.pipeline.map((step, idx) => `
                            <div class="pipe-node">${step}</div>
                            ${idx < data.pipeline.length - 1 ? '<div class="pipe-arrow"></div>' : ''}
                        `).join('')}
                    </div>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="modal-header-block">
                <h3 class="modal-title">${data.title}</h3>
                <div class="modal-meta-row">
                    <span>${data.tagline}</span>
                    <span>•</span>
                    <span>${data.duration}</span>
                </div>
            </div>

            <div class="modal-details-grid">
                <div class="modal-main-content">
                    <div class="modal-section">
                        <h4>The Problem</h4>
                        <p>${data.problem}</p>
                    </div>

                    <div class="modal-section">
                        <h4>The Solution</h4>
                        <p>${data.solution}</p>
                        ${pipelineHTML}
                    </div>

                    <div class="modal-section">
                        <h4>Results & Impact</h4>
                        <p>${data.result}</p>
                    </div>
                </div>

                <div class="modal-sidebar">
                    <div class="sidebar-box">
                        <h5>Key Metric achieved</h5>
                        <div class="sidebar-metric">${data.metric}</div>
                        <span class="sidebar-subtext">${data.metricLabel}</span>
                    </div>

                    <div class="sidebar-box">
                        <h5>Technologies</h5>
                        <ul class="sidebar-tech-list">
                            ${data.tech.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                    </div>

                    <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm btn-icon-container" style="justify-content: center;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                        View Code on GitHub
                    </a>
                </div>
            </div>
        `;
        
        // After loading the content, configure the spotlights inside modal containers too!
        initCardGlowSpotlight();
    }
}

/* ==========================================================================
   SCROLL SPY (HIGHLIGHT ACTIVE NAV LINKS)
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 200; // offset

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;

            if (scrollPosition >= top && scrollPosition < top + height) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   CONTACT FORM SUBMISSION SIMULATION
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnText = btnSubmit.querySelector('.btn-text');
    const spinner = btnSubmit.querySelector('.btn-spinner');
    const checkmark = btnSubmit.querySelector('.btn-success-check');
    const successFeedback = document.getElementById('formSuccessMessage');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Start loading simulation
        btnSubmit.disabled = true;
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');

        // Simulate API network call
        setTimeout(() => {
            // Success response simulation
            spinner.classList.add('hidden');
            checkmark.classList.remove('hidden');
            btnSubmit.style.background = 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)';

            setTimeout(() => {
                // Clear input elements & show success frame
                form.reset();
                form.classList.add('hidden');
                successFeedback.classList.remove('hidden');
                
                // Reset submit button state for future submission attempts
                setTimeout(() => {
                    form.classList.remove('hidden');
                    successFeedback.classList.add('hidden');
                    btnSubmit.disabled = false;
                    checkmark.classList.add('hidden');
                    btnText.classList.remove('hidden');
                    btnSubmit.style.background = ''; // restore theme default
                }, 3000);

            }, 800);

        }, 1500);
    });
}
