document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Nav Drawer Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Adjust hamburger lines color when menu is active on transparent header
            const hamburgerLines = document.querySelectorAll('.hamburger-line');
            if (navLinks.classList.contains('active')) {
                hamburgerLines.forEach(line => line.style.backgroundColor = '#ffffff');
            } else if (!header.classList.contains('scrolled')) {
                hamburgerLines.forEach(line => line.style.backgroundColor = '#ffffff');
            } else {
                hamburgerLines.forEach(line => line.style.backgroundColor = '#0f3d5c');
            }
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // 3. Simple Form Validations (Lead Capture)
    const enquiryForms = document.querySelectorAll('form');
    
    enquiryForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Extract values
            const nameInput = form.querySelector('[name="name"]');
            const emailInput = form.querySelector('[name="email"]');
            const countryInput = form.querySelector('[name="country"]');
            const trekInput = form.querySelector('[name="trek"]');
            const dateInput = form.querySelector('[name="date"]');
            const messageInput = form.querySelector('[name="message"]');
            
            let isValid = true;
            let errorMessage = '';

            // Name validation
            if (nameInput && nameInput.value.trim() === '') {
                isValid = false;
                errorMessage += '- Please enter your name.\n';
                nameInput.style.borderColor = '#ef4444';
            } else if (nameInput) {
                nameInput.style.borderColor = '';
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value.trim())) {
                isValid = false;
                errorMessage += '- Please enter a valid email address.\n';
                emailInput.style.borderColor = '#ef4444';
            } else if (emailInput) {
                emailInput.style.borderColor = '';
            }

            // Trek select validation (if present)
            if (trekInput && (trekInput.value === '' || trekInput.value === 'choose')) {
                isValid = false;
                errorMessage += '- Please select a trek from the list.\n';
                trekInput.style.borderColor = '#ef4444';
            } else if (trekInput) {
                trekInput.style.borderColor = '';
            }

            if (!isValid) {
                alert('Please correct the errors in the form:\n\n' + errorMessage);
                return;
            }

            // Successful submit mock
            const successMessage = 'Enquiry submitted successfully!\n\nThank you for contacting TerraBlaze Adventures. We will get back to you within 24 hours via email or WhatsApp.';
            alert(successMessage);
            form.reset();
        });
    });

    // 4. Day-by-Day Accordion Handler for Trek Detail Pages
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = item.querySelector('.accordion-content');
            
            // Toggle active class
            item.classList.toggle('active');
            
            if (item.classList.contains('active')) {
                // Open panel (scroll height)
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                // Close panel
                content.style.maxHeight = '0';
            }
            
            // Close other accordions in the same list (optional, but premium feel)
            const allItems = item.parentElement.querySelectorAll('.accordion-item');
            allItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.accordion-content').style.maxHeight = '0';
                }
            });
        });
    });
});
