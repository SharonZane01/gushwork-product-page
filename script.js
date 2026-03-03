document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Sticky Header Functionality --- */
    const header = document.getElementById('header');
    if (header) { // SAFETY CHECK: Only run if header exists
        let lastScrollY = window.scrollY;
        const stickyThreshold = 300; 

        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > stickyThreshold) {
                header.classList.add('sticky');
                
                // Smart Sticky logic: hides when scrolling down, shows scrolling up
                if (currentScrollY < lastScrollY) {
                    header.classList.remove('sticky-hidden');
                } else {
                    header.classList.add('sticky-hidden');
                }
            } else {
                // Above the fold reset
                header.classList.remove('sticky', 'sticky-hidden');
            }
            
            lastScrollY = currentScrollY;
        });
    }

    /* --- 2. Image Carousel with Zoom Functionality --- */
    const zoomContainer = document.getElementById('image-zoom-container');
    const mainImg = document.getElementById('main-product-image');
    
    if (zoomContainer && mainImg) {
        // Zoom Effect Logic
        zoomContainer.addEventListener('mousemove', (e) => {
            const rect = zoomContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            
            mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            mainImg.style.transform = 'scale(2)'; // Zoom magnitude
        });

        // Reset zoom
        zoomContainer.addEventListener('mouseleave', () => {
            mainImg.style.transformOrigin = 'center center';
            mainImg.style.transform = 'scale(1)';
        });
    }

    /* --- 3. Carousel Navigation Logic --- */
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (thumbnails.length > 0 && mainImg) { // Added mainImg check
        const imageList = Array.from(thumbnails).map(thumb => thumb.getAttribute('data-src'));
        let currentIndex = 0;

        thumbnails.forEach((thumb, index) => {
            thumb.style.backgroundImage = `url(${imageList[index]})`;
            
            thumb.addEventListener('click', () => {
                updateMainImage(index);
            });
        });

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                let newIndex = currentIndex - 1;
                if (newIndex < 0) newIndex = imageList.length - 1;
                updateMainImage(newIndex);
            });

            nextBtn.addEventListener('click', () => {
                let newIndex = currentIndex + 1;
                if (newIndex >= imageList.length) newIndex = 0;
                updateMainImage(newIndex);
            });
        }

        function updateMainImage(index) {
            currentIndex = index;
            mainImg.src = imageList[index];
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnails[index].classList.add('active');
        }
    }

    /* --- 4. FAQ Accordion --- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (questionBtn && answer) { // SAFETY CHECK
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all
                faqItems.forEach(faq => {
                    faq.classList.remove('active');
                    const faqAns = faq.querySelector('.faq-answer');
                    if (faqAns) faqAns.style.maxHeight = null;
                });

                // Open clicked
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 24 + "px";
                }
            });
        }
    });
    
    window.addEventListener('load', () => {
        const activeFaq = document.querySelector('.faq-item.active .faq-answer');
        if (activeFaq) {
            activeFaq.style.maxHeight = activeFaq.scrollHeight + 24 + "px";
        }
    });

    /* --- 5. Applications Carousel Scroll --- */
    const appCarousel = document.getElementById('applications-carousel');
    const prevAppBtn = document.getElementById('prev-app-btn');
    const nextAppBtn = document.getElementById('next-app-btn');

    if (appCarousel && prevAppBtn && nextAppBtn) {
        nextAppBtn.addEventListener('click', () => {
            const firstCard = appCarousel.querySelector('.app-card');
            if (firstCard) { // SAFETY CHECK
                const cardWidth = firstCard.offsetWidth;
                appCarousel.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
            }
        });

        prevAppBtn.addEventListener('click', () => {
            const firstCard = appCarousel.querySelector('.app-card');
            if (firstCard) { // SAFETY CHECK
                const cardWidth = firstCard.offsetWidth;
                appCarousel.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
            }
        });
    }

    /* --- 6. Process Tabs --- */
    const processTabs = document.querySelectorAll('.process-tab');
    const processSteps = document.querySelectorAll('.process-step');

    processTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            processTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            processSteps.forEach(step => step.classList.remove('active'));
            
            const targetId = tab.getAttribute('data-target');
            if (targetId) { // SAFETY CHECK
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            }
        });
    });
});