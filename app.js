// 01Academy AI Kids - Pure Interactive Gaze Tracking & Form Handling

function selectCourse(courseName) {
  const courseSelect = document.getElementById('course');
  if (courseSelect) {
    courseSelect.value = courseName;
    courseSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ==========================================
// Alligator Gaze Tracker
// ==========================================
class AlligatorTracker {
  constructor() {
    this.canvas = document.getElementById('alligator-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.totalFrames = 72;
    this.frames = [];
    this.centerFrame = null;
    this.loadedCount = 0;
    this.isLoaded = false;
    this.currentAngle = 0;
    this.targetAngle = 0;
    this.targetIsCenter = false;

    this.preloadFrames();
    this.bindEvents();
    this.animate();
  }

  preloadFrames() {
    // Center frame
    this.centerFrame = new Image();
    this.centerFrame.src = 'assets/gaze_frames/gaze_center.png';
    this.centerFrame.onload = () => {
      this.loadedCount++;
      if (this.loadedCount >= this.totalFrames + 1) {
        this.onReady();
      }
    };

    // 72 circular frames
    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      const padIndex = String(i).padStart(2, '0');
      img.src = `assets/gaze_frames/gaze_${padIndex}.png`;
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount >= this.totalFrames + 1) {
          this.onReady();
        }
      };
      this.frames.push(img);
    }
  }

  onReady() {
    this.isLoaded = true;
    this.drawCenter();
  }

  drawFrame(index) {
    if (!this.isLoaded || !this.ctx) return;
    const frame = this.frames[index];
    if (frame && frame.complete) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawCenter() {
    if (!this.isLoaded || !this.ctx) return;
    if (this.centerFrame && this.centerFrame.complete) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.centerFrame, 0, 0, this.canvas.width, this.canvas.height);
    }
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.handlePointer(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        this.handlePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      this.targetIsCenter = true;
    });
  }

  handlePointer(clientX, clientY) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    
    // Eyes center point
    const eyeX = rect.left + rect.width * 0.5;
    const eyeY = rect.top + rect.height * 0.38;

    const dx = clientX - eyeX;
    const dy = clientY - eyeY;
    const dist = Math.hypot(dx, dy);

    if (dist < 40) {
      this.targetIsCenter = true;
      return;
    }

    this.targetIsCenter = false;
    this.targetAngle = Math.atan2(dy, dx);
  }

  animate() {
    if (this.isLoaded) {
      if (this.targetIsCenter) {
        this.drawCenter();
      } else {
        let diff = this.targetAngle - this.currentAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        this.currentAngle += diff * 0.35;

        while (this.currentAngle < -Math.PI) this.currentAngle += Math.PI * 2;
        while (this.currentAngle > Math.PI) this.currentAngle -= Math.PI * 2;

        const normalized = (this.currentAngle + Math.PI) / (Math.PI * 2);
        let frameIdx = Math.round(normalized * this.totalFrames) % this.totalFrames;
        if (frameIdx < 0) frameIdx += this.totalFrames;

        this.drawFrame(frameIdx);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ==========================================
// Waving Character Scroll Tracker (Section 2)
// ==========================================
class WaveCharacterTracker {
  constructor() {
    this.canvas = document.getElementById('wave-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.section = document.getElementById('about');
    this.totalFrames = 120;
    this.frames = [];
    this.loadedCount = 0;
    this.isLoaded = false;
    this.currentFrame = 0;
    this.targetFrame = 0;
    this.lastDrawnIndex = -1;

    this.preloadFrames();
    this.bindEvents();
    this.animate();
  }

  preloadFrames() {
    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      const padIndex = String(i).padStart(3, '0');
      img.src = `assets/wave_frames/wave_${padIndex}.png`;
      img.onload = () => {
        this.loadedCount++;
        if (this.loadedCount >= this.totalFrames) {
          this.isLoaded = true;
          this.drawFrame(0);
        }
      };
      this.frames.push(img);
    }
  }

  bindEvents() {
    const onScroll = () => {
      if (!this.section) return;
      const rect = this.section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start when the top of the section enters the bottom of the window
      // End when the bottom of the section leaves the top of the window
      const totalDistance = windowHeight + rect.height;
      const currentDistance = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(1, currentDistance / totalDistance));

      this.targetFrame = progress * (this.totalFrames - 1);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  animate() {
    if (this.isLoaded) {
      this.currentFrame += (this.targetFrame - this.currentFrame) * 0.15;
      const frameIdx = Math.round(this.currentFrame);
      if (frameIdx !== this.lastDrawnIndex && frameIdx >= 0 && frameIdx < this.totalFrames) {
        this.drawFrame(frameIdx);
        this.lastDrawnIndex = frameIdx;
      }
    }
    requestAnimationFrame(() => this.animate());
  }

  drawFrame(index) {
    if (!this.ctx || !this.canvas) return;
    const frame = this.frames[index];
    if (frame && frame.complete) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(frame, 0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================
// Text Rotator & Scroll Animations
// ==========================================
function initTextRotator() {
  const rotatorEl = document.getElementById('hero-rotating-word');
  if (!rotatorEl) return;

  const phrases = [
    '🎨 Сказки и комиксы',
    '🎬 Видео и сценарии',
    '📊 Школьные презентации',
    '🤖 Промптинг и логика',
    '👾 Создание персонажей'
  ];

  let currentIndex = 0;

  setInterval(() => {
    rotatorEl.classList.add('sliding-out');

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % phrases.length;
      rotatorEl.textContent = phrases[currentIndex];
      rotatorEl.classList.remove('sliding-out');
      rotatorEl.classList.add('sliding-in');

      // Force reflow
      void rotatorEl.offsetWidth;

      rotatorEl.classList.remove('sliding-in');
    }, 320);
  }, 2800);
}

function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }, { passive: true });
}

function initScrollDirectionTracker() {
  // Handled inside initScrollAnimations for zero-latency synchronization
}

function initScrollAnimations() {
  const scrollTargets = document.querySelectorAll(
    '.reveal-fade, .scroll-highlight, .scroll-reveal-text, .scroll-feature-item, .scroll-stat-badge, .scroll-faq-card, .underline-animated, .scroll-block-reveal, .scroll-button, .scroll-form-field, .scroll-trust-card'
  );

  if (!scrollTargets.length) return;

  let lastScrollY = window.scrollY || document.documentElement.scrollTop;
  let isScrollingUp = false;

  function updateVisibility() {
    const windowH = window.innerHeight;

    // Disappear earlier on reverse scroll (upward scroll):
    // Standard entrance triggers ~80px from bottom.
    // Reverse exit triggers 270-300px before bottom edge, so elements
    // start their reverse cascade (4 -> 3 -> 2 -> 1) clearly in the user's field of view!
    const exitOffset = Math.round(Math.min(320, Math.max(220, windowH * 0.30)));
    const bottomExitThreshold = windowH - exitOffset;
    const currentScroll = window.scrollY || document.documentElement.scrollTop;
    const isAtBottom = (windowH + currentScroll) >= (document.documentElement.scrollHeight - 60);
    const bottomEnterThreshold = isAtBottom ? windowH : (windowH - 40);

    scrollTargets.forEach((el) => {
      const rect = el.getBoundingClientRect();

      // Check if element is active in viewport:
      // When scrolling up, it must be above the earlier exit threshold.
      // When scrolling down, it enters once above entrance threshold.
      const inViewport = isScrollingUp
        ? (rect.top < bottomExitThreshold && rect.bottom > -100)
        : (rect.top < bottomEnterThreshold && rect.bottom > -100);

      if (inViewport) {
        el.classList.add('is-visible', 'is-in-view');
      } else {
        el.classList.remove('is-visible', 'is-in-view');
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    const diff = currentScrollY - lastScrollY;

    if (Math.abs(diff) > 2) {
      if (diff > 0) {
        isScrollingUp = false;
        document.body.classList.add('scrolling-down');
        document.body.classList.remove('scrolling-up');
      } else {
        isScrollingUp = true;
        document.body.classList.add('scrolling-up');
        document.body.classList.remove('scrolling-down');
      }
      lastScrollY = currentScrollY;
    }

    if (!ticking) {
      requestAnimationFrame(() => {
        updateVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateVisibility, { passive: true });

  // Initial pass to immediately reveal elements above the fold
  updateVisibility();
}

function initActiveNavSpy() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('header nav a.nav-link');
  if (!sections.length || !navLinks.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ==========================================
// App Initializer
// ==========================================
function initApp() {
  new AlligatorTracker();
  new WaveCharacterTracker();
  initTextRotator();
  initScrollProgressBar();
  initScrollAnimations();
  initActiveNavSpy();

  const form = document.getElementById('lead-form');
  const formMsg = document.getElementById('form-msg');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (formMsg) {
        formMsg.classList.remove('hidden');
      }
      form.reset();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.addEventListener('load', () => {
  window.dispatchEvent(new Event('scroll'));
});
