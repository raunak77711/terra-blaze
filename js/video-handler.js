document.addEventListener('DOMContentLoaded', () => {
    const isMobile = window.innerWidth < 768;

    // The hero montage is handled entirely by hero-cinema.js (including
    // its own mobile / Save-Data / reduced-motion fallbacks).

    // 1. Card Hover Autoplay Setup
    const trekCards = document.querySelectorAll('.trek-card');

    trekCards.forEach(card => {
        const video = card.querySelector('.trek-card-video');
        
        if (video) {
            if (isMobile) {
                // Remove video on mobile to save data and memory
                video.remove();
            } else {
                // Ensure video is muted and ready
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                
                card.addEventListener('mouseenter', () => {
                    // Start playing when mouse hovers
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.log("Autoplay was prevented:", error);
                        });
                    }
                });

                card.addEventListener('mouseleave', () => {
                    // Pause when mouse leaves
                    video.pause();
                });
            }
        }
    });

    // 2. Lazy Load Fallback Images or Lazy Load Videos
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src || image.src;
                    imageObserver.unobserve(image);
                }
            });
        });
        lazyImages.forEach(image => imageObserver.observe(image));
    }
});
