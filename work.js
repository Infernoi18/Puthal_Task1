function setupHamburgerMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
    });
  }
}


function setupNavbarLinks() {
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const text = link.textContent.trim().toLowerCase();
      if (text === 'login') {
        e.preventDefault();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'flex';
        return;
      }

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  const quickLinks = document.querySelectorAll('.quick-links a');
  quickLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const text = link.textContent.trim().toLowerCase();
      if (text === 'home') {
        e.preventDefault();
        window.location.href = window.location.pathname;
      } else if (text === 'about us' || text === 'features' || text === 'join us') {
        e.preventDefault();
        loadSection(text.replace(' ', '').replace('us', ''));
      } else if (text === 'login') {
        e.preventDefault();
        window.location.href = 'login.html';
      }
    });
  });
}


function setupFooterLinks() {
  const footer = document.querySelector('footer');
  if (!footer) return;

  const quickLinks = footer.querySelectorAll('.quick-links a');
  quickLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const section = document.querySelector(href);
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  // SupportLinks
  const supportLinks = footer.querySelectorAll('.support-links a');
  supportLinks.forEach(link => {
    link.addEventListener('click', (e) => {

      if (!link.href.startsWith('mailto:')) e.preventDefault();
    });
  });

  const connectLinks = footer.querySelectorAll('.connect-links a');
  connectLinks.forEach(link => {
    link.addEventListener('click', (e) => {

      if (!link.href.startsWith('mailto:')) e.preventDefault();

      if (link.href.startsWith('http')) {
        window.open(link.href, '_blank');
      }
    });
  });
}

// Auth form handling
function setupAuthForm() {
  const signInForm = document.getElementById('signInForm');
  const authMessage = document.getElementById('authMessage');
  if (signInForm) {
    signInForm.addEventListener('submit', function(e) {
      e.preventDefault();
      authMessage.textContent = '';
      const email = document.getElementById('signInEmail').value.trim();
      const password = document.getElementById('signInPassword').value;
  
      if (email && password) {
        authMessage.style.color = '#28a745';
        authMessage.textContent = 'Signed in successfully! (Demo: connect to Firebase)';
      } else {
        authMessage.style.color = '#e53935';
        authMessage.textContent = 'Sign-in failed. Please try again.';
      }
    });
  }
}



const loginModal = document.getElementById('loginModal');
const openLoginModalBtn = document.getElementById('openLoginModal');
const closeLoginModalBtn = document.getElementById('closeLoginModal');

if (openLoginModalBtn) {
  openLoginModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (loginModal) loginModal.style.display = 'flex';
  });
}
if (closeLoginModalBtn) {
  closeLoginModalBtn.addEventListener('click', () => {
    if (loginModal) loginModal.style.display = 'none';
  });
}
window.onclick = function(event) {
  if (event.target === loginModal) loginModal.style.display = 'none';
};


window.addEventListener('DOMContentLoaded', function() {
  setupHamburgerMenu();
  setupNavbarLinks();
  setupFooterLinks();
  setupAuthForm();
});
