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
// Dynamic Inverted Header Theme Controller
// (Dark over light screens, White over dark screens)
// ==========================================
function initHeaderThemeController() {
  const header = document.getElementById('main-header');
  const themedElements = document.querySelectorAll('[data-theme]');
  if (!header || !themedElements.length) return;

  const updateHeaderTheme = () => {
    const headerRect = header.getBoundingClientRect();
    // Probe point at vertical center of the sticky header
    const probeY = headerRect.top + headerRect.height * 0.5;

    let currentTheme = 'light';

    themedElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= probeY && rect.bottom > probeY) {
        currentTheme = el.dataset.theme || 'light';
      }
    });

    // Rule:
    // When touching white/light screen -> header has dark color of children's works screen (slate-950)
    // When touching dark screen -> header changes back to white
    if (currentTheme === 'light') {
      if (!header.classList.contains('header-theme-dark')) {
        header.classList.remove('header-theme-white');
        header.classList.add('header-theme-dark');
      }
    } else {
      if (!header.classList.contains('header-theme-white')) {
        header.classList.remove('header-theme-dark');
        header.classList.add('header-theme-white');
      }
    }
  };

  window.addEventListener('scroll', updateHeaderTheme, { passive: true });
  window.addEventListener('resize', updateHeaderTheme, { passive: true });
  updateHeaderTheme();

  header.addEventListener('mousemove', (e) => {
    const rect = header.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    header.style.setProperty('--header-mouse-x', `${x.toFixed(1)}%`);
    header.style.setProperty('--header-mouse-y', `${y.toFixed(1)}%`);
  }, { passive: true });
}

// ==========================================
// Tilted Parallel Opposite Collage Scroll Animation & Edge Fading
// ==========================================
function initCollageParallax() {
  const section = document.getElementById('works');
  if (!section) return;

  const viewport = section.querySelector('.collage-viewport');
  if (!viewport) return;

  const col1 = viewport.querySelector('.collage-col-1');
  const col2 = viewport.querySelector('.collage-col-2');
  const col3 = viewport.querySelector('.collage-col-3');
  if (!col1 || !col2) return;

  const cards = viewport.querySelectorAll('.collage-card');

  let offset1 = 0;
  let offset2 = 0;
  let offset3 = 0;

  let loopHeight1 = 0;
  let loopHeight2 = 0;
  let loopHeight3 = 0;

  function measureHeights() {
    const getHalfHeight = (col) => {
      if (!col) return 0;
      const children = Array.from(col.children);
      const half = Math.floor(children.length / 2);
      if (half === 0) return col.scrollHeight / 2;
      let h = 0;
      for (let i = 0; i < half; i++) {
        h += children[i].offsetHeight;
      }
      const gap = window.innerWidth >= 640 ? 24 : 16;
      h += (half - 1) * gap;
      return h > 0 ? h : col.scrollHeight / 2;
    };

    loopHeight1 = getHalfHeight(col1);
    loopHeight2 = getHalfHeight(col2);
    loopHeight3 = getHalfHeight(col3);
  }

  measureHeights();
  window.addEventListener('resize', measureHeights, { passive: true });

  // Scroll tracking with velocity and inertia
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let isHovered = false;

  viewport.addEventListener('mouseenter', () => { isHovered = true; });
  viewport.addEventListener('mouseleave', () => { isHovered = false; });

  const onScroll = () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    scrollVelocity += Math.max(-45, Math.min(45, delta * 0.85));
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // IntersectionObserver: only run loop when section is in view
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { rootMargin: '200px 0px' });
    observer.observe(section);
  }

  function loop() {
    if (isVisible) {
      if (!loopHeight1 || loopHeight1 < 100) {
        measureHeights();
      }

      const baseSpeed = isHovered ? 0.2 : 0.75;
      scrollVelocity *= 0.90;

      // Column 1 moves UP
      const speed1 = baseSpeed + scrollVelocity;
      if (loopHeight1 > 0) {
        offset1 = (offset1 + speed1) % loopHeight1;
        if (offset1 < 0) offset1 += loopHeight1;
        col1.style.transform = `translate3d(0, ${-offset1}px, 0)`;
      }

      // Column 2 moves DOWN (opposite!)
      const speed2 = baseSpeed + scrollVelocity;
      if (loopHeight2 > 0) {
        offset2 = (offset2 + speed2) % loopHeight2;
        if (offset2 < 0) offset2 += loopHeight2;
        col2.style.transform = `translate3d(0, ${offset2 - loopHeight2}px, 0)`;
      }

      // Column 3 moves UP (sync with Column 1)
      const speed3 = (baseSpeed * 0.9) + scrollVelocity;
      if (col3 && loopHeight3 > 0) {
        offset3 = (offset3 + speed3) % loopHeight3;
        if (offset3 < 0) offset3 += loopHeight3;
        col3.style.transform = `translate3d(0, ${-offset3}px, 0)`;
      }
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

function initCollageVideos() {
  const videos = document.querySelectorAll('.collage-card video');
  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const resume = () => {
          video.play();
          window.removeEventListener('scroll', resume);
          window.removeEventListener('touchstart', resume);
          window.removeEventListener('click', resume);
        };
        window.addEventListener('scroll', resume, { once: true, passive: true });
        window.addEventListener('touchstart', resume, { once: true, passive: true });
        window.addEventListener('click', resume, { once: true });
      });
    }
  });
}

