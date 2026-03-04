/**
 * Main JavaScript file for Mangalam HDPE Pipes
 * Handles sticky header, mobile menu, image carousel, zoom functionality,
 * FAQ accordion, carousels, and process tabs with full mobile responsiveness
 * 
 * @author Your Name
 * @version 2.0 - Enhanced Mobile Support
 */

// Wait for DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded - Initializing all functionality');
    
    // Initialize all core functionality
    initStickyHeader();
    initMobileMenu();
    initImageCarouselAndZoom();
    initFaqAccordion();
    initApplicationsCarousel();
    initProcessTabs();
    initTestimonialsCarousel();
    initFormValidation();
    initSmoothScroll();
    initTouchOptimizations();
    
    // Handle window resize events
    window.addEventListener('resize', debounce(handleResize, 250));
});

/**
 * Utility function to debounce rapid-fire events like resize
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle window resize events
 */
function handleResize() {
    // Recalculate FAQ heights
    recalcFaqHeights();
    
    // Update carousel button states
    updateCarouselButtons();
    
    // Close mobile menu if open and switching to desktop
    if (window.innerWidth > 768) {
        const navLinks = document.getElementById('navLinks');
        const menuToggle = document.getElementById('mobileMenuToggle');
        const body = document.body;
        
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            body.style.overflow = '';
        }
        if (menuToggle && menuToggle.classList.contains('active')) {
            menuToggle.classList.remove('active');
        }
    }
}

/* =========================================
   1. STICKY HEADER FUNCTIONALITY
   ========================================= */

/**
 * Initialize sticky header with show/hide on scroll
 * Header appears when scrolling up, disappears when scrolling down
 * Only activates after passing the first fold
 */
function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) {
        console.warn('Header element not found');
        return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;
    const stickyThreshold = 300; // Pixels to scroll before header becomes sticky

    /**
     * Optimized scroll handler using requestAnimationFrame
     * Prevents performance issues on mobile devices
     */
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;

                // Only activate sticky after passing threshold
                if (currentScrollY > stickyThreshold) {
                    header.classList.add('sticky');
                    
                    // Smart hide/show based on scroll direction
                    if (currentScrollY < lastScrollY) {
                        // Scrolling UP - show header
                        header.classList.remove('sticky-hidden');
                        header.style.transition = 'transform 0.3s ease-in-out';
                    } else if (currentScrollY > lastScrollY) {
                        // Scrolling DOWN - hide header
                        header.classList.add('sticky-hidden');
                    }
                } else {
                    // Above threshold - reset to normal
                    header.classList.remove('sticky', 'sticky-hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true }); // Use passive for better scroll performance
}

/* =========================================
   2. MOBILE MENU FUNCTIONALITY
   ========================================= */

/**
 * Initialize mobile menu toggle with smooth animations
 * Handles opening/closing of navigation on mobile devices
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;
    
    if (!menuToggle || !navLinks) {
        console.warn('Mobile menu elements not found');
        return;
    }

    // Create overlay for mobile menu
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    body.appendChild(overlay);

    /**
     * Toggle mobile menu open/closed
     */
    function toggleMenu(show) {
        if (show) {
            menuToggle.classList.add('active');
            navLinks.classList.add('active');
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            body.style.overflow = ''; // Restore scrolling
        }
    }

    // Menu toggle click handler
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.contains('active');
        toggleMenu(!isOpen);
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', () => {
        toggleMenu(false);
    });

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMenu(false);
        });
        
        // Touch optimization
        link.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu(false);
        }
    });

    // Prevent clicks inside menu from closing it
    navLinks.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

/* =========================================
   3. IMAGE CAROUSEL WITH ZOOM
   ========================================= */

/**
 * Initialize image carousel with thumbnail navigation
 * and zoom functionality on hover/tap
 */
