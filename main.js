// DOM Elements
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn?.querySelector("i");
const mobileNav = document.getElementById("mobile-nav");
const mobileNavItems = document.querySelectorAll(".mobile-nav__item");
const darkModeToggles = document.querySelectorAll(".theme-toggle");
const signUpBtns = document.querySelectorAll(".sign-up-btn, #mobile-signup-nav, #floating-mobile-signup");
const modal = document.getElementById("auth-modal");
const mobileAccountModal = document.getElementById("mobile-account-modal");
const closeModal = document.querySelector(".close");
const closeMobileAccountModal = document.querySelector(".close-mobile-account");
const loadingScreen = document.getElementById("loading-screen");
const backToTop = document.getElementById("back-to-top");

// Loading Screen
window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }, 1000);
});

// Mobile Menu Toggle
if (menuBtn) {
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("open");
    
    const isOpen = navLinks.classList.contains("open");
    menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
    
    // Add animation to menu button
    menuBtn.style.transform = isOpen ? "rotate(90deg)" : "rotate(0deg)";
  });
}

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (navLinks && navLinks.classList.contains("open") && 
      !navLinks.contains(e.target) && 
      !menuBtn.contains(e.target)) {
    navLinks.classList.remove("open");
    menuBtnIcon.setAttribute("class", "ri-menu-line");
    menuBtn.style.transform = "rotate(0deg)";
  }
});

// Mobile Navigation Active State
mobileNavItems.forEach(item => {
  if (item.tagName === "A") {
    item.addEventListener("click", function(e) {
      mobileNavItems.forEach(i => {
        if (i.tagName === "A") {
          i.classList.remove("active");
        }
      });
      this.classList.add("active");
      
      // Add ripple effect
      addRippleEffect(this, e);
    });
  }
});

// Ripple Effect Function
function addRippleEffect(element, event) {
  const ripple = document.createElement("span");
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 137, 6, 0.3);
    transform: scale(0);
    animation: ripple 0.6s linear;
    width: ${size}px;
    height: ${size}px;
    top: ${y}px;
    left: ${x}px;
    pointer-events: none;
  `;
  
  element.style.position = "relative";
  element.style.overflow = "hidden";
  element.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

// Dark/Light Mode Toggle
function initTheme() {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem("theme");
  
  // Set initial theme
  if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
    document.body.classList.add("dark");
    updateThemeIcons("ri-sun-line");
  } else {
    document.body.classList.remove("dark");
    updateThemeIcons("ri-moon-line");
  }
  
  // Add event listeners to toggle buttons
  darkModeToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      
      // Save preference
      localStorage.setItem("theme", isDark ? "dark" : "light");
      
      // Update icons with animation
      toggle.style.transform = "rotate(360deg)";
      setTimeout(() => {
        toggle.style.transform = "";
      }, 500);
      
      updateThemeIcons(isDark ? "ri-sun-line" : "ri-moon-line");
      
      // Add confetti effect on theme change
      if (isDark) {
        createConfetti();
      }
    });
  });
  
  // Listen for system theme changes
  prefersDarkScheme.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        document.body.classList.add("dark");
        updateThemeIcons("ri-sun-line");
      } else {
        document.body.classList.remove("dark");
        updateThemeIcons("ri-moon-line");
      }
    }
  });
}

function updateThemeIcons(iconClass) {
  darkModeToggles.forEach(toggle => {
    if (toggle) {
      const icon = toggle.querySelector("i");
      if (icon) {
        icon.className = iconClass;
      }
    }
  });
}

// Confetti Effect
function createConfetti() {
  const colors = ["#ff8906", "#ff5e62", "#00d5be", "#c27aff", "#00bcff"];
  const confettiCount = 100;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -20px;
      left: ${Math.random() * 100}vw;
      border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
      z-index: 9999;
      pointer-events: none;
    `;
    
    document.body.appendChild(confetti);
    
    // Animation
    const animation = confetti.animate([
      { 
        transform: `translate(0, 0) rotate(0deg)`,
        opacity: 1 
      },
      { 
        transform: `translate(${Math.random() * 100 - 50}px, 100vh) rotate(${Math.random() * 360}deg)`,
        opacity: 0 
      }
    ], {
      duration: 1000 + Math.random() * 2000,
      easing: "cubic-bezier(0.215, 0.61, 0.355, 1)"
    });
    
    animation.onfinish = () => confetti.remove();
  }
}

