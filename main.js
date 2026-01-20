// DOM Elements
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn?.querySelector("i");
const mobileNav = document.getElementById("mobile-nav");
const mobileNavItems = document.querySelectorAll(".mobile-nav__item");
const darkModeToggles = document.querySelectorAll(".theme-toggle");
const signUpBtns = document.querySelectorAll(".sign-up-btn, #mobile-signup-nav");
const modal = document.getElementById("auth-modal");
const mobileAccountModal = document.getElementById("mobile-account-modal");
const closeModal = document.querySelector(".close");
const closeMobileAccountModal = document.querySelector(".close-mobile-account");
const loadingScreen = document.getElementById("loading-screen");
const backToTop = document.getElementById("back-to-top");

// User state
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

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
  if (item.tagName === "A" || item.tagName === "BUTTON") {
    item.addEventListener("click", function(e) {
      // Only update active state for navigation items, not profile/user items
      if (!this.classList.contains('user-item') && !this.classList.contains('signup-item')) {
        mobileNavItems.forEach(i => {
          if (i.tagName === "A" && !i.classList.contains('user-item') && !i.classList.contains('signup-item')) {
            i.classList.remove("active");
          }
        });
        this.classList.add("active");
      }
      
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

// Authentication Functions
function initAuthentication() {
  // Check if user is already logged in
  checkAuthState();
  
  // Add login/logout button to desktop nav
  updateAuthButtons();
}

// Demo Login Handler
function handleDemoLogin() {
  const demoUser = {
    id: 'demo123',
    name: 'Demo User',
    email: 'demo@shohojit.com',
    picture: 'https://ui-avatars.com/api/?name=Demo+User&background=ff8906&color=fff&size=128',
    provider: 'demo',
    loggedInAt: new Date().toISOString()
  };
  
  handleLoginSuccess(demoUser);
}

// Main Login Handler
function handleLoginSuccess(userData) {
  // Store user data
  currentUser = {
    id: userData.id || userData.sub || `demo_${Date.now()}`,
    name: userData.name || 'Demo User',
    email: userData.email || 'demo@shohojit.com',
    picture: userData.picture || userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=ff8906&color=fff`,
    provider: userData.provider || 'demo',
    accessToken: userData.accessToken || 'demo_token',
    loggedInAt: new Date().toISOString()
  };
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Close all modals
  if (modal) modal.style.display = "none";
  if (mobileAccountModal) mobileAccountModal.style.display = "none";
  document.body.style.overflow = "auto";
  
  // Update UI
  updateAuthButtons();
  
  // Show welcome notification
  showNotification(`Welcome back, ${currentUser.name.split(' ')[0]}!`, 'success');
  
  // Dispatch custom event for other components
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: currentUser } }));
}

// Logout Handler
function handleLogout() {
  // Clear user data
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  // Update UI
  updateAuthButtons();
  
  // Show notification
  showNotification('Logged out successfully', 'success');
  
  // Dispatch custom event
  document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
}

// Update Auth Buttons in UI
function updateAuthButtons() {
  const desktopSignUpBtn = document.querySelector('.sign-up-btn');
  const mobileSignUpNav = document.getElementById('mobile-signup-nav');
  
  if (currentUser) {
    // User is logged in - show profile instead of sign up
    if (desktopSignUpBtn) {
      desktopSignUpBtn.innerHTML = `
        <div class="user-avatar">
          <img src="${currentUser.picture}" alt="${currentUser.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👤</text></svg>'">
          <span class="user-name">${currentUser.name.split(' ')[0]}</span>
          <i class="ri-arrow-down-s-line"></i>
        </div>
      `;
      
      // Remove old click event and add dropdown
      const newBtn = desktopSignUpBtn.cloneNode(true);
      desktopSignUpBtn.parentNode.replaceChild(newBtn, desktopSignUpBtn);
      
      newBtn.addEventListener('click', showUserDropdown);
    }
    
    // Update mobile navigation - Change "Account" to "User"
    updateMobileUserButton();
  } else {
    // User is not logged in - show sign up buttons
    if (desktopSignUpBtn) {
      desktopSignUpBtn.innerHTML = '<i class="ri-user-line"></i> Sign In / Sign Up';
      
      const newBtn = desktopSignUpBtn.cloneNode(true);
      desktopSignUpBtn.parentNode.replaceChild(newBtn, desktopSignUpBtn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (modal) {
          modal.style.display = "block";
          document.body.style.overflow = "hidden";
        }
      });
    }
    
    if (mobileSignUpNav) {
      // Change back to "Account" when logged out
      updateMobileAccountButton();
    }
  }
}

// Update Mobile Button to show "User" when logged in
function updateMobileUserButton() {
  const mobileSignUpNav = document.getElementById('mobile-signup-nav');
  if (mobileSignUpNav && currentUser) {
    // Remove any existing classes
    mobileSignUpNav.classList.remove('signup-item', 'profile-item');
    
    // Add user-item class
    mobileSignUpNav.classList.add('user-item');
    
    // Update the HTML to show "User" with user icon
    mobileSignUpNav.innerHTML = `
      <i class="ri-user-line mobile-nav__icon"></i>
      <span class="mobile-nav__label">User</span>
    `;
    
    // Update data-tooltip
    mobileSignUpNav.setAttribute('data-tooltip', 'User Profile');
    
    // Clone and replace to ensure fresh event listeners
    const newMobileBtn = mobileSignUpNav.cloneNode(true);
    mobileSignUpNav.parentNode.replaceChild(newMobileBtn, mobileSignUpNav);
    
    // Add dropdown event
    newMobileBtn.addEventListener('click', showUserDropdown);
  }
}

// Update Mobile Button to show "Account" when logged out
function updateMobileAccountButton() {
  const mobileSignUpNav = document.getElementById('mobile-signup-nav');
  if (mobileSignUpNav) {
    // Remove user-item class
    mobileSignUpNav.classList.remove('user-item', 'profile-item');
    
    // Add signup-item class
    mobileSignUpNav.classList.add('signup-item');
    
    // Update the HTML to show "Account"
    mobileSignUpNav.innerHTML = `
      <i class="ri-user-add-line mobile-nav__icon"></i>
      <span class="mobile-nav__label">Account</span>
    `;
    
    // Update data-tooltip
    mobileSignUpNav.setAttribute('data-tooltip', 'Sign In / Sign Up');
    
    // Clone and replace to ensure fresh event listeners
    const newMobileBtn = mobileSignUpNav.cloneNode(true);
    mobileSignUpNav.parentNode.replaceChild(newMobileBtn, mobileSignUpNav);
    
    // Add modal event
    newMobileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (mobileAccountModal) {
        mobileAccountModal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    });
  }
}

// User Dropdown Menu
function showUserDropdown(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Remove existing dropdown if any
  const existingDropdown = document.querySelector('.user-dropdown, .mobile-user-dropdown');
  const existingOverlay = document.querySelector('.dropdown-overlay');
  if (existingDropdown) existingDropdown.remove();
  if (existingOverlay) existingOverlay.remove();
  
  if (!currentUser) return;
  
  const dropdown = document.createElement('div');
  const isMobile = window.innerWidth < 769;
  
  dropdown.className = isMobile ? 'mobile-user-dropdown' : 'user-dropdown';
  dropdown.innerHTML = `
    <div class="dropdown-header">
      ${isMobile ? '<button class="dropdown-close-btn"><i class="ri-close-line"></i></button>' : ''}
      <img src="${currentUser.picture}" alt="${currentUser.name}" onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👤</text></svg>'">
      <div>
        <h4>${currentUser.name}</h4>
        <p>${currentUser.email}</p>
        <small>Logged in via ${currentUser.provider}</small>
      </div>
    </div>
    <div class="dropdown-divider"></div>
    <a href="#" class="dropdown-item">
      <i class="ri-user-line"></i> My Profile
    </a>
    <a href="courses.html" class="dropdown-item">
      <i class="ri-book-line"></i> My Courses
    </a>
    <a href="#" class="dropdown-item">
      <i class="ri-settings-3-line"></i> Settings
    </a>
    <div class="dropdown-divider"></div>
    <button class="dropdown-item logout-btn">
      <i class="ri-logout-box-r-line"></i> Logout
    </button>
  `;
  
  // Store reference to the button that opened the dropdown
  const button = e.currentTarget;
  
  // Position dropdown
  if (isMobile) {
    // For mobile: Show at top of screen with overlay
    const overlay = document.createElement('div');
    overlay.className = 'dropdown-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(5px);
      z-index: 1001;
      animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(dropdown);
    
    // Close dropdown when clicking overlay
    overlay.addEventListener('click', () => {
      closeDropdown();
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  } else {
    // For desktop: Show near the button
    const rect = button.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 10}px`;
    dropdown.style.right = `${window.innerWidth - rect.right}px`;
    
    document.body.appendChild(dropdown);
  }
  
  // Add close button event for mobile
  if (isMobile) {
    const closeBtn = dropdown.querySelector('.dropdown-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeDropdown();
      });
    }
  }
  
  // Add click event to logout button
  dropdown.querySelector('.logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleLogout();
    closeDropdown();
  });
  
  // Add click events to dropdown items
  dropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.classList.contains('logout-btn')) return;
      
      // Handle navigation
      const text = item.textContent.trim();
      showNotification(`Navigating to ${text}...`, 'info');
      closeDropdown();
    });
  });
  
  // Function to close dropdown
  function closeDropdown() {
    dropdown.remove();
    const overlay = document.querySelector('.dropdown-overlay');
    if (overlay) overlay.remove();
    if (isMobile) document.body.style.overflow = '';
  }
  
  // Close dropdown when clicking outside (for desktop)
  if (!isMobile) {
    setTimeout(() => {
      const handleOutsideClick = (event) => {
        // Check if click is outside dropdown AND outside the button that opened it
        if (!dropdown.contains(event.target) && !button.contains(event.target)) {
          closeDropdown();
          document.removeEventListener('click', handleOutsideClick);
          document.removeEventListener('touchstart', handleOutsideClick);
        }
      };
      
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 0);
  }
}