function initImageCarouselAndZoom() {
    const zoomContainer = document.getElementById('image-zoom-container');
    const mainImg = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (!zoomContainer || !mainImg) {
        console.warn('Image carousel elements not found');
        return;
    }

    // Prepare image list from thumbnails
    const imageList = Array.from(thumbnails).map(thumb => 
        thumb.getAttribute('data-src') || 'images/banner-1.png'
    );
    
    let currentIndex = 0;

    /**
     * Update main image and active thumbnail
     */
    function updateMainImage(index) {
        if (index < 0) index = imageList.length - 1;
        if (index >= imageList.length) index = 0;
        
        currentIndex = index;
        mainImg.src = imageList[index];
        
        // Update active thumbnail
        thumbnails.forEach(t => t.classList.remove('active'));
        if (thumbnails[index]) {
            thumbnails[index].classList.add('active');
        }
        
        // Reset zoom when changing images
        resetZoom();
    }

    /**
     * Reset zoom to normal state
     */
    function resetZoom() {
        mainImg.style.transform = 'scale(1)';
        mainImg.style.transformOrigin = 'center center';
    }

    /* --- THUMBNAIL SETUP --- */
    if (thumbnails.length > 0) {
        thumbnails.forEach((thumb, index) => {
            // Set thumbnail background image
            thumb.style.backgroundImage = `url('${imageList[index]}')`;
            thumb.style.backgroundSize = 'cover';
            thumb.style.backgroundPosition = 'center';
            
            // Click handler for thumbnails
            thumb.addEventListener('click', () => {
                updateMainImage(index);
            });
            
            // Touch handler for mobile
            thumb.addEventListener('touchstart', (e) => {
                e.preventDefault();
                updateMainImage(index);
            }, { passive: false });
        });
    }

    /* --- CAROUSEL NAVIGATION BUTTONS --- */
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            updateMainImage(currentIndex - 1);
        });
        
        nextBtn.addEventListener('click', () => {
            updateMainImage(currentIndex + 1);
        });
        
        // Touch handlers for mobile
        prevBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            updateMainImage(currentIndex - 1);
        }, { passive: false });
        
        nextBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            updateMainImage(currentIndex + 1);
        }, { passive: false });
    }

    /* --- ZOOM FUNCTIONALITY --- */
    
    // Desktop hover zoom
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let zoomTimeout;
        
        zoomContainer.addEventListener('mousemove', (e) => {
            clearTimeout(zoomTimeout);
            
            const rect = zoomContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate zoom position as percentage
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            
            // Apply zoom with smooth transition
            mainImg.style.transition = 'transform 0.1s ease-out';
            mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            mainImg.style.transform = 'scale(2)';
        });

        zoomContainer.addEventListener('mouseleave', () => {
            // Delay reset slightly for smoother experience
            zoomTimeout = setTimeout(resetZoom, 100);
        });
    } 
    // Mobile tap zoom
    else {
        let isZoomed = false;
        let lastTap = 0;
        
        zoomContainer.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            // Double-tap detection
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault();
                
                if (!isZoomed) {
                    const rect = zoomContainer.getBoundingClientRect();
                    const touch = e.touches ? e.touches[0] : e;
                    const x = touch.clientX - rect.left;
                    const y = touch.clientY - rect.top;
                    
                    const xPercent = (x / rect.width) * 100;
                    const yPercent = (y / rect.height) * 100;
                    
                    mainImg.style.transition = 'transform 0.2s ease-out';
                    mainImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                    mainImg.style.transform = 'scale(2)';
                    isZoomed = true;
                } else {
                    resetZoom();
                    isZoomed = false;
                }
            }
            
            lastTap = currentTime;
        });
    }

    /* --- MOBILE SWIPE SUPPORT --- */
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    zoomContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    zoomContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Only handle horizontal swipes (ignore vertical scrolling)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX > 0) {
                // Swipe right - previous image
                updateMainImage(currentIndex - 1);
            } else {
                // Swipe left - next image
                updateMainImage(currentIndex + 1);
            }
        }
    }
}

/* =========================================
   4. FAQ ACCORDION
   ========================================= */

/**
 * Initialize FAQ accordion with smooth animations
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (faqItems.length === 0) {
        console.warn('FAQ items not found');
        return;
    }

    // Initially set active FAQ's answer height
    setTimeout(() => {
        const activeFaq = document.querySelector('.faq-item.active .faq-answer');
        if (activeFaq) {
            activeFaq.style.maxHeight = activeFaq.scrollHeight + 24 + 'px';
        }
    }, 100);

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQs
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                const faqAns = faq.querySelector('.faq-answer');
                if (faqAns) {
                    faqAns.style.maxHeight = null;
                }
            });

            // Open clicked FAQ if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 24 + 'px';
                
                // Smooth scroll to FAQ on mobile
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            }
        });

        // Touch optimization
        questionBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            questionBtn.click();
        }, { passive: false });
    });
}

/**
 * Recalculate FAQ heights on window resize
 */
function recalcFaqHeights() {
    const activeFaq = document.querySelector('.faq-item.active .faq-answer');
    if (activeFaq) {
        activeFaq.style.maxHeight = activeFaq.scrollHeight + 24 + 'px';
    }
}

/* =========================================
   5. APPLICATIONS CAROUSEL
   ========================================= */

/**
 * Initialize applications carousel with navigation buttons
 */
