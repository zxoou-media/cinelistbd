document.addEventListener('DOMContentLoaded', () => {
  // Scroll to top button (optional enhancement)
  const scrollBtn = document.createElement('button');
  scrollBtn.textContent = '↑ উপরে যান';
  scrollBtn.className = 'scroll-top-btn';
  scrollBtn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ffcc00;
    color: #111;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    display: none;
    z-index: 1000;
  `;
  document.body.appendChild(scrollBtn);

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  // Highlight related movies (if section exists)
  const relatedSection = document.querySelector('.related-movies');
  if (relatedSection) {
    relatedSection.style.borderTop = '1px solid #444';
    relatedSection.style.paddingTop = '20px';
  }

  // Optional: Animate screenshots on hover
  const screenshots = document.querySelectorAll('.info img');
  screenshots.forEach(img => {
    img.style.transition = 'transform 0.3s ease';
    img.addEventListener('mouseover', () => {
      img.style.transform = 'scale(1.05)';
    });
    img.addEventListener('mouseout', () => {
      img.style.transform = 'scale(1)';
    });
  });
});