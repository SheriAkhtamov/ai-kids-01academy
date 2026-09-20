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
class LiquidCrystal3D {
  constructor() {
    this.canvas = document.getElementById('liquid-canvas');
    this.section = document.getElementById('apply');
    if (!this.canvas || !this.section) return;

    this.gl = this.canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance'
    });
    if (!this.gl) return;

    this.initShaders();
    this.initBuffers();
    this.initRipples();
    this.bindEvents();
    this.resize();
    this.animate();
  }

  initShaders() {
    const gl = this.gl;
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_mouse_speed;
      uniform vec4 u_ripples[6];

      float wave(vec2 p, float t) {
        float h = 0.0;
        
        // Ambient organic fluid swells
        vec2 p1 = p * 2.2 + vec2(t * 0.12, t * 0.08);
        vec2 p2 = p * 3.4 - vec2(t * 0.10, t * 0.16);
        h += sin(p1.x + sin(p1.y * 1.3)) * 0.28;
        h += cos(p2.y + sin(p2.x * 1.4)) * 0.22;

        // Domain warping for fluid viscosity
        vec2 warp = vec2(sin(p.x * 2.5 + t * 0.2), cos(p.y * 2.5 + t * 0.22));
        h += sin(length(p + warp * 0.35) * 3.8 - t * 0.45) * 0.20;

        // Interactive mouse ripples
        for (int i = 0; i < 6; i++) {
          vec4 rip = u_ripples[i];
          if (rip.w > 0.001) {
            float age = t - rip.z;
            if (age > 0.0 && age < 3.0) {
              float d = length(p - rip.xy);
              float waveFront = abs(d - age * 0.65);
              float amp = rip.w * exp(-d * 2.5) * exp(-age * 1.2);
              h += sin(waveFront * 24.0) * amp * 0.45;
            }
          }
        }

        // Active cursor displacement
        float cursorDist = length(p - u_mouse);
        float cursorWave = sin(cursorDist * 16.0 - t * 3.5) * exp(-cursorDist * 4.0) * u_mouse_speed;
        h += cursorWave * 0.35;

        return h;
      }

      void main() {
        vec2 uv = v_uv;
        vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
        vec2 p = (uv - 0.5) * aspect;

        float t = u_time * 0.8;
        float eps = 0.004;

        // Calculate 3D surface normal
        float hCenter = wave(p, t);
        float hRight  = wave(p + vec2(eps, 0.0), t);
        float hTop    = wave(p + vec2(0.0, eps), t);

        vec3 N = normalize(vec3(
          (hCenter - hRight) * 4.5,
          (hCenter - hTop) * 4.5,
          eps * 2.5
        ));

        vec3 V = vec3(0.0, 0.0, 1.0);
        float NdotV = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = pow(1.0 - NdotV, 3.2);

        // Lights
        vec3 L1 = normalize(vec3(0.6, 0.7, 0.8));
        vec3 H1 = normalize(L1 + V);
        float diff1 = max(dot(N, L1), 0.0);
        float spec1 = pow(max(dot(N, H1), 0.0), 40.0);

        vec2 mouseP = (u_mouse - 0.5) * aspect;
        vec3 L2 = normalize(vec3(mouseP - p, 0.4));
        vec3 H2 = normalize(L2 + V);
        float mouseDist = length(mouseP - p);
        float spec2 = pow(max(dot(N, H2), 0.0), 32.0) * exp(-mouseDist * 2.0);

        // Liquid Crystal Palette (Obsidian -> Deep Teal -> 01Academy Green -> Iridescent Violet)
        vec3 cBase    = vec3(0.025, 0.045, 0.08);   // Deep obsidian
        vec3 cEmerald = vec3(0.345, 0.800, 0.008);  // #58cc02 01Academy Green
        vec3 cTeal    = vec3(0.020, 0.750, 0.650);  // Deep Cyan/Teal
        vec3 cViolet  = vec3(0.550, 0.200, 0.850);  // Glancing angle violet

        float colorShift = clamp(hCenter * 0.8 + fresnel * 0.7 + diff1 * 0.3, 0.0, 1.0);
        
        vec3 liquidColor = mix(cBase, cTeal, smoothstep(0.1, 0.5, colorShift));
        liquidColor = mix(liquidColor, cEmerald, smoothstep(0.4, 0.85, colorShift));
        liquidColor = mix(liquidColor, cViolet, fresnel * 0.65);

        vec3 specColor = mix(vec3(1.0), cEmerald, 0.4);
        vec3 finalColor = liquidColor + specColor * (spec1 * 0.7 + spec2 * 0.9);

        float vignette = smoothstep(1.3, 0.3, length(uv - 0.5));
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution');
    this.uTime = gl.getUniformLocation(this.program, 'u_time');
    this.uMouse = gl.getUniformLocation(this.program, 'u_mouse');
    this.uMouseSpeed = gl.getUniformLocation(this.program, 'u_mouse_speed');
    this.uRipples = gl.getUniformLocation(this.program, 'u_ripples');
  }

  initBuffers() {
    const gl = this.gl;
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  }

  initRipples() {
    this.ripples = [];
    for (let i = 0; i < 6; i++) {
      this.ripples.push({ x: 0, y: 0, time: -100, strength: 0 });
    }
    this.rippleIndex = 0;
    this.lastRippleTime = 0;
    this.lastX = 0.5;
    this.lastY = 0.5;
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.currentMouse = { x: 0.5, y: 0.5 };
    this.targetSpeed = 0;
    this.currentSpeed = 0;
  }

  bindEvents() {
    const onMove = (clientX, clientY) => {
      const rect = this.section.getBoundingClientRect();
      const mx = (clientX - rect.left) / rect.width;
      const my = 1.0 - (clientY - rect.top) / rect.height;

      const dist = Math.hypot(mx - this.lastX, my - this.lastY);
      const now = performance.now() * 0.001;

      if (dist > 0.025 && now - this.lastRippleTime > 0.07) {
        this.ripples[this.rippleIndex] = {
          x: mx,
          y: my,
          time: now,
          strength: Math.min(1.2, dist * 10.0)
        };
        this.rippleIndex = (this.rippleIndex + 1) % 6;
        this.lastRippleTime = now;
      }

      this.targetMouse = { x: mx, y: my };
      this.targetSpeed = Math.min(1.8, dist * 12.0);
      this.lastX = mx;
      this.lastY = my;
    };

    window.addEventListener('mousemove', (e) => {
      const rect = this.section.getBoundingClientRect();
      if (e.clientY >= rect.top - 100 && e.clientY <= rect.bottom + 100) {
        onMove(e.clientX, e.clientY);
      }
    }, { passive: true });

    this.section.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.isVisible = false;
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isVisible = entry.isIntersecting;
        });
      }, { rootMargin: '150px' });
      observer.observe(this.section);
    } else {
      this.isVisible = true;
    }
  }

  resize() {
    if (!this.gl || !this.canvas || !this.section) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const rect = this.section.getBoundingClientRect();
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  animate() {
    if (this.isVisible && this.gl && this.program) {
      const gl = this.gl;
      gl.useProgram(this.program);

      this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.12;
      this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.12;
      this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1;
      this.targetSpeed *= 0.94;

      const now = performance.now() * 0.001;

      gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uTime, now);
      gl.uniform2f(this.uMouse, this.currentMouse.x, this.currentMouse.y);
      gl.uniform1f(this.uMouseSpeed, this.currentSpeed);

      const flatRipples = new Float32Array(24);
      for (let i = 0; i < 6; i++) {
        flatRipples[i * 4 + 0] = this.ripples[i].x;
        flatRipples[i * 4 + 1] = this.ripples[i].y;
        flatRipples[i * 4 + 2] = this.ripples[i].time;
        flatRipples[i * 4 + 3] = this.ripples[i].strength;
      }
      gl.uniform4fv(this.uRipples, flatRipples);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    requestAnimationFrame(() => this.animate());
  }
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
  initCollageParallax();
  initCollageVideos();

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