// Check Authentication State
function checkAuthState() {
  // Check localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      
      // Check if token is expired (simple check - in production would verify with backend)
      const loginTime = new Date(currentUser.loggedInAt);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) { // Token expires after 24 hours
        handleLogout();
        showNotification('Session expired. Please login again.', 'info');
      } else {
        updateAuthButtons();
      }
    } catch (e) {
      localStorage.removeItem('currentUser');
      currentUser = null;
    }
  }
}

// Update Social Button Handlers
function updateSocialButtonHandlers() {
  // Demo Login
  const demoButtons = document.querySelectorAll('.social-btn.demo, .quick-social-btn.demo');
  demoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDemoLogin();
    });
  });
}

// Add Demo Login Button
function addDemoLoginButton() {
  // Add demo button to desktop modal
  const socialLoginDesktop = modal?.querySelector('.social-login');
  if (socialLoginDesktop && !socialLoginDesktop.querySelector('.social-btn.demo')) {
    const demoBtn = document.createElement('button');
    demoBtn.className = 'social-btn demo';
    demoBtn.innerHTML = '<i class="ri-code-s-slash-line"></i> Try Demo Login';
    demoBtn.style.background = '#6b7280';
    demoBtn.style.marginTop = '0.5rem';
    socialLoginDesktop.appendChild(demoBtn);
  }
  
  // Add demo button to mobile modal
  const quickSocial = mobileAccountModal?.querySelector('.quick-social');
  if (quickSocial) {
    const quickSocialBtns = quickSocial.querySelector('.quick-social-btns');
    if (quickSocialBtns && !quickSocialBtns.querySelector('.quick-social-btn.demo')) {
      const demoBtn = document.createElement('button');
      demoBtn.className = 'quick-social-btn demo';
      demoBtn.innerHTML = '<i class="ri-code-s-slash-line"></i>';
      demoBtn.style.background = '#6b7280';
      quickSocialBtns.appendChild(demoBtn);
    }
  }
}

