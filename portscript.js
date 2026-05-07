/* ============================================================
   BHAVIKA ASWANI — Digital Growth Specialist
   script.js — Three.js | Scroll Reveal | AI Orb | TTS | Chat
   ============================================================ */

'use strict';

/* ======================================================
   1. CUSTOM CURSOR
   ====================================================== */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

(function animateCursor() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top = followerY + 'px';
  requestAnimationFrame(animateCursor);
})();


/* ======================================================
   2. THREE.JS BACKGROUND
   ====================================================== */
(function initThreeJS() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // ── Particle Field ──
  const particleCount = 2800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const colorA = new THREE.Color(0x00c8ff); // cyber blue
  const colorB = new THREE.Color(0xa855f7); // purple
  const colorC = new THREE.Color(0x06efb8); // cyan accent

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 3 + Math.random() * 12;

    positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const t = Math.random();
    let col;
    if (t < 0.5) col = colorA.clone().lerp(colorB, t * 2);
    else col = colorB.clone().lerp(colorC, (t - 0.5) * 2);

    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
    sizes[i] = Math.random() * 1.4 + 0.2;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Grid Lines (abstract mesh) ──
  const gridGeo = new THREE.BufferGeometry();
  const gridCount = 60;
  const gridPositions = [];

  for (let i = 0; i < gridCount; i++) {
    const x = (i / gridCount - 0.5) * 28;
    gridPositions.push(x, -4, -8, x, -4, 8);
  }
  for (let i = 0; i < gridCount; i++) {
    const z = (i / gridCount - 0.5) * 16 - 8;
    gridPositions.push(-14, -4, z, 14, -4, z);
  }

  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridPositions), 3));
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x0a2540,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const grid = new THREE.LineSegments(gridGeo, gridMat);
  scene.add(grid);

  // ── Floating Energy Orbs ──
  const orbGroup = new THREE.Group();
  scene.add(orbGroup);

  const orbData = [
    { radius: 0.18, pos: [-2.5, 1.2, -1], color: 0x00c8ff },
    { radius: 0.12, pos: [2.8, -0.8, -2], color: 0xa855f7 },
    { radius: 0.22, pos: [0.5, 2.2, -3], color: 0x06efb8 },
    { radius: 0.09, pos: [-1.8, -1.5, -1.5], color: 0x00c8ff },
    { radius: 0.14, pos: [3.2, 1.8, -2.5], color: 0xa855f7 },
  ];

  orbData.forEach(({ radius, pos, color }) => {
    const geo = new THREE.SphereGeometry(radius, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.userData = { originY: pos[1], speed: 0.4 + Math.random() * 0.6, phase: Math.random() * Math.PI * 2 };
    orbGroup.add(mesh);
  });

  // ── Mouse Interaction ──
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;
  const mouseSensitivity = 0.0012;

  document.addEventListener('mousemove', (e) => {
    targetRotY = (e.clientX / window.innerWidth - 0.5) * mouseSensitivity * 60;
    targetRotX = (e.clientY / window.innerHeight - 0.5) * mouseSensitivity * 30;
  });

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animate ──
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.01;

    // Smooth camera parallax
    currentRotX += (targetRotX - currentRotX) * 0.04;
    currentRotY += (targetRotY - currentRotY) * 0.04;
    particles.rotation.y = currentRotY + clock * 0.04;
    particles.rotation.x = currentRotX;

    // Floating orbs
    orbGroup.children.forEach(orb => {
      const { originY, speed, phase } = orb.userData;
      orb.position.y = originY + Math.sin(clock * speed + phase) * 0.25;
      orb.rotation.y += 0.01;
    });

    // Slow grid drift
    grid.position.z = (clock * 0.3) % 1.5 - 0.75;

    renderer.render(scene, camera);
  }
  animate();
})();


/* ======================================================
   3. NAV SCROLL EFFECT
   ====================================================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });


/* ======================================================
   4. SCROLL REVEAL (IntersectionObserver)
   ====================================================== */
const revealEls = document.querySelectorAll(
  '.reveal-up, .reveal-clip, .reveal-left, .reveal-right'
);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));


/* ======================================================
   5. COUNTER ANIMATION (Metrics)
   ====================================================== */
function animateCount(el, target, duration = 1800) {
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const metricObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCount(el, target);
      metricObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.metric-num[data-target]').forEach(el => {
  metricObserver.observe(el);
});


/* ======================================================
   6. AI ORB & CHAT PANEL
   ====================================================== */
const aiOrb = document.getElementById('aiOrb');
const orbWrapper = document.getElementById('orbWrapper');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatSuggestions = document.getElementById('chatSuggestions');
const introMsg = document.getElementById('introMsg');
const tooltipText = document.getElementById('tooltipText');

let chatOpen = false;
let firstInteractionDone = false;
let isSpeaking = false;

// ── Toggle Chat ──
function openChat() {
  chatOpen = true;
  chatPanel.classList.add('open');
}
function closeChat() {
  chatOpen = false;
  chatPanel.classList.remove('open');
}

aiOrb.addEventListener('click', (e) => {
  e.stopPropagation();
  if (chatOpen) closeChat();
  else openChat();
});
chatClose.addEventListener('click', (e) => {
  e.stopPropagation();
  closeChat();
});

