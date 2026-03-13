// --- Mobile Navigation Toggle ---
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links li a');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Toggle icon (bars to times)
    const icon = menuToggle.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when a link is clicked
navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});


// --- Sticky Header Style on Scroll ---
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


// --- Setup Scroll Reveal Animations ---
// We use Intersection Observer to add the 'active' class when elements enter viewport
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Optional: Unobserve if you only want the animation to happen once
            // observer.unobserve(entry.target);
        } else {
            // Remove the class if you want the animation to happen every time you scroll up/down
            entry.target.classList.remove('active');
        }
    });
};

const revealOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Trigger when 15% of the element is visible
};

const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

revealElements.forEach(el => {
    revealObserver.observe(el);
});


// --- Active Link Highlighting on Scroll ---
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    
    // Reverse iterating or standard iterating to find the most correctly visible section
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Offset by a bit so active state triggers slightly before hitting the absolute top
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current)) {
            item.classList.add('active');
        }
    });
});


// --- Form Submission Prevention (Static Site) ---
const form = document.getElementById('contactForm');
if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Change button text to indicate submission success
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        
        btn.textContent = 'Message Sent!';
        btn.style.background = 'linear-gradient(90deg, #10B981, #059669)'; // Green gradient
        btn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
        
        form.reset();
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = ''; // Reset to CSS defined
            btn.style.boxShadow = '';
        }, 3000);
    });
}