function initApplicationsCarousel() {
    const appCarousel = document.getElementById('applications-carousel');
    const prevAppBtn = document.getElementById('prev-app-btn');
    const nextAppBtn = document.getElementById('next-app-btn');

    if (!appCarousel || !prevAppBtn || !nextAppBtn) {
        console.warn('Applications carousel elements not found');
        return;
    }

    // Scroll amount calculation
    function getScrollAmount() {
        const firstCard = appCarousel.querySelector('.app-card');
        if (!firstCard) return 300; // Default fallback
        
        const cardStyle = window.getComputedStyle(firstCard);
        const cardWidth = firstCard.offsetWidth;
        const gap = parseInt(cardStyle.marginRight) || 24;
        
        return cardWidth + gap;
    }

    // Next button click
    nextAppBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        appCarousel.scrollBy({ 
            left: scrollAmount, 
            behavior: 'smooth' 
        });
    });

    // Previous button click
    prevAppBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        appCarousel.scrollBy({ 
            left: -scrollAmount, 
            behavior: 'smooth' 
        });
    });

    // Touch handlers
    nextAppBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const scrollAmount = getScrollAmount();
        appCarousel.scrollBy({ 
            left: scrollAmount, 
            behavior: 'smooth' 
        });
    }, { passive: false });

    prevAppBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const scrollAmount = getScrollAmount();
        appCarousel.scrollBy({ 
            left: -scrollAmount, 
            behavior: 'smooth' 
        });
    }, { passive: false });

    // Update button states on scroll
    appCarousel.addEventListener('scroll', () => {
        updateCarouselButtons();
    });

    // Initial button update
    setTimeout(updateCarouselButtons, 100);
}

/**
 * Initialize testimonials carousel with auto-scroll
 */
function initTestimonialsCarousel() {
    const testimonialsCarousel = document.getElementById('testimonials-carousel');
    
    if (!testimonialsCarousel) return;
    
    // Auto-scroll functionality (optional)
    let autoScrollInterval;
    let isPaused = false;
    
    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        
        autoScrollInterval = setInterval(() => {
            if (!isPaused && window.innerWidth <= 768) {
                const scrollAmount = testimonialsCarousel.clientWidth * 0.8;
                const maxScroll = testimonialsCarousel.scrollWidth - testimonialsCarousel.clientWidth;
                
                if (testimonialsCarousel.scrollLeft >= maxScroll - 10) {
                    // Reset to beginning
                    testimonialsCarousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    testimonialsCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }, 5000);
    }
    
    // Pause auto-scroll on user interaction
    testimonialsCarousel.addEventListener('touchstart', () => {
        isPaused = true;
        clearInterval(autoScrollInterval);
    }, { passive: true });
    
    testimonialsCarousel.addEventListener('touchend', () => {
        setTimeout(() => {
            isPaused = false;
            startAutoScroll();
        }, 3000);
    }, { passive: true });
    
    // Start auto-scroll on mobile
    if (window.innerWidth <= 768) {
        startAutoScroll();
    }
    
    // Restart on resize if needed
    window.addEventListener('resize', debounce(() => {
        if (window.innerWidth <= 768) {
            startAutoScroll();
        } else {
            clearInterval(autoScrollInterval);
        }
    }, 250));
}

/**
 * Update carousel button states (enable/disable)
 */
function updateCarouselButtons() {
    const appCarousel = document.getElementById('applications-carousel');
    const prevAppBtn = document.getElementById('prev-app-btn');
    const nextAppBtn = document.getElementById('next-app-btn');
    
    if (!appCarousel || !prevAppBtn || !nextAppBtn) return;
    
    const scrollLeft = appCarousel.scrollLeft;
    const maxScroll = appCarousel.scrollWidth - appCarousel.clientWidth;
    
    // Disable prev button if at start
    if (scrollLeft <= 5) {
        prevAppBtn.setAttribute('disabled', 'disabled');
        prevAppBtn.style.opacity = '0.5';
        prevAppBtn.style.cursor = 'not-allowed';
    } else {
        prevAppBtn.removeAttribute('disabled');
        prevAppBtn.style.opacity = '1';
        prevAppBtn.style.cursor = 'pointer';
    }
    
    // Disable next button if at end
    if (scrollLeft >= maxScroll - 5) {
        nextAppBtn.setAttribute('disabled', 'disabled');
        nextAppBtn.style.opacity = '0.5';
        nextAppBtn.style.cursor = 'not-allowed';
    } else {
        nextAppBtn.removeAttribute('disabled');
        nextAppBtn.style.opacity = '1';
        nextAppBtn.style.cursor = 'pointer';
    }
}

/* =========================================
   6. MANUFACTURING PROCESS TABS
   ========================================= */

/**
 * Initialize manufacturing process tabs
 */
function initProcessTabs() {
    const processTabs = document.querySelectorAll('.process-tab');
    const processSteps = document.querySelectorAll('.process-step');

    if (processTabs.length === 0 || processSteps.length === 0) {
        console.warn('Process tabs or steps not found');
        return;
    }

    processTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            processTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all steps
            processSteps.forEach(step => step.classList.remove('active'));
            
            // Show target step
            const targetId = tab.getAttribute('data-target');
            if (targetId) {
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                    
                    // Scroll to content on mobile
                    if (window.innerWidth <= 768) {
                        setTimeout(() => {
                            targetContent.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                            });
                        }, 100);
                    }
                }
            }
        });

        // Touch optimization
        tab.addEventListener('touchstart', (e) => {
            e.preventDefault();
            tab.click();
        }, { passive: false });
    });

    // Make tabs horizontally scrollable on mobile
    const tabsWrapper = document.querySelector('.process-tabs-wrapper');
    if (tabsWrapper && window.innerWidth <= 768) {
        let isDown = false;
        let startX;
        let scrollLeft;

        tabsWrapper.addEventListener('touchstart', (e) => {
            isDown = true;
            startX = e.touches[0].pageX - tabsWrapper.offsetLeft;
            scrollLeft = tabsWrapper.scrollLeft;
        }, { passive: true });

        tabsWrapper.addEventListener('touchend', () => {
            isDown = false;
        }, { passive: true });

        tabsWrapper.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.touches[0].pageX - tabsWrapper.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed
            tabsWrapper.scrollLeft = scrollLeft - walk;
        }, { passive: false });
    }
}