// ── First Interaction Trigger (TTS) ──
function triggerFirstInteraction() {
  if (firstInteractionDone) return;
  firstInteractionDone = true;

  // Delay slightly to feel natural
  setTimeout(() => {
    openChat();
    showIntroMessage();
    speakIntro();
  }, 600);
}

document.addEventListener('click', triggerFirstInteraction, { once: true });
document.addEventListener('keydown', triggerFirstInteraction, { once: true });

function showIntroMessage() {
  introMsg.style.display = 'block';
  // Animate in
  introMsg.style.opacity = '0';
  introMsg.style.transform = 'translateY(10px)';
  introMsg.style.transition = 'opacity 0.5s, transform 0.5s';
  setTimeout(() => {
    introMsg.style.opacity = '1';
    introMsg.style.transform = 'translateY(0)';
  }, 100);
}

// ── Web Speech API TTS ──
function speakIntro() {
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(
    "Hi, I am Bhavika Aswani's digital twin. I'm here to help you revolutionize your growth strategy. How can I assist you today?"
  );

  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  // Pick a female voice
  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v =>
      v.name.toLowerCase().includes('female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Victoria') ||
      v.name.includes('Zira') ||
      v.name.includes('Hazel') ||
      (v.lang.startsWith('en') && v.name.toLowerCase().includes('google'))
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice;
  }

  isSpeaking = true;
  utterance.onend = () => { isSpeaking = false; };
}


/* ======================================================
   7. AI CHAT RESPONSES (Claude API powered)
   ====================================================== */
const SYSTEM_PROMPT = `You are Bhavika Aswani's professional AI digital twin and portfolio assistant. Bhavika is a Digital Growth Specialist with 6+ years of experience scaling brands through paid media, SEO, content strategy, growth hacking, and data analytics. 

Respond in a professional, warm, and concise manner. Keep replies under 120 words. You help website visitors understand Bhavika's services, case studies, process, and how to get started. 

Key facts:
- 6+ years in digital marketing
- Scaled 40+ brands 
- Specialties: Paid Media (Meta, Google), SEO, Content, Email, Funnel Design, Analytics
- Average 120% ROAS lift for clients
- Case studies: Fashion brand 3x revenue, SaaS 220% SQL growth, Health brand 0→80K organic monthly visitors
- To get started, visitors should fill the contact form or email hello@bhavikaaswani.com
- Always invite them to book a strategy call or fill the contact form`;

async function getAIResponse(userMessage) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    const data = await response.json();
    const text = data.content?.map(c => c.text || '').join('') || '';
    return text || "I'd love to help! Please fill out the contact form and Bhavika will be in touch within 24 hours.";
  } catch (err) {
    return "Thanks for your message! For immediate assistance, please fill the contact form below or email hello@bhavikaaswani.com 💼";
  }
}

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role === 'ai' ? 'ai-msg' : 'user-msg'}`;
  div.innerHTML = `<p>${text}</p>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing-indicator';
  div.id = 'typingIndicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

async function handleUserMessage(text) {
  if (!text.trim()) return;

  // Hide suggestions after first use
  if (chatSuggestions) chatSuggestions.style.display = 'none';

  addMessage(text, 'user');
  chatInput.value = '';
  showTyping();

  const reply = await getAIResponse(text);
  removeTyping();
  addMessage(reply, 'ai');
}

// Suggestion buttons
document.querySelectorAll('.suggestion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    handleUserMessage(btn.dataset.msg);
  });
});

// Send button & Enter key
chatSend.addEventListener('click', () => handleUserMessage(chatInput.value));
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserMessage(chatInput.value);
});


/* ======================================================
   8. CONTACT FORM
   ====================================================== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const original = btn.innerHTML;
    btn.innerHTML = '<span>Message Sent! ✓</span>';
    btn.style.background = 'linear-gradient(135deg, #06efb8, #00c8ff)';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.disabled = false;
      contactForm.reset();
    }, 3500);
  });
}


/* ======================================================
   9. SMOOTH PARALLAX ON SCROLL
   ====================================================== */
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
}, { passive: true });

(function parallaxLoop() {
  const hero = document.querySelector('.hero-inner');
  if (hero) {
    hero.style.transform = `translateY(${scrollY * 0.25}px)`;
    hero.style.opacity = 1 - (scrollY / 600);
  }
  requestAnimationFrame(parallaxLoop);
})();


/* ======================================================
   10. NAV LINK ACTIVE STATE ON SCROLL
   ====================================================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));


/* ======================================================
   11. GLITCH EFFECT ON HERO NAME (subtle)
   ====================================================== */
const heroName = document.querySelector('.hero-name');
if (heroName) {
  setInterval(() => {
    heroName.style.textShadow = `
      ${(Math.random() - 0.5) * 4}px 0 rgba(0,200,255,0.4),
      ${(Math.random() - 0.5) * 4}px 0 rgba(168,85,247,0.4)
    `;
    setTimeout(() => { heroName.style.textShadow = 'none'; }, 80);
  }, 4000 + Math.random() * 3000);
}