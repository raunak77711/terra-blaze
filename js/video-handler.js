document.addEventListener('DOMContentLoaded', () => {
    // 1. Accessibility Control: Play/Pause Hero Video
    const heroVideo = document.querySelector('.hero-video');
    const videoControlBtn = document.querySelector('.video-control-btn');

    if (heroVideo && videoControlBtn) {
        // SVG Icon contents
        const playIcon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
        const pauseIcon = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

        videoControlBtn.addEventListener('click', () => {
            if (heroVideo.paused) {
                heroVideo.play();
                videoControlBtn.innerHTML = pauseIcon;
                videoControlBtn.setAttribute('aria-label', 'Pause Video');
            } else {
                heroVideo.pause();
                videoControlBtn.innerHTML = playIcon;
                videoControlBtn.setAttribute('aria-label', 'Play Video');
            }
        });
    }

    // 2. Card Hover Autoplay Setup
    const trekCards = document.querySelectorAll('.trek-card');
    const isMobile = window.innerWidth < 768;

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

    // 3. Lazy Load Fallback Images or Lazy Load Videos
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
