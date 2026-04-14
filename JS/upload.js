function uploadFile(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (input.files.length > 0) {
        const file = input.files[0];
        const key = listId;
        let files = JSON.parse(localStorage.getItem(key) || '[]');
        files.push(file.name);
        localStorage.setItem(key, JSON.stringify(files));
        renderChapters(key);
    }
}
// Load on page load
window.onload = function() {
    renderChaptersAll();

    // Initialize search functionality
    initSearch();
    initDarkMode();
};

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (!searchInput || !searchBtn) return;

    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const courseBoxes = document.querySelectorAll('.course-box');
        const subjectBoxes = document.querySelectorAll('.subject-box');
        const semesterSections = document.querySelectorAll('.semester');

        function resetSubjects() {
            subjectBoxes.forEach(box => {
                box.style.display = 'block';
                box.style.opacity = '1';
                box.style.transform = 'scale(1)';
            });
            semesterSections.forEach(section => {
                section.style.display = '';
            });
        }

        if (!query) {
            courseBoxes.forEach(box => {
                box.style.display = 'block';
                box.style.opacity = '1';
                box.style.transform = 'scale(1)';
            });
            resetSubjects();
            return;
        }

        if (courseBoxes.length) {
            courseBoxes.forEach(box => {
                const title = (box.querySelector('h1') ? .textContent || '').toLowerCase();
                const subtitle = (box.querySelector('h3') ? .textContent || '').toLowerCase();

                if (title.includes(query) || subtitle.includes(query)) {
                    box.style.display = 'block';
                    box.style.opacity = '1';
                    box.style.transform = 'scale(1)';
                } else {
                    box.style.display = 'none';
                    box.style.opacity = '0';
                    box.style.transform = 'scale(0.95)';
                }
            });
        }

        if (subjectBoxes.length) {
            subjectBoxes.forEach(box => {
                const subjectText = (box.querySelector('p') ? .textContent || '').toLowerCase();
                if (subjectText.includes(query)) {
                    box.style.display = 'block';
                    box.style.opacity = '1';
                    box.style.transform = 'scale(1)';
                } else {
                    box.style.display = 'none';
                    box.style.opacity = '0';
                    box.style.transform = 'scale(0.95)';
                }
            });

            semesterSections.forEach(section => {
                const hasVisibleSubject = Array.from(section.querySelectorAll('.subject-box')).some(box => box.style.display !== 'none');
                section.style.display = hasVisibleSubject ? '' : 'none';
            });
        }
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Dark mode toggle
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update initial toggle text
    updateToggleText(currentTheme);

    darkModeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update toggle text

        updateToggleText(newTheme);
    });
}

function updateToggleText(theme) {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const textNode = darkModeToggle.lastChild;
        if (textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = theme === 'dark' ? ' Light Mode' : ' Dark Mode';
        }
    }
}

// Chapter rendering functions
function renderChapters(listId) {
    const ul = document.getElementById(listId);
    if (!ul) return;
    ul.innerHTML = '';
    const key = listId;
    const files = JSON.parse(localStorage.getItem(key) || '[]');
    if (files.length === 0) {
        ul.innerHTML = '<li class="chapter-item empty-state">No chapters uploaded yet. Upload PDFs to add chapters!</li>';
        return;
    }
    files.forEach(file => {
        const li = document.createElement('li');
        li.className = 'chapter-item';
        li.innerHTML = `
            <span>${file}</span>
            <a href="#" class="download-btn" onclick="downloadFile('${file}', '${listId}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.5 1.18 6.73L12 17.77l-6.18 3.25L7 14.77 2 10.27l6.91-1.01L12 2z"/>
                </svg>
                Download
            </a>
        `;
        ul.appendChild(li);
    });
}

function renderChaptersAll() {
    const lists = document.querySelectorAll('ul[id^="list"]');
    lists.forEach(list => renderChapters(list.id));
}

function downloadFile(filename, listId) {
    // In production, fetch from server. Here stub blob
    const blob = new Blob([`Chapter PDF content: ${filename}\nDownload from Learning Hub BBA ${listId.slice(-1)}`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return false;
}

function expandSubject(subjectBox) {
    subjectBox.classList.toggle('expanded');
    const header = subjectBox.querySelector('.subject-header');
    if (header) {
        const isExpanded = subjectBox.classList.contains('expanded');
        header.setAttribute('aria-expanded', isExpanded);
    }
}



// Feedback form submission
document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.querySelector('.feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const feedback = {
                message: formData.get('message') || '',
                timestamp: new Date().toISOString()
            };

            // Store feedback in localStorage (in a real app, this would be sent to a server)
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
            feedbacks.push(feedback);
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

            alert('Thank you for your feedback! We appreciate your input.');
            this.reset();
        });
    }
});