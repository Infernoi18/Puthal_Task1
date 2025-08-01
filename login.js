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
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
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

  console.log("Firebase initialized");

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const googleSignInBtn = document.getElementById("googleSignInBtn");

  const signupForm = document.getElementById("signupForm");
  const signupMessage = document.getElementById("signupMessage");

  if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = document.getElementById("signupName")?.value.trim();
      const email = document.getElementById("signupEmail")?.value.trim();
      const password = document.getElementById("signupPassword")?.value;
      const confirmPassword = document.getElementById("signupConfirmPassword")?.value;


      if (!name || !email || !password || !confirmPassword) {
        signupMessage.textContent = "Please fill all fields.";
        signupMessage.style.color = "red";
        return;
      }

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

        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        // Show dashboard section
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) dashboardSection.style.display = 'block';

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
  });
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut(auth);
      hideDashboard();
    });
  }
});