/* =========================================
   7. FORM VALIDATION
   ========================================= */

/**
 * Initialize form validation for all forms
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    highlightInvalidField(input);
                } else {
                    removeHighlight(input);
                }
                
                // Email validation
                if (input.type === 'email' && input.value.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value.trim())) {
                        isValid = false;
                        highlightInvalidField(input, 'Please enter a valid email');
                    }
                }
                
                // Phone validation
                if (input.type === 'tel' && input.value.trim()) {
                    const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
                    if (!phoneRegex.test(input.value.trim())) {
                        isValid = false;
                        highlightInvalidField(input, 'Please enter a valid phone number');
                    }
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Form submitted successfully!', 'success');
                form.reset();
            } else {
                showNotification('Please fill all required fields correctly', 'error');
            }
        });
    });
}

/**
 * Highlight invalid form fields
 */
function highlightInvalidField(field, message = 'This field is required') {
    field.style.borderColor = '#ff4444';
    field.style.backgroundColor = '#fff8f8';
    
    // Add error message if not exists
    let errorMsg = field.parentNode.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.style.cssText = `
            color: #ff4444;
            font-size: 12px;
            margin-top: 4px;
            display: block;
        `;
        field.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
}

/**
 * Remove highlight from form field
 */
function removeHighlight(field) {
    field.style.borderColor = '#eaeaea';
    field.style.backgroundColor = '#ffffff';
    
    const errorMsg = field.parentNode.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Set color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ff4444';
    } else {
        notification.style.backgroundColor = '#283593';
    }
    
    notification.textContent = message;
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

/* =========================================
   8. SMOOTH SCROLL FOR ANCHOR LINKS
   ========================================= */

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* =========================================
   9. TOUCH OPTIMIZATIONS
   ========================================= */

/**
 * Add touch-specific optimizations for mobile
 */
function initTouchOptimizations() {
    // Prevent double-tap zoom on buttons and interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .thumbnail, .carousel-btn');
    
    interactiveElements.forEach(el => {
        el.addEventListener('touchstart', (e) => {
            // Prevent default only if not trying to scroll
            const touchDuration = e.touches[0]?.touchDuration || 0;
            if (touchDuration < 300) {
                e.preventDefault();
            }
        }, { passive: false });
    });
    
    // Add active state for touch feedback
    document.querySelectorAll('.btn-primary, .btn-secondary, .nav-links a').forEach(el => {
        el.addEventListener('touchstart', () => {
            el.classList.add('touch-active');
        }, { passive: true });
        
        el.addEventListener('touchend', () => {
            el.classList.remove('touch-active');
        }, { passive: true });
        
        el.addEventListener('touchcancel', () => {
            el.classList.remove('touch-active');
        }, { passive: true });
    });
    
    // Improve scroll performance on carousels
    const scrollableElements = document.querySelectorAll(
        '.applications-carousel, .testimonials-carousel, .process-tabs-wrapper'
    );
    
    scrollableElements.forEach(el => {
        el.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: true });
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Recalculate any dynamic heights
            recalcFaqHeights();
            
            // Reset any stuck states
            document.querySelectorAll('.touch-active').forEach(el => {
                el.classList.remove('touch-active');
            });
        }, 200);
    });
}

/* =========================================
   10. PERFORMANCE OPTIMIZATIONS
   ========================================= */

// Lazy load images if not already lazy-loaded
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.loading = 'lazy';
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Log initialization complete
console.log('All functionality initialized successfully');