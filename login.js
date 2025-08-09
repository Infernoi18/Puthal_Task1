import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Ensure page is fully loaded before initializing
window.addEventListener("load", () => {
  document.body.style.visibility = "visible";
});

document.addEventListener("DOMContentLoaded", () => {
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyDnAVJ7Imx-KPa2EV8PsOzFKXEYDh6aCIA",
      authDomain: "puthal1.firebaseapp.com",
      projectId: "puthal1",
      storageBucket: "puthal1.appspot.com",
      messagingSenderId: "514414880888",
      appId: "1:514414880888:web:e0f9c2f20b661dee99e58d"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Ensure page still loads even if Firebase fails
    document.body.style.visibility = "visible";
  }

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  // Reset form elements
  const resetForm = document.getElementById("resetForm");
  const resetEmailInput = document.getElementById("resetEmail");
  const resetMessage = document.getElementById("resetMessage");
  const resetSubmitBtn = document.getElementById("resetSubmitBtn");
  const openResetLink = document.getElementById("openResetModal");

  // Simple cooldown to prevent multiple reset emails rapidly
  const COOLDOWN_SECONDS = 60;
  let resetCooldownInterval = null;
  const COOLDOWN_KEY = "resetCooldownUntil";

  function getCooldownRemainingSeconds() {
    const until = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
    const now = Date.now();
    const diffMs = until - now;
    return diffMs > 0 ? Math.ceil(diffMs / 1000) : 0;
  }

  function clearCooldownInterval() {
    if (resetCooldownInterval) {
      clearInterval(resetCooldownInterval);
      resetCooldownInterval = null;
    }
  }

  function applyCooldownUI() {
    const remaining = getCooldownRemainingSeconds();
    if (!resetSubmitBtn) return;
    if (!resetSubmitBtn.dataset.originalText) {
      resetSubmitBtn.dataset.originalText = resetSubmitBtn.textContent || "Send Reset Link";
    }
    if (remaining > 0) {
      resetSubmitBtn.disabled = true;
      resetSubmitBtn.textContent = `Wait ${remaining}s`;
      clearCooldownInterval();
      resetCooldownInterval = setInterval(() => {
        const r = getCooldownRemainingSeconds();
        if (r > 0) {
          resetSubmitBtn.textContent = `Wait ${r}s`;
        } else {
          clearCooldownInterval();
          resetSubmitBtn.disabled = false;
          resetSubmitBtn.textContent = resetSubmitBtn.dataset.originalText;
        }
      }, 1000);
    } else {
      clearCooldownInterval();
      resetSubmitBtn.disabled = false;
      resetSubmitBtn.textContent = resetSubmitBtn.dataset.originalText;
    }
  }

  function startCooldown() {
    const until = Date.now() + COOLDOWN_SECONDS * 1000;
    localStorage.setItem(COOLDOWN_KEY, String(until));
    applyCooldownUI();
  }

  // Initialize cooldown state on load
  applyCooldownUI();
  // Sync cooldown UI when opening the reset modal
  if (openResetLink) {
    openResetLink.addEventListener("click", () => {
      setTimeout(applyCooldownUI, 0);
    });
  }
  // Signup form elements
  const signupForm = document.getElementById("signupForm");
  const signupMessage = document.getElementById("signupMessage");
  // Signup logic
  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("signupName")?.value.trim();
      const email = document.getElementById("signupEmail")?.value.trim();
      const password = document.getElementById("signupPassword")?.value;
      const confirmPassword = document.getElementById("signupConfirmPassword")?.value;

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        signupMessage.textContent = "Please fill all fields.";
        signupMessage.style.color = "red";
        return;
      }
      // Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        signupMessage.textContent = "Invalid email format.";
        signupMessage.style.color = "red";
        return;
      }
      if (password.length < 8) {
        signupMessage.textContent = "Password should be at least 8 characters.";
        signupMessage.style.color = "red";
        return;
      }
      if (password !== confirmPassword) {
        signupMessage.textContent = "Passwords do not match.";
        signupMessage.style.color = "red";
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(userCredential.user, { displayName: name });
        signupMessage.innerHTML = '<span class="success-tick">✔️</span> Signup successful! Redirecting...';
        signupMessage.style.color = "#28a745";
        setTimeout(() => {

          const signupModal = document.getElementById('signupModal');
          if (signupModal) signupModal.style.display = 'none';
          const dashboardSection = document.getElementById('dashboardSection');
          if (dashboardSection) dashboardSection.style.display = 'block';
        }, 1200);
      } catch (error) {
        console.error("Signup error:", error.code, error.message);
        let msg = error.message;
        if (error.code === 'auth/email-already-in-use') msg = 'Email already in use.';
        signupMessage.textContent = `Signup failed: ${msg}`;
        signupMessage.style.color = "red";
      }
    });
  }
  // Google sign-in logic
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);

        const user = result.user;
        console.log("Google sign-in successful:", user);
        loginMessage.innerHTML = '<span class="success-tick">✔️</span> Google sign-in successful!';
        loginMessage.style.color = "#28a745";
        setTimeout(() => {
          const loginModal = document.getElementById('loginModal');
          if (loginModal) loginModal.style.display = 'none';
          const dashboardSection = document.getElementById('dashboardSection');
          if (dashboardSection) dashboardSection.style.display = 'block';
        }, 1000);
      } catch (error) {
        console.error("Google sign-in error:", error.code, error.message);
        loginMessage.textContent = `Google sign-in failed: ${error.message}`;
        loginMessage.style.color = "red";
      }
    });
  }

  // Password reset logic
  if (resetForm) {
    resetForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      // Guard against rapid repeat requests
      const remaining = getCooldownRemainingSeconds();
      if (remaining > 0) {
        if (resetMessage) {
          resetMessage.textContent = `Please wait ${remaining}s before requesting again.`;
          resetMessage.style.color = "#e53935";
        }
        applyCooldownUI();
        return;
      }
      const email = resetEmailInput?.value?.trim();
      if (!email) {
        if (resetMessage) {
          resetMessage.textContent = "Please enter your email.";
          resetMessage.style.color = "red";
        }
        return;
      }
      if (resetSubmitBtn) {
        resetSubmitBtn.disabled = true;
        if (!resetSubmitBtn.dataset.originalText) {
          resetSubmitBtn.dataset.originalText = resetSubmitBtn.textContent || "Send Reset Link";
        }
        resetSubmitBtn.textContent = "Sending...";
      }
      try {
        await sendPasswordResetEmail(auth, email);
        if (resetMessage) {
          resetMessage.textContent = "If an account exists for this email, a reset link has been sent. Please check your inbox.";
          resetMessage.style.color = "#28a745";
        }
        if (resetEmailInput) {
          resetEmailInput.value = "";
        }
        startCooldown();
      } catch (error) {
        console.error("Password reset error:", error.code, error.message);
        // Keep message generic for security
        if (resetMessage) {
          resetMessage.textContent = "If an account exists for this email, a reset link has been sent. Please check your inbox.";
          resetMessage.style.color = "#28a745";
        }
        if (resetEmailInput) {
          resetEmailInput.value = "";
        }
        startCooldown();
      }
    });
  }

  if (!loginForm) {
    console.error("Login form not found!");
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail")?.value;
    const password = document.getElementById("loginPassword")?.value;
    const rememberMe = document.getElementById("rememberMe")?.checked;

    if (!email || !password) {
      loginMessage.textContent = "Please fill both email and password.";
      loginMessage.style.color = "red";
      return;
    }

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } catch (err) {
      console.error("Persistence error:", err);
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user);
      loginMessage.innerHTML = `<span class='success-tick'>✔️</span> Welcome back, ${userCredential.user.displayName || "User"}!`;
      loginMessage.style.color = "#28a745";

      const welcomeBar = document.getElementById('welcomeBar');
      const navbarUser = document.getElementById('navbarUser');
      const loginBtn = document.querySelector('.login-btn');
      if (welcomeBar) {
        welcomeBar.innerHTML = `<span class='success-tick'>✔️</span> Welcome, ${userCredential.user.displayName || "User"}!`;
        welcomeBar.style.display = 'block';
      }
      if (navbarUser) {
        navbarUser.textContent = userCredential.user.displayName || "User";
        navbarUser.style.display = 'block';
      }
      if (loginBtn) {
        loginBtn.style.display = 'none';
      }
      setTimeout(() => {
        // Hide login modal if present
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        // Show dashboard section
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) dashboardSection.style.display = 'block';
        // Hide green tick after 3 seconds
        if (loginMessage) loginMessage.textContent = '';
        if (welcomeBar) welcomeBar.style.display = 'none';
      }, 3000);
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      let msg = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') msg = 'Invalid Credentials.';
      loginMessage.textContent = `Login failed: ${msg}`;
      loginMessage.style.color = "red";
    }
  });


  const dashboardSection = document.getElementById('dashboardSection');
  const logoutBtn = document.getElementById('logoutBtn');
  function showDashboard() {
    if (dashboardSection) dashboardSection.style.display = 'block';
  }
  function hideDashboard() {
    if (dashboardSection) dashboardSection.style.display = 'none';
  }
  
  onAuthStateChanged(auth, (user) => {
    try {
      console.log("onAuthStateChanged user:", user);
      const welcomeBar = document.getElementById('welcomeBar');
      const navbarUser = document.getElementById('navbarUser');
      const loginBtn = document.querySelector('.login-btn');
      const loginModal = document.getElementById('loginModal');
      const signupModal = document.getElementById('signupModal');
      const dummyProfileBtn = document.getElementById('dummyProfileBtn');
      const dummyProfileImg = document.getElementById('dummyProfileImg');
      if (user) {
        showDashboard();

        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
          const h2 = dashboardSection.querySelector('h2');
          if (h2 && user.displayName) {
            h2.textContent = `Welcome, ${user.displayName}!`;
          }
        }
        // Show welcome bar and navbar user
        if (welcomeBar) {
          welcomeBar.innerHTML = `<span class='success-tick'>✔️</span> Welcome, ${user.displayName || "User"}!`;
          welcomeBar.style.display = 'block';
          setTimeout(() => { welcomeBar.style.display = 'none'; }, 3000);
        }
        if (navbarUser) {
          navbarUser.textContent = user.displayName || "User";
          navbarUser.style.display = 'block';
        }
        if (loginBtn) {
          loginBtn.style.display = 'none';
        }
        if (loginModal) {
          loginModal.style.display = 'none';
        }
        if (signupModal) {
          signupModal.style.display = 'none';
        }

        if (dummyProfileBtn && dummyProfileImg) {
          dummyProfileBtn.style.display = 'flex';

          const imgSrc = localStorage.getItem('profileImg') || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=7b6cf6&color=fff`;
          dummyProfileImg.src = imgSrc;
        }
      } else {
        hideDashboard();
        if (welcomeBar) welcomeBar.style.display = 'none';
        if (navbarUser) navbarUser.style.display = 'none';
        if (loginBtn) {
          loginBtn.style.display = '';
        }
        if (dummyProfileBtn) {
          dummyProfileBtn.style.display = 'none';
        }
      }
    } catch (error) {
      console.error("Auth state change error:", error);
    }
  });
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      hideDashboard();
    });
  }
});
