/**
 * Sakthi S - Senior Portfolio Interactive Graphics & UX Engine
 * Features:
 * - High-performance Interactive Particle & Constellation Canvas with mouse physics & click shockwaves
 * - Real-time 3D Card Tilt with dynamic cursor spotlight glare
 * - Dynamic typing effect for engineering roles
 * - Interactive Project category filtering
 * - Smooth scroll & active navigation tracker
 * - Theme switcher (Dark Cyber / Modern Light) with localStorage persistence
 * - Scroll progress bar & Back-to-Top circular progress
 * - Interactive Contact Form with simulated asynchronous response
 * - Mobile drawer navigation
 */

class InteractivePortfolio {
  constructor() {
    this.canvas = document.getElementById('bgCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 160 };
    this.isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    
    this.init();
  }

  init() {
    this.initTheme();
    this.initCanvasBackground();
    this.initTypingEffect();
    this.init3DTilt();
    this.initProjectFilters();
    this.initNavigation();
    this.initScrollProgress();
    this.initScrollAnimations();
    this.initContactForm();
    this.initStatsCounter();
    this.initResumeFallback();
    this.setupPageLoader();
  }

  // --- Resume Download Fallback ---
  initResumeFallback() {
    const resumeLinks = document.querySelectorAll('a[href="resume.pdf"]');
    resumeLinks.forEach(link => {
      link.addEventListener('click', async (e) => {
        try {
          const response = await fetch('resume.pdf', { method: 'HEAD' });
          if (!response.ok) {
            e.preventDefault();
            alert("Tip: Place your 'resume.pdf' in the portfolio folder to enable direct downloads. Directing you to the contact section!");
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } catch (err) {
          // If running directly from file:// protocol or fetch fails, allow default browser download behavior
        }
      });
    });
  }

  // --- Page Loader ---
  setupPageLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 600);
      }, 500);
    });

    // Fallback if load already triggered
    if (document.readyState === 'complete') {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
        }, 600);
      }, 500);
    }
  }

  // --- Theme Toggle ---
  initTheme() {
    const toggleBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('sakthi_portfolio_theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
    this.isLightMode = savedTheme === 'light';

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('sakthi_portfolio_theme', nextTheme);
        this.isLightMode = nextTheme === 'light';
        this.updateThemeIcon(nextTheme);

        // Update particle colors on theme switch
        this.updateParticleColors();
      });
    }
  }

  updateThemeIcon(theme) {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (theme === 'light') {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    }
  }

  // --- Interactive Canvas Background (Constellation & Physics) ---
  initCanvasBackground() {
    if (!this.canvas || !this.ctx) return;

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.createParticles();
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking for canvas interaction
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    // Shockwave pulse on click
    window.addEventListener('click', (e) => {
      this.triggerShockwave(e.clientX, e.clientY);
    });

    this.animateCanvas();
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 12000), 90);
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.9,
        vy: (Math.random() - 0.5) * 0.9,
        size: Math.random() * 2.2 + 1,
        baseColor: this.getRandomParticleColor()
      });
    }
  }

  getRandomParticleColor() {
    const darkColors = ['#8b5cf6', '#06b6d4', '#3b82f6', '#ec4899', '#6366f1'];
    const lightColors = ['#6366f1', '#0284c7', '#7c3aed', '#0d9488'];
    const palette = this.isLightMode ? lightColors : darkColors;
    return palette[Math.floor(Math.random() * palette.length)];
  }

  updateParticleColors() {
    this.particles.forEach(p => {
      p.baseColor = this.getRandomParticleColor();
    });
  }

  triggerShockwave(cx, cy) {
    const force = 8;
    this.particles.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220 && dist > 0) {
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * (force * (1 - dist / 220));
        p.vy += Math.sin(angle) * (force * (1 - dist / 220));
      }
    });
  }

  animateCanvas() {
    if (!this.canvas || !this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const connectDistance = 120;
    const mouseConnectDistance = 160;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update positions
      p.x += p.vx;
      p.y += p.vy;

      // Friction / Velocity damping to return to normal speed
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Ensure minimal ambient drift
      if (Math.abs(p.vx) < 0.2) p.vx += (Math.random() - 0.5) * 0.1;
      if (Math.abs(p.vy) < 0.2) p.vy += (Math.random() - 0.5) * 0.1;

      // Bounce off screen boundaries
      if (p.x < 0) { p.x = 0; p.vx *= -1; }
      if (p.x > this.canvas.width) { p.x = this.canvas.width; p.vx *= -1; }
      if (p.y < 0) { p.y = 0; p.vy *= -1; }
      if (p.y > this.canvas.height) { p.y = this.canvas.height; p.vy *= -1; }

      // Mouse interaction (repulsion & attraction filament)
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseConnectDistance) {
          const alpha = 1 - dist / mouseConnectDistance;
          this.ctx.strokeStyle = this.isLightMode
            ? `rgba(99, 102, 241, ${alpha * 0.45})`
            : `rgba(6, 182, 212, ${alpha * 0.6})`;
          this.ctx.lineWidth = 1.2;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();

          // Gentle pull toward cursor
          p.vx += (dx / dist) * 0.03;
          p.vy += (dy / dist) * 0.03;
        }
      }

      // Connect inter-particle filaments
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectDistance) {
          const alpha = 1 - dist / connectDistance;
          this.ctx.strokeStyle = this.isLightMode
            ? `rgba(148, 163, 184, ${alpha * 0.25})`
            : `rgba(139, 92, 246, ${alpha * 0.28})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }

      // Draw particle node
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.baseColor;
      this.ctx.shadowBlur = this.isLightMode ? 4 : 10;
      this.ctx.shadowColor = p.baseColor;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // Reset shadow for performance
    }

    requestAnimationFrame(() => this.animateCanvas());
  }

  // --- Dynamic Typing Effect ---
  initTypingEffect() {
    const targetElement = document.getElementById('typingRole');
    if (!targetElement) return;

    const roles = [
      'Full Stack Developer',
      'UI/UX & Frontend Specialist',
      'React & Node.js Engineer',
      'Hackathon Leader & Problem Solver',
      'Game Dev Enthusiast'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    const type = () => {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        targetElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
      } else {
        targetElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 1800; // Pause at full word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400; // Pause before new word
      }

      setTimeout(type, typingSpeed);
    };

    type();
  }

  // --- 3D Card Tilt with Dynamic Spotlight Glare ---
  init3DTilt() {
    const cards = document.querySelectorAll('.card-tilt');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return; // Skip 3D tilt calculations on mobile touch devices

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Dynamic spotlight coordinates via CSS variables
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        card.style.setProperty('--mouse-x', `-999px`);
        card.style.setProperty('--mouse-y', `-999px`);
      });
    });
  }

  // --- Interactive Project Filtering ---
  initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Active button state
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filterValue = button.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
            card.classList.remove('hidden');
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.95)';
            setTimeout(() => {
              card.classList.add('hidden');
            }, 300);
          }
        });
      });
    });
  }

  // --- Smooth Navigation & Active Link Tracker ---
  initNavigation() {
    const navLinks = document.querySelectorAll('nav a, .mobile-nav a');
    const sections = document.querySelectorAll('section');
    const header = document.querySelector('header');
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileMenu = document.getElementById('mobileNav');

    // Header scroll background effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Highlight active navigation section
      let currentSectionId = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
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

    // Mobile Hamburger Toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('is-active');
        mobileMenu.classList.toggle('open');
        document.body.classList.toggle('nav-open');
      });

      // Close mobile menu when a link is clicked
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('is-active');
          mobileMenu.classList.remove('open');
          document.body.classList.remove('nav-open');
        });
      });
    }

    // Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // --- Scroll Progress Bar & Back to Top Indicator ---
  initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const progressCircle = document.querySelector('.progress-ring-circle');

    const circumference = progressCircle ? 2 * Math.PI * 20 : 0;
    if (progressCircle) {
      progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      progressCircle.style.strokeDashoffset = circumference;
    }

    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progressPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
      }

      if (backToTopBtn) {
        if (scrollTop > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }

        if (progressCircle) {
          const offset = circumference - (progressPercent / 100) * circumference;
          progressCircle.style.strokeDashoffset = offset;
        }
      }
    });

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // --- Scroll Reveal Animations ---
  initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optional: unobserve once revealed for performance
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // --- Animated Numbers / Stats Counter ---
  initStatsCounter() {
    const statCounters = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          hasCounted = true;
          statCounters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
            const suffix = counter.getAttribute('data-suffix') || '';
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 40));
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                counter.textContent = target + suffix;
                clearInterval(timer);
              } else {
                counter.textContent = current + suffix;
              }
            }, 30);
          });
        }
      });
    }, { threshold: 0.4 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
      statsObserver.observe(statsSection);
    }
  }

  // --- Interactive Contact Form Handling ---
  initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('.submit-btn');
      const feedbackAlert = document.getElementById('formFeedback');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending message...';

      // Simulate asynchronous API delivery
      setTimeout(() => {
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent!';
        submitBtn.classList.add('btn-success');

        if (feedbackAlert) {
          feedbackAlert.textContent = "Thank you, Sakthi S will get back to you shortly!";
          feedbackAlert.className = 'form-feedback success';
        }

        form.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.classList.remove('btn-success');
          if (feedbackAlert) {
            feedbackAlert.className = 'form-feedback';
            feedbackAlert.textContent = '';
          }
        }, 4000);
      }, 1200);
    });
  }
}

// Instantiate on DOM readiness
document.addEventListener('DOMContentLoaded', () => {
  window.portfolioApp = new InteractivePortfolio();
});