// Modal Functions for Desktop
function initDesktopModal() {
  if (!modal || !closeModal) return;
  
  // Open modal from desktop buttons
  signUpBtns.forEach(btn => {
    if (btn.classList.contains('sign-up-btn') || btn.id === 'floating-mobile-signup') {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.innerWidth >= 769) {
          // Desktop: Open main modal directly
          modal.style.display = "block";
          document.body.style.overflow = "hidden";
        } else {
          // Mobile: Open account options modal
          mobileAccountModal.style.display = "block";
          document.body.style.overflow = "hidden";
        }
        
        // Add ripple effect
        addRippleEffect(btn, e);
      });
    }
  });
  
  // Close main modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  });
  
  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
  
  // Form switching in desktop modal
  const optionBtns = document.querySelectorAll('.option-btn');
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const switchFormLinks = document.querySelectorAll('.switch-form');
  
  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const option = btn.getAttribute('data-option');
      
      // Update active button
      optionBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding form
      if (option === 'signin') {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
      } else {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
      }
    });
  });
  
  // Switch between forms using links
  switchFormLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      
      // Update active button
      optionBtns.forEach(b => b.classList.remove('active'));
      document.querySelector(`.option-btn[data-option="${target}"]`).classList.add('active');
      
      // Show corresponding form
      if (target === 'signin') {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
      } else {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
      }
    });
  });
  
  // Form submissions
  const signinFormEl = document.getElementById('signin-email-form');
  const signupFormEl = document.getElementById('signup-email-form');
  
  if (signinFormEl) {
    signinFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;
      
      // Simulate login
      simulateAuth('Signing in...', 'Welcome back!');
    });
  }
  
  if (signupFormEl) {
    signupFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;
      
      if (password !== confirmPassword) {
        showNotification("Passwords don't match!", "info");
        return;
      }
      
      // Simulate signup
      simulateAuth('Creating account...', 'Account created successfully!');
    });
  }
  
  // Social login buttons
  const socialBtns = document.querySelectorAll(".social-btn");
  socialBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="ri-loader-4-line animate-spin"></i> Connecting...';
      
      // Simulate API call
      setTimeout(() => {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Show success notification
        showNotification("Successfully connected!", "success");
        
        // Reset button text
        setTimeout(() => {
          btn.innerHTML = originalHTML;
        }, 1000);
      }, 1500);
    });
  });
}

// Mobile Account Modal Functions
function initMobileAccountModal() {
  if (!mobileAccountModal || !closeMobileAccountModal) return;
  
  // Open mobile account modal from mobile nav button
  const mobileSignupNav = document.getElementById('mobile-signup-nav');
  if (mobileSignupNav) {
    mobileSignupNav.addEventListener('click', (e) => {
      e.preventDefault();
      mobileAccountModal.style.display = "block";
      document.body.style.overflow = "hidden";
    });
  }
  
  // Close mobile account modal
  closeMobileAccountModal.addEventListener("click", () => {
    mobileAccountModal.style.display = "none";
    document.body.style.overflow = "auto";
  });
  
  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === mobileAccountModal) {
      mobileAccountModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });
  
  // Handle option selection in mobile modal
  const signinOption = document.querySelector('.signin-option');
  const signupOption = document.querySelector('.signup-option');
  const quickSocialBtns = document.querySelectorAll('.quick-social-btn');
  
  if (signinOption) {
    signinOption.addEventListener('click', () => {
      mobileAccountModal.style.display = "none";
      // Show sign in form in main modal
      modal.style.display = "block";
      
      // Switch to sign in form
      const signinBtn = document.querySelector('.option-btn[data-option="signin"]');
      if (signinBtn) signinBtn.click();
    });
  }
  
  if (signupOption) {
    signupOption.addEventListener('click', () => {
      mobileAccountModal.style.display = "none";
      // Show sign up form in main modal
      modal.style.display = "block";
      
      // Switch to sign up form
      const signupBtn = document.querySelector('.option-btn[data-option="signup"]');
      if (signupBtn) signupBtn.click();
    });
  }
  
  // Quick social buttons in mobile modal
  quickSocialBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.classList.contains('google') ? 'Google' : 
                      btn.classList.contains('facebook') ? 'Facebook' : 'Twitter';
      
      // Show loading
      const originalContent = mobileAccountModal.innerHTML;
      mobileAccountModal.querySelector('.modal-body').innerHTML = `
        <div class="loading-auth">
          <i class="ri-loader-4-line animate-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
          <p>Connecting with ${platform}...</p>
        </div>
      `;
      
      // Simulate API call
      setTimeout(() => {
        mobileAccountModal.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Show success notification
        showNotification(`Connected with ${platform}!`, "success");
        
        // Reset modal content
        setTimeout(() => {
          mobileAccountModal.innerHTML = originalContent;
          initMobileAccountModal(); // Reinitialize event listeners
        }, 100);
      }, 1500);
    });
  });
}