// ==========================================
// 3D Liquid Crystal Interactive Wave Surface (WebGL)
// ==========================================
// monopo.vn 3D WebGL Background & Optical Refraction Lens
// Extracted and replicated from monopo.vn production build
// ==========================================
class LiquidCrystal3D {
  constructor() {
    this.canvas = document.getElementById('liquid-canvas');
    this.section = document.getElementById('apply');
    if (!this.canvas || !this.section) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js is required for LiquidCrystal3D');
      return;
    }

    this.mouse = { x: 0, y: 0 };
    this.mouseVec = new THREE.Vector2(0, 0);
    this.cameraPosition = new THREE.Vector2(0, 0);
    this.direction = new THREE.Vector2(0, 0);
    this.cameraEasing = { x: 0.6, y: 0.3 };
    this.hasUserInteracted = false;
    this.isVisible = false;

    this.initScene();
    this.initBackground();
    this.initLens();
    this.initComposer();
    this.bindEvents();
    this.resize();
    this.loop();
  }

  initScene() {
    const rect = this.section.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20);
    this.camera.position.set(0, 0, -4);
    this.camera.lookAt(this.scene.position);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      precision: 'highp',
      powerPreference: 'high-performance',
      alpha: true,
      antialias: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setClearColor(0x020617, 1);
    this.renderer.setSize(width, height);

    this.clock = new THREE.Clock();
    this.clock.start();
  }

  initBackground() {
    const camera = this.camera;
    const t = camera.fov * Math.PI / 180;
    this.fovY = Math.abs(camera.position.z * Math.tan(t / 2) * 2);

    const isMobile = window.innerWidth < 1024;
    this.bgSpeed = 30; // monopo.vn revealed speed

    this.bgUniforms = {
      uTime: { value: 0 },
      uBaseFirstColor: { type: 'vec3', value: new THREE.Color(120 / 255, 158 / 255, 113 / 255) }, // sage olive [120, 158, 113]
      uBaseSecondColor: { type: 'vec3', value: new THREE.Color(224 / 255, 148 / 255, 66 / 255) }, // warm amber [224, 148, 66]
      uAccentColor: { type: 'vec3', value: new THREE.Color(0, 0, 0) }, // deep black [0, 0, 0]
      uZoom: { type: '1f', value: isMobile ? 0.1 : 0.2 },
      uBaseFrequency: { type: '1f', value: 2.6 },
      uAccentOpacity: { type: 'float', value: 1.0 },
      uAccentFrequency: { type: '1f', value: 2.2 },
      uNoiseIntensity: { type: '1f', value: 0.0 },
      uOpacityBackground: { type: '1f', value: 0.95 },
      uBgProgress: { type: '1f', value: 1.0 },
      u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    };

    const vertexShader = `
      varying vec3 vUv;
      void main() {
        vUv = position;
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vUv;

      uniform vec3 uBaseFirstColor;
      uniform vec3 uBaseSecondColor;
      uniform vec3 uAccentColor;
      uniform float uBgProgress;
      uniform float uAccentOpacity;
      uniform float uBaseFrequency;
      uniform float uAccentFrequency;
      uniform float uNoiseIntensity;
      uniform float uOpacityBackground;
      uniform float uTime;
      uniform float uZoom;
      uniform vec2 u_res;

      vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
      vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec3 fade(vec3 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

      float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 perm(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float noise(vec3 p) {
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);

        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);

        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);

        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));

        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

        return o4.y * d.y + o4.x * (1.0 - d.y);
      }

      float snoise3(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + 1.0 * C.xxx;
        vec3 x2 = x0 - i2 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        float n_ = 1.0 / 7.0;
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }

      mat2 rotate2d(float angle) {
        return mat2(cos(angle), -sin(angle),
                    sin(angle),  cos(angle));
      }

      float lines(in vec2 pos, float b) {
        float scale = 10.0;
        pos *= scale;
        return smoothstep(0.0, 0.5 + b * 0.5, abs((sin(pos.x * 3.1415) + b * 2.0)) * 0.5);
      }

      float circle(in vec2 _st, in float _radius, in float blurriness) {
        vec2 dist = _st;
        return 1.0 - smoothstep(_radius - (_radius * blurriness), _radius + (_radius * blurriness), dot(dist, dist) * 4.0);
      }

      float dist(vec2 p0, vec2 pf) {
        return sqrt((pf.x - p0.x) * (pf.x - p0.x) + (pf.y - p0.y) * (pf.y - p0.y));
      }

      void main() {
        vec2 resolution = u_res * PR;
        vec3 uv = vUv.xyz;
        float progress = uBgProgress;

        float baseNoise = noise(uBaseFrequency * uv + uTime);
        vec2 basePos = rotate2d(baseNoise) * uv.xy * uZoom;
        float basePattern = lines(basePos, 0.5);

        vec2 st = gl_FragCoord.xy / resolution.xy - vec2(0.5);
        st.y *= resolution.y / resolution.x;
        float c = circle(st, 0.2 + progress * 10.0, 2.0);
        float offX = uv.x + sin(uv.y + uTime * 2.0);
        float offY = uv.y - uTime * 0.2 - cos(uTime * 2.0) * 0.1;

        float nc = (snoise3(vec3(offX, offY, uTime * 5.0) * 2.0)) * 0.03;
        float d = dist(resolution.xy * 0.5, gl_FragCoord.xy) * (1.0 - progress) * 0.003;

        vec2 accentPos = rotate2d(baseNoise) * uv.xy * uZoom;
        float accentPattern = lines(accentPos, 0.1);

        vec3 baseMix = mix(uBaseFirstColor, uBaseSecondColor, basePattern);
        vec3 accentMix = mix(baseMix, uAccentColor, accentPattern - (1.0 - uAccentOpacity));

        float finalMask = smoothstep(1.0, 1.0, pow(c, 6.0) * 10.0 + nc * (1.0 - progress));
        vec4 finalImage = mix(vec4(finalMask), vec4(accentMix, 1.0), clamp((finalMask + progress), 0.0, 1.0)) * (1.0 - d);

        gl_FragColor = vec4(vec3(finalImage), uOpacityBackground);
      }
    `;

    this.bgMaterial = new THREE.ShaderMaterial({
      uniforms: this.bgUniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      defines: {
        PI: Math.PI,
        PR: (Math.min(window.devicePixelRatio || 1, 2)).toFixed(1)
      }
    });

    this.bgGeometry = new THREE.PlaneGeometry(1, 32, 32);
    this.bgMesh = new THREE.Mesh(this.bgGeometry, this.bgMaterial);
    this.bgMesh.scale.y = this.fovY;
    this.bgMesh.scale.z = this.fovY;
    this.bgMesh.scale.x = this.fovY * this.camera.aspect;
    this.bgMesh.lookAt(this.camera.position);
    this.scene.add(this.bgMesh);
  }

  initLens() {
    this.cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
      format: THREE.RGBFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter,
      encoding: THREE.sRGBEncoding
    });
    this.refractSphereCamera = new THREE.CubeCamera(0.1, 10, this.cubeRenderTarget);

    this.lensUniforms = {
      mRefractionRatio: { type: 'f', value: 0.016 },
      mFresnelBias: { type: 'f', value: 0.016 },
      mFresnelPower: { type: 'f', value: 4.206 },
      mFresnelScale: { type: 'f', value: 2.442 },
      uSphereAlpha: { type: 'f', value: 1.0 },
      uRefractionPower: { type: 'f', value: 0.75 },
      tCube: { type: 't', value: this.cubeRenderTarget.texture }
    };

    const lensVertexShader = `
      uniform float mRefractionRatio;
      uniform float mFresnelBias;
      uniform float mFresnelScale;
      uniform float mFresnelPower;

      varying vec3 vReflect;
      varying vec3 vRefract[3];
      varying float vReflectionFactor;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);

        vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);

        vec3 I = worldPosition.xyz - cameraPosition;

        vReflect = reflect(I, worldNormal);
        vRefract[0] = refract(normalize(I), worldNormal, mRefractionRatio);
        vRefract[1] = refract(normalize(I), worldNormal, mRefractionRatio * 0.99);
        vRefract[2] = refract(normalize(I), worldNormal, mRefractionRatio * 0.98);
        vReflectionFactor = mFresnelBias + mFresnelScale * pow(1.0 + dot(normalize(I), worldNormal), mFresnelPower);

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const lensFragmentShader = `
      uniform samplerCube tCube;
      uniform float uSphereAlpha;
      uniform float uRefractionPower;

      varying vec3 vReflect;
      varying vec3 vRefract[3];
      varying float vReflectionFactor;

      void main() {
        vec4 reflectedColor = textureCube(tCube, vec3(-vReflect.x, vReflect.yz));
        vec4 refractedColor = vec4(1.0);

        refractedColor.r = textureCube(tCube, vec3(-vRefract[0].x, vRefract[0].yz)).r;
        refractedColor.g = textureCube(tCube, vec3(-vRefract[1].x, vRefract[1].yz)).g;
        refractedColor.b = textureCube(tCube, vec3(-vRefract[2].x, vRefract[2].yz)).b;
        refractedColor.a = uRefractionPower;

        gl_FragColor = mix(vec4(vec3(refractedColor.rgb), refractedColor.a), reflectedColor * uSphereAlpha, clamp(vReflectionFactor, 0.0, 1.0));
      }
    `;

    this.lensMaterial = new THREE.ShaderMaterial({
      uniforms: this.lensUniforms,
      vertexShader: lensVertexShader,
      fragmentShader: lensFragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.sphereGeometry = new THREE.SphereGeometry(0.4, 64, 64);
    this.sphere = new THREE.Mesh(this.sphereGeometry, this.lensMaterial);
    this.sphere.scale.set(3.5, 3.5, 3.5);
    this.sphere.position.set(-1.0, 0.75, -1.5);
    this.scene.add(this.sphere);
    this.refractSphereCamera.position.copy(this.sphere.position);
  }

  initComposer() {
    if (typeof THREE.EffectComposer !== 'undefined' && typeof THREE.RenderPass !== 'undefined' && typeof THREE.ShaderPass !== 'undefined') {
      this.composer = new THREE.EffectComposer(this.renderer);
      this.renderPass = new THREE.RenderPass(this.scene, this.camera);
      this.composer.addPass(this.renderPass);

      const grainShader = {
        uniforms: {
          tDiffuse: { value: null },
          amount: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float amount;
          uniform sampler2D tDiffuse;
          varying vec2 vUv;

          float random(vec2 p) {
            vec2 K1 = vec2(
              23.14069263277926,
              2.665144142690225
            );
            return fract(cos(dot(p, K1)) * 12345.6789);
          }

          void main() {
            vec4 color = texture2D(tDiffuse, vUv);
            vec2 uvRandom = vUv;
            uvRandom.y *= random(vec2(uvRandom.y, amount));
            color.rgb += random(uvRandom) * 0.075;
            gl_FragColor = vec4(color);
          }
        `
      };

      this.grainPass = new THREE.ShaderPass(grainShader);
      this.grainPass.renderToScreen = true;
      this.composer.addPass(this.grainPass);
    }
  }

  bindEvents() {
    const onMove = (clientX, clientY) => {
      const rect = this.section.getBoundingClientRect();
      this.hasUserInteracted = true;
      this.mouse.x = 2 * ((clientX - rect.left) / rect.width - 0.5);
      this.mouse.y = 2 * ((clientY - rect.top) / rect.height - 0.5);
    };

    window.addEventListener('mousemove', (e) => {
      const rect = this.section.getBoundingClientRect();
      if (e.clientY >= rect.top - 150 && e.clientY <= rect.bottom + 150) {
        onMove(e.clientX, e.clientY);
      }
    }, { passive: true });

    this.section.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('resize', () => this.resize(), { passive: true });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
        });
      }, { rootMargin: '200px' });
      observer.observe(this.section);
    } else {
      this.isVisible = true;
    }
  }

  resize() {
    if (!this.renderer || !this.camera || !this.section) return;

    const rect = this.section.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
    }

    const t = this.camera.fov * Math.PI / 180;
    this.fovY = Math.abs(this.camera.position.z * Math.tan(t / 2) * 2);

    if (this.bgMesh) {
      this.bgMesh.scale.x = Math.abs(this.fovY * this.camera.aspect);
      this.bgMesh.scale.y = Math.abs(this.fovY);
      this.bgMesh.scale.z = Math.abs(this.fovY);
    }

    if (this.bgUniforms && this.bgUniforms.u_res) {
      this.bgUniforms.u_res.value.set(width, height);
      this.bgUniforms.uZoom.value = window.innerWidth < 1024 ? 0.1 : 0.2;
    }
  }

  loop() {
    this.raf = requestAnimationFrame(() => this.loop());

    if (!this.isVisible) return;

    const now = performance.now() * 0.001;

    // Gentle idle floating when user hasn't moved mouse yet
    if (!this.hasUserInteracted) {
      this.mouse.x = Math.sin(now * 0.4) * 0.35;
      this.mouse.y = Math.cos(now * 0.3) * 0.25;
    }

    // Spring damping towards mouse position
    this.mouseVec.x = this.mouse.x;
    this.mouseVec.y = this.mouse.y;
    this.direction.subVectors(this.mouseVec, this.cameraPosition);
    this.direction.multiplyScalar(0.06);
    this.cameraPosition.addVectors(this.cameraPosition, this.direction);

    // Camera parallax tilting (exact monopo.vn formula)
    this.camera.position.x = this.cameraPosition.x * this.cameraEasing.x * -1;
    this.camera.position.y = -this.cameraPosition.y * this.cameraEasing.y * 1;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Update background procedural time
    if (this.bgMaterial && this.bgMaterial.uniforms) {
      this.bgMaterial.uniforms.uTime.value += 7e-5 * this.bgSpeed;
    }

    // Dynamic cubemap refraction pass for the glass sphere
    if (this.sphere && this.refractSphereCamera) {
      this.sphere.visible = false;
      this.refractSphereCamera.update(this.renderer, this.scene);
      this.sphere.visible = true;
    }

    // Render pass with cinematic film grain
    if (this.composer) {
      if (this.grainPass) {
        this.grainPass.uniforms.amount.value = Math.random();
      }
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// ==========================================
// FAQ Accordion Interaction (Click / Touch fallback)
// ==========================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
    });
  });
}

// ==========================================
// App Initializer
// ==========================================
function initApp() {
  new AlligatorTracker();
  new WaveCharacterTracker();
  new LiquidCrystal3D();
  initTextRotator();
  initScrollProgressBar();
  initScrollAnimations();
  initActiveNavSpy();
  initHeaderThemeController();
  initCollageParallax();
  initCollageVideos();
  initFaqAccordion();

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