// --- In-Page Edit Functionality ---
document.addEventListener('DOMContentLoaded', () => {

    const managedConfig = [
        { containerQuery: '.tags', itemQuery: '.tag', btnTag: 'span', btnClass: 'tag add-managed-btn', btnText: '<i class="fas fa-plus"></i> Add Tag' },
        { containerQuery: '.skill-list', itemQuery: 'li', btnTag: 'li', btnClass: 'add-managed-btn text-center mt-2', btnText: '<i class="fas fa-plus"></i> Add Skill', style: 'list-style:none; color:var(--primary); cursor:pointer;' },
        { containerQuery: '.timeline', itemQuery: '.timeline-item', btnTag: 'div', btnClass: 'btn btn-secondary add-managed-btn mt-2', btnText: '<i class="fas fa-plus"></i> Add Project', style: 'margin-left:50px;' },
        { containerQuery: '.education-content', itemQuery: '.edu-card', btnTag: 'div', btnClass: 'btn btn-secondary add-managed-btn mt-2', btnText: '<i class="fas fa-plus"></i> Add Education' },
        { containerQuery: '.sports-grid', itemQuery: '.sports-card', btnTag: 'div', btnClass: 'btn btn-secondary add-managed-btn mt-2', btnText: '<i class="fas fa-plus"></i> Add Achievement' }
    ];

    // Restore Managed Containers
    managedConfig.forEach((config) => {
        const containers = document.querySelectorAll(config.containerQuery);
        containers.forEach((container, i) => {
            container.dataset.managedType = config.containerQuery;
            container.dataset.managedIndex = i;
            
            const saved = localStorage.getItem(`portfolio_managed_${config.containerQuery}_${i}`);
            if (saved !== null) {
                container.innerHTML = saved;
            }
            
            cleanupContainer(container);
            
            container.addEventListener('input', () => {
                if(isEditing) saveContainer(container);
            });
        });
    });

    // Setup Simple Elements
    const simpleEls = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span:not(.tag):not(.bg-text), .timeline-date, .info-value, .logo a, .nav-links a');
    simpleEls.forEach((el, index) => {
        if (el.closest('.contact-form') || el.closest('i') || el.classList.contains('fas') || el.closest('button')) return;
        
        let isManaged = false;
        managedConfig.forEach(c => {
            if (el.closest(c.containerQuery)) isManaged = true;
        });
        
        if (!isManaged) {
            const editId = 'simple-edit-' + index;
            el.setAttribute('data-editable-id', editId);
            el.classList.add('editable-simple');
            const saved = localStorage.getItem('portfolio_' + editId);
            if (saved !== null) el.innerHTML = saved;
            
            el.addEventListener('input', () => {
                if(isEditing) localStorage.setItem('portfolio_' + editId, el.innerHTML);
            });
        }
    });

    function saveContainer(container) {
        const clone = container.cloneNode(true);
        cleanupContainer(clone);
        localStorage.setItem(`portfolio_managed_${container.dataset.managedType}_${container.dataset.managedIndex}`, clone.innerHTML);
    }

    function cleanupContainer(c) {
        c.querySelectorAll('.add-managed-btn').forEach(b => b.remove());
        c.querySelectorAll('.delete-managed-btn').forEach(b => b.remove());
        c.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        c.querySelectorAll('.editing-active').forEach(el => el.classList.remove('editing-active'));
    }

    let isEditing = false;
    let clickCount = 0;
    let clickTimer = null;
    let saveBtn = null;

    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => clickCount = 0, 1000);
            if (clickCount >= 5) {
                e.preventDefault();
                clickCount = 0;
                toggleEditMode();
            }
        });
    }

    function toggleEditMode() {
        isEditing = !isEditing;
        
        if (isEditing) {
            document.querySelectorAll('.editable-simple').forEach(el => {
                el.setAttribute('contenteditable', 'true');
                el.classList.add('editing-active');
            });
            
            managedConfig.forEach(config => {
                document.querySelectorAll(config.containerQuery).forEach(container => {
                    const texts = container.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, .timeline-date, .info-value, .tag');
                    texts.forEach(t => {
                        if (!t.closest('.add-managed-btn') && !t.classList.contains('fas') && !t.classList.contains('delete-managed-btn')) {
                            t.setAttribute('contenteditable', 'true');
                            t.classList.add('editing-active');
                        }
                    });

                    const items = container.querySelectorAll(config.itemQuery);
                    items.forEach(item => {
                        if (item.classList.contains('add-managed-btn')) return;
                        item.style.position = 'relative'; 
                        
                        const delBtn = document.createElement('span');
                        delBtn.innerHTML = '&times;';
                        delBtn.className = 'delete-managed-btn';
                        delBtn.contentEditable = 'false';
                        
                        delBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            item.remove();
                            saveContainer(container);
                        });
                        item.appendChild(delBtn);
                    });

                    if (!container.querySelector('.add-managed-btn')) {
                        const addBtn = document.createElement(config.btnTag);
                        addBtn.className = config.btnClass;
                        addBtn.innerHTML = config.btnText;
                        addBtn.contentEditable = 'false';
                        if (config.style) addBtn.style.cssText = config.style;
                        
                        addBtn.addEventListener('click', () => {
                            const existingItem = Array.from(container.querySelectorAll(config.itemQuery)).find(i => !i.classList.contains('add-managed-btn'));
                            if (existingItem) {
                                const clone = existingItem.cloneNode(true);
                                clone.querySelectorAll('.delete-managed-btn').forEach(b => b.remove());
                                
                                const delBtn = document.createElement('span');
                                delBtn.innerHTML = '&times;';
                                delBtn.className = 'delete-managed-btn';
                                delBtn.contentEditable = 'false';
                                delBtn.addEventListener('click', (e) => {
                                    e.stopPropagation();
                                    clone.remove();
                                    saveContainer(container);
                                });
                                clone.appendChild(delBtn);
                                
                                const cloneTexts = clone.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, .timeline-date, .info-value, .tag');
                                cloneTexts.forEach(t => {
                                    if(!t.classList.contains('fas') && !t.classList.contains('delete-managed-btn')){
                                        t.setAttribute('contenteditable', 'true');
                                        t.classList.add('editing-active');
                                    }
                                });
                                if (['span','li'].includes(clone.tagName.toLowerCase())) {
                                    clone.setAttribute('contenteditable', 'true');
                                    clone.classList.add('editing-active');
                                }

                                container.insertBefore(clone, addBtn);
                                saveContainer(container);
                            } else {
                                alert("Cannot add new item when all items are deleted. Refresh the page to clear local storage if you are stuck.");
                            }
                        });
                        container.appendChild(addBtn);
                    }
                });
            });

            if (!saveBtn) {
                saveBtn = document.createElement('button');
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
                saveBtn.className = 'btn btn-primary edit-save-btn';
                Object.assign(saveBtn.style, {
                    position: 'fixed', bottom: '30px', right: '30px', zIndex: '10000',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', background: 'linear-gradient(90deg, #10B981, #059669)', cursor: 'pointer'
                });
                saveBtn.addEventListener('click', toggleEditMode);
                document.body.appendChild(saveBtn);
            } else {
                saveBtn.style.display = 'block';
            }
            showNotification('Edit Mode Enabled. Add, delete, and modify elements.');
            
        } else {
            document.querySelectorAll('.editing-active').forEach(el => {
                el.removeAttribute('contenteditable');
                el.classList.remove('editing-active');
            });
            document.querySelectorAll('.add-managed-btn, .delete-managed-btn').forEach(el => el.remove());
            if (saveBtn) saveBtn.style.display = 'none';
            showNotification('Profile updates saved to your browser!');
        }
    }
    
    // 5. Utility notification banner
    function showNotification(msg) {
        let notif = document.getElementById('editNotif');
        if(!notif) {
            notif = document.createElement('div');
            notif.id = 'editNotif';
            Object.assign(notif.style, {
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 23, 42, 0.9)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '30px',
                zIndex: '10000',
                fontSize: '0.95rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                opacity: '0',
                pointerEvents: 'none',
                fontFamily: 'var(--font-main)'
            });
            document.body.appendChild(notif);
        }
        notif.textContent = msg;
        
        // Animate in
        requestAnimationFrame(() => {
            notif.style.opacity = '1';
            notif.style.transform = 'translate(-50%, 10px)';
        });
        
        // Hide after 3 secs
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(-50%)';
        }, 3000);
    }
});