// Modal Functions for Desktop
function initDesktopModal() {
  if (!modal || !closeModal) return;
  
  // Open modal from desktop buttons
  signUpBtns.forEach(btn => {
    if (btn.classList.contains('sign-up-btn')) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.innerWidth >= 769) {
          // Desktop: Open main modal directly
          modal.style.display = "block";
          document.body.style.overflow = "hidden";
        }
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
        if (signinForm) signinForm.style.display = 'block';
        if (signupForm) signupForm.style.display = 'none';
      } else {
        if (signinForm) signinForm.style.display = 'none';
        if (signupForm) signupForm.style.display = 'block';
      }
    });
  });
  
  // Switch between forms using links
  switchFormLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      
      // Update active button
      const targetBtn = document.querySelector(`.option-btn[data-option="${target}"]`);
      if (targetBtn) {
        optionBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        
        // Show corresponding form
        if (target === 'signin') {
          if (signinForm) signinForm.style.display = 'block';
          if (signupForm) signupForm.style.display = 'none';
        } else {
          if (signinForm) signinForm.style.display = 'none';
          if (signupForm) signupForm.style.display = 'block';
        }
      }
    });
  });
  
  // Form submissions
  const signinFormEl = document.getElementById('signin-email-form');
  const signupFormEl = document.getElementById('signup-email-form');
  
  if (signinFormEl) {
    signinFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
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
  updateSocialButtonHandlers();
}