// Simulate authentication
function simulateAuth(loadingMessage, successMessage) {
  // Show loading in modal
  const modalBody = modal.querySelector('.modal-body');
  const originalContent = modalBody.innerHTML;
  
  modalBody.innerHTML = `
    <div class="loading-auth">
      <i class="ri-loader-4-line animate-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
      <p style="margin-top: 1rem; color: var(--text-light);">${loadingMessage}</p>
    </div>
  `;
  
  // Simulate API call
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    
    // Show success notification
    showNotification(successMessage, "success");
    
    // Reset modal content
    setTimeout(() => {
      modalBody.innerHTML = originalContent;
      initDesktopModal(); // Reinitialize event listeners
    }, 100);
  }, 1500);
}

// Notification System
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="ri-${type === 'success' ? 'checkbox-circle' : 'information'}-line"></i>
    <span>${message}</span>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    transform: translateX(150%);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(150%)";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Back to Top Button
function initBackToTop() {
  if (!backToTop) return;
  
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  });
  
  backToTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    
    // Add bounce animation
    backToTop.style.animation = "bounceIn 0.6s ease";
    setTimeout(() => {
      backToTop.style.animation = "";
    }, 600);
  });
}

// Counter Animation
function initCounters() {
  const counters = document.querySelectorAll(".counter, .stat-number");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute("data-count") || counter.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
          current += step;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };
        
        updateCounter();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
}

// Scroll Animations
function initScrollAnimations() {
  // Initialize ScrollReveal
  if (typeof ScrollReveal !== 'undefined') {
    const scrollRevealOption = {
      distance: "50px",
      origin: "bottom",
      duration: 1000,
      easing: "cubic-bezier(0.5, 0, 0, 1)",
      interval: 200
    };
    
    // Header animations
    ScrollReveal().reveal(".header__content h1", {
      ...scrollRevealOption,
      delay: 300
    });
    
    ScrollReveal().reveal(".header__content .section__description", {
      ...scrollRevealOption,
      delay: 600
    });
    
    ScrollReveal().reveal(".header__btns", {
      ...scrollRevealOption,
      delay: 900
    });
    
    ScrollReveal().reveal(".stats-container", {
      ...scrollRevealOption,
      delay: 1200
    });
    
    // Service cards
    ScrollReveal().reveal(".service__card", {
      ...scrollRevealOption,
      interval: 300
    });
    
    // About list items
    ScrollReveal().reveal(".about__list li", {
      ...scrollRevealOption,
      interval: 300,
      delay: 300
    });
    
    // Portfolio items
    ScrollReveal().reveal(".portfolio__list li", {
      ...scrollRevealOption,
      interval: 300,
      delay: 300
    });
  }
  
  // Custom scroll animations for fade-in items
  const fadeInItems = document.querySelectorAll(".fade-in-item, .slide-in-item");
  
  const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeInObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  fadeInItems.forEach(item => fadeInObserver.observe(item));
  
  // Navbar background on scroll
  const nav = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    if (nav) {
      if (window.pageYOffset > 50) {
        nav.style.backdropFilter = "blur(20px)";
        nav.style.backgroundColor = "rgba(var(--bg-color-rgb), 0.95)";
        nav.style.boxShadow = "var(--shadow)";
      } else {
        nav.style.backdropFilter = "blur(20px)";
        nav.style.backgroundColor = "rgba(var(--bg-color-rgb), 0.85)";
        nav.style.boxShadow = "var(--shadow)";
      }
    }
  });
}

// Swiper Slider
function initSwiper() {
  if (typeof Swiper !== 'undefined') {
    const swiper = new Swiper(".swiper", {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    });
  }
}