// Mobile Account Modal Functions
function initMobileAccountModal() {
  if (!mobileAccountModal || !closeMobileAccountModal) return;
  
  // Open mobile account modal from mobile nav button
  const mobileSignupNav = document.getElementById('mobile-signup-nav');
  if (mobileSignupNav) {
    mobileSignupNav.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only open modal if it's the account button (not user button)
      if (mobileSignupNav.classList.contains('signup-item')) {
        mobileAccountModal.style.display = "block";
        document.body.style.overflow = "hidden";
      }
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
  
  if (signinOption) {
    signinOption.addEventListener('click', () => {
      mobileAccountModal.style.display = "none";
      // Show sign in form in main modal
      if (modal) {
        modal.style.display = "block";
        
        // Switch to sign in form
        const signinBtn = document.querySelector('.option-btn[data-option="signin"]');
        if (signinBtn) signinBtn.click();
      }
    });
  }
  
  if (signupOption) {
    signupOption.addEventListener('click', () => {
      mobileAccountModal.style.display = "none";
      // Show sign up form in main modal
      if (modal) {
        modal.style.display = "block";
        
        // Switch to sign up form
        const signupBtn = document.querySelector('.option-btn[data-option="signup"]');
        if (signupBtn) signupBtn.click();
      }
    });
  }
  
  // Quick social buttons in mobile modal
  const quickSocialBtns = document.querySelectorAll('.quick-social-btn');
  quickSocialBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Show loading
      const modalBody = mobileAccountModal.querySelector('.modal-body');
      const originalContent = modalBody.innerHTML;
      
      modalBody.innerHTML = `
        <div class="loading-auth">
          <i class="ri-loader-4-line animate-spin" style="font-size: 3rem; color: var(--primary-color);"></i>
          <p>Logging in...</p>
        </div>
      `;
      
      // Simulate API call
      setTimeout(() => {
        mobileAccountModal.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Handle demo login
        handleDemoLogin();
        
        // Reset modal content
        setTimeout(() => {
          modalBody.innerHTML = originalContent;
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
    
    // For demo, create a demo user
    const demoUser = {
      id: 'email_' + Date.now(),
      name: document.getElementById('signup-name')?.value || 'User',
      email: document.getElementById('signup-email')?.value || document.getElementById('signin-email')?.value || 'user@example.com',
      provider: 'email',
      loggedInAt: new Date().toISOString()
    };
    
    handleLoginSuccess(demoUser);
    
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
        
        // Reset to 0
        counter.textContent = "0";
        
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
      e.target.closest(".btn")) {
    
    const button = e.target.classList.contains("btn") 
      ? e.target 
      : e.target.closest(".btn");
    
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

// Mobile Responsive Adjustments
function initMobileResponsive() {
  function checkMobile() {
    // No floating mobile signup button needed
  }
  
  // Initial check
  checkMobile();
  
  // Check on resize
  window.addEventListener('resize', checkMobile);
}

// Update Navigation Active State
function updateNavigationActiveState() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // Desktop navigation
  const desktopLinks = document.querySelectorAll('.nav-link');
  desktopLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    // Check for exact page match
    if (href === currentPage) {
      link.classList.add('active');
    }
    // Check for home page (index.html or #home)
    else if ((currentPage === 'index.html' || currentPage === '') && 
             (href === '#home' || href === 'index.html')) {
      link.classList.add('active');
    }
    // Check for about page
    else if (currentPage === 'about.html' && href === 'about.html') {
      link.classList.add('active');
    }
    // Check for courses page
    else if (currentPage === 'courses.html' && href === 'courses.html') {
      link.classList.add('active');
    }
  });
  
  // Mobile navigation
  const mobileLinks = document.querySelectorAll('.mobile-nav__item[href]');
  mobileLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    
    // Check for exact page match
    if (href === currentPage) {
      link.classList.add('active');
    }
    // Check for home page
    else if ((currentPage === 'index.html' || currentPage === '') && 
             (href === '#home' || href === 'index.html')) {
      link.classList.add('active');
    }
    // Check for about page
    else if (currentPage === 'about.html' && href === 'about.html') {
      link.classList.add('active');
    }
    // Check for courses page
    else if (currentPage === 'courses.html' && href === 'courses.html') {
      link.classList.add('active');
    }
  });
}

// Global click handler to close dropdowns when clicking outside
function initGlobalClickHandler() {
  document.addEventListener('click', (e) => {
    // Check if click is on the user dropdown close button
    const closeBtn = e.target.closest('.dropdown-close-btn');
    if (closeBtn) {
      const dropdown = closeBtn.closest('.user-dropdown, .mobile-user-dropdown');
      const overlay = document.querySelector('.dropdown-overlay');
      if (dropdown) dropdown.remove();
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
      return;
    }
    
    // Check if click is on logout button inside dropdown
    const logoutBtn = e.target.closest('.logout-btn');
    if (logoutBtn) {
      const dropdown = logoutBtn.closest('.user-dropdown, .mobile-user-dropdown');
      if (dropdown) dropdown.remove();
      const overlay = document.querySelector('.dropdown-overlay');
      if (overlay) overlay.remove();
      document.body.style.overflow = '';
      return;
    }
    
    // Get all user buttons that could open dropdowns
    const userButtons = document.querySelectorAll('.sign-up-btn, #mobile-signup-nav');
    let isUserButton = false;
    
    // Check if click is on a user button
    userButtons.forEach(btn => {
      if (btn.contains(e.target)) {
        isUserButton = true;
      }
    });
    
    // If click is NOT on a user button AND there's an open dropdown
    if (!isUserButton) {
      const dropdown = document.querySelector('.user-dropdown, .mobile-user-dropdown');
      const overlay = document.querySelector('.dropdown-overlay');
      
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.remove();
        if (overlay) overlay.remove();
        document.body.style.overflow = '';
      }
    }
  });
  
  // Handle Escape key to close dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.querySelector('.user-dropdown, .mobile-user-dropdown');
      const overlay = document.querySelector('.dropdown-overlay');
      
      if (dropdown) {
        dropdown.remove();
        if (overlay) overlay.remove();
        document.body.style.overflow = '';
      }
    }
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initAuthentication();
  initDesktopModal();
  initMobileAccountModal();
  addDemoLoginButton();
  updateSocialButtonHandlers();
  initGlobalClickHandler();
  initBackToTop();
  initCounters();
  initScrollAnimations();
  initSwiper();
  initParallax();
  initMobileResponsive();
  updateNavigationActiveState();
  
  // Update navigation on hash change
  window.addEventListener('hashchange', updateNavigationActiveState);
  
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
    
    .loading-auth {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes dropdownSlideInDesktop {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes dropdownSlideInMobile {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.7);
      transform: scale(0);
      animation: ripple-animation 0.6s linear;
      pointer-events: none;
    }
    
    @keyframes ripple-animation {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    /* Active navigation state styles */
    .nav-link.active {
      color: var(--primary-color) !important;
      background: rgba(var(--primary-color-rgb), 0.1);
    }
    
    .nav-link.active::after {
      width: 60% !important;
    }
    
    .mobile-nav__item.active {
      color: var(--primary-color) !important;
      background: rgba(var(--primary-color-rgb), 0.1) !important;
      transform: translateY(-5px);
    }
    
    .mobile-nav__item.active.signup-item,
    .mobile-nav__item.active.user-item {
      background: linear-gradient(135deg, #ff5e62 0%, var(--primary-color) 100%) !important;
      color: var(--white) !important;
    }
  `;
  document.head.appendChild(style);
  
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
    
    // Demo login with Ctrl+L
    if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      handleDemoLogin();
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
      
      // Close user dropdown
      const dropdown = document.querySelector('.user-dropdown, .mobile-user-dropdown');
      const overlay = document.querySelector('.dropdown-overlay');
      if (dropdown) {
        dropdown.remove();
      }
      if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
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
      updateNavigationActiveState();
    }, 250);
  });
});

// Error handling
window.addEventListener("error", (e) => {
  console.error("Error occurred:", e.error);
  showNotification("An error occurred. Please try again.", "info");
});