// Button Ripple Effect
document.addEventListener("click", function(e) {
  // Add ripple to all buttons
  if (e.target.classList.contains("btn") || 
      e.target.closest(".btn") || 
      e.target.classList.contains("video-link") ||
      e.target.closest(".video-link") ||
      e.target.classList.contains("hero-btn") ||
      e.target.closest(".hero-btn")) {
    
    const button = e.target.classList.contains("btn") || 
                   e.target.classList.contains("video-link") ||
                   e.target.classList.contains("hero-btn")
      ? e.target 
      : e.target.closest(".btn") || 
        e.target.closest(".video-link") || 
        e.target.closest(".hero-btn");
    
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      width: ${size}px;
      height: ${size}px;
      top: ${y}px;
      left: ${x}px;
      pointer-events: none;
      z-index: 1;
    `;
    
    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
});

// Parallax Effect
function initParallax() {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(".floating-animation");
    
    parallaxElements.forEach((el, index) => {
      const speed = 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// How It Works Button Functionality
function initHowItWorks() {
  const howItWorksBtn = document.querySelector('.hero-btn');
  if (howItWorksBtn) {
    howItWorksBtn.addEventListener('click', () => {
      // Scroll to services section
      document.querySelector('.service').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Show tutorial modal or animation
      setTimeout(() => {
        showNotification("Learn how we work in 3 simple steps!", "info");
      }, 1000);
    });
  }
  
  // Video link functionality
  const videoLink = document.querySelector('.video-link');
  if (videoLink) {
    videoLink.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification("Our story video will play here!", "info");
    });
  }
}

// Mobile Responsive Adjustments
function initMobileResponsive() {
  // Hide floating mobile sign up button on desktop
  const floatingMobileSignup = document.getElementById('floating-mobile-signup');
  
  function checkMobile() {
    if (window.innerWidth < 769) {
      if (floatingMobileSignup) {
        floatingMobileSignup.style.display = 'flex';
      }
    } else {
      if (floatingMobileSignup) {
        floatingMobileSignup.style.display = 'none';
      }
    }
  }
  
  // Initial check
  checkMobile();
  
  // Check on resize
  window.addEventListener('resize', checkMobile);
}

// Fix for desktop text display
function fixDesktopTextDisplay() {
  const headerTitle = document.querySelector('.header__content h1');
  if (headerTitle && window.innerWidth >= 769) {
    // Ensure the text breaks properly on desktop
    headerTitle.innerHTML = headerTitle.innerHTML.replace('Digital Products,', 'Digital Products,<br>');
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initDesktopModal();
  initMobileAccountModal();
  initBackToTop();
  initCounters();
  initScrollAnimations();
  initSwiper();
  initParallax();
  initHowItWorks();
  initMobileResponsive();
  fixDesktopTextDisplay();
  
  // Re-fix text display on resize
  window.addEventListener('resize', fixDesktopTextDisplay);
  
  // Add CSS for notifications and animations
  const style = document.createElement("style");
  style.textContent = `
    .notification {
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      transform: translateX(150%);
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      color: white;
      font-weight: 600;
    }
    
    .notification-success {
      background: #10b981;
    }
    
    .notification-info {
      background: #3b82f6;
    }
    
    .notification i {
      font-size: 1.25rem;
    }
    
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    @keyframes animate-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    .animate-spin {
      animation: animate-spin 1s linear infinite;
    }
    
    .confetti {
      position: fixed;
      pointer-events: none;
    }
    
    .loading-auth {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
    }
  `;
  document.head.appendChild(style);
  
  // Add hover effect to all interactive elements
  const interactiveElements = document.querySelectorAll("a, button, .service__card, .portfolio__list li, .about__list li");
  interactiveElements.forEach(el => {
    el.addEventListener("mouseenter", () => {
      el.style.transition = "var(--transition)";
    });
  });
  
  // Initialize tooltips
  const tooltipElements = document.querySelectorAll("[data-tooltip]");
  tooltipElements.forEach(el => {
    el.addEventListener("mouseenter", function() {
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = this.getAttribute("data-tooltip");
      tooltip.style.cssText = `
        position: absolute;
        background: var(--primary-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
        z-index: 1000;
        top: -40px;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: none;
      `;
      
      this.appendChild(tooltip);
      
      // Arrow
      const arrow = document.createElement("div");
      arrow.style.cssText = `
        position: absolute;
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--primary-color);
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
      `;
      
      tooltip.appendChild(arrow);
    });
    
    el.addEventListener("mouseleave", function() {
      const tooltip = this.querySelector(".tooltip");
      if (tooltip) {
        tooltip.remove();
      }
    });
  });
  
  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Toggle dark mode with Ctrl+D
    if (e.ctrlKey && e.key === "d") {
      e.preventDefault();
      if (darkModeToggles[0]) {
        darkModeToggles[0].click();
      }
    }
    
    // Open modal with Ctrl+M
    if (e.ctrlKey && e.key === "m") {
      e.preventDefault();
      if (modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    }
    
    // Close modal with Escape
    if (e.key === "Escape") {
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
      if (mobileAccountModal) {
        mobileAccountModal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }
  });
  
  // Performance optimization
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Reinitialize components on resize
      if (typeof Swiper !== 'undefined') {
        initSwiper();
      }
      fixDesktopTextDisplay();
    }, 250);
  });
});

// Error handling
window.addEventListener("error", (e) => {
  console.error("Error occurred:", e.error);
  showNotification("An error occurred. Please try again.", "info");
});

// Service Worker for PWA (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(err => {
      console.log("ServiceWorker registration failed: ", err);
    });
  });
}
