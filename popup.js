    // --- DOM Element Caching ---
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme_toggle_btn');
    const sunIcon = document.getElementById('sun_icon');
    const moonIcon = document.getElementById('moon_icon');
    const datesModeBtn = document.getElementById('dates_mode_btn');
    const daysModeBtn = document.getElementById('days_mode_btn');
    const datesForm = document.getElementById('dates_form_container');
    const daysForm = document.getElementById('days_form_container');
    const resultContainer = document.getElementById('result_container');

    // --- UI Constants ---
    const ICONS = {
        copy: `<svg class="copy_icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
        check: `<svg class="copy_icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
        result: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    };

    // --- Theme Switching Logic ---

    const applyTheme = (theme) => {
        const isDarkTheme = theme === 'dark';

        body.classList.toggle('dark-mode', isDarkTheme);
        sunIcon.classList.toggle('hidden', !isDarkTheme);
        moonIcon.classList.toggle('hidden', isDarkTheme);
    };

    // Load saved theme on startup
    chrome.storage.sync.get('theme', (data) => {
        // Default to light mode if no theme is saved
        const savedTheme = data.theme || 'light';
        applyTheme(savedTheme);
    });


    themeToggleBtn.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        //Update the storage for default behaviour next time
        chrome.storage.sync.set({ theme: newTheme });
        applyTheme(newTheme);
    });




    // --- Tab Switching Logic ---

    const switchTab = (activeTab) => {
        const isDatesMode = activeTab === 'dates';

        // Toggle tab styles
        datesModeBtn.classList.toggle('mode_selected', isDatesMode);
        datesModeBtn.classList.toggle('mode_unselected', !isDatesMode);
        daysModeBtn.classList.toggle('mode_selected', !isDatesMode);
        daysModeBtn.classList.toggle('mode_unselected', isDatesMode);

        // Toggle form visibility
        datesForm.classList.toggle('hidden', !isDatesMode);
        daysForm.classList.toggle('hidden', isDatesMode);

        // Hide result on tab switch
        resultContainer.classList.add('hidden');
    };

    datesModeBtn.addEventListener('click', () => switchTab('dates'));
    daysModeBtn.addEventListener('click', () => switchTab('days'));





    // --- Helper Functions ---
    const getTodayString = () => {
        const today = new Date();
        // Use local date components to avoid timezone issues with toISOString()
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const displayResult = (message, isError = false) => {
        if (isError) {
            resultContainer.innerHTML = `
                ${ICONS.error}
                <span>${message}</span>
            `;
        } else {
            // Sanitize message for copying (remove HTML tags)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = message;
            const copyText = tempDiv.textContent || tempDiv.innerText || "";

            resultContainer.innerHTML = `
                <div class="result_content">
                    ${ICONS.result}
                    <span>Result:</span> 
                    <span class="result_value">${message}</span>
                </div>
                <button class="copy_btn" title="Copy to clipboard" data-copy-text="${copyText.trim()}" aria-label="Copy result to clipboard">
                    ${ICONS.copy}
                </button>
            `;
        }

        // Result container styling
        resultContainer.classList.remove('answer_done', 'answer_error', 'hidden'); 
        resultContainer.classList.add(isError ? 'answer_error' : 'answer_done');
    }
    
    const formatDateWithSuffix = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                       (day % 10 === 2 && day !== 12) ? 'nd' :
                       (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        return `${day}<sup>${suffix}</sup> ${month} ${year}`; 
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    // --- Copy to Clipboard Logic ---
    resultContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy_btn');
        if (!copyBtn) return;

        const textToCopy = copyBtn.dataset.copyText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Provide visual feedback
            copyBtn.title = 'Copied!';
            copyBtn.innerHTML = ICONS.check;

            // Revert back after a delay
            setTimeout(() => {
                copyBtn.title = 'Copy to clipboard';
                copyBtn.innerHTML = ICONS.copy;
            }, 1500);
        }).catch(err => console.error('Failed to copy: ', err));
    });

    // --- Universal "Today" Button Logic ---
    document.querySelectorAll('.today_btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetInputId = button.dataset.target;
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                targetInput.value = getTodayString();
            }
        });
    });

    // --- "Dates" Mode: Calculate Days Between Dates ---
    const datesSubmitBtn = document.getElementById('dates_submit');
    datesSubmitBtn.addEventListener('click', () => {
        const fromDateStr = document.getElementById('dates_from_date').value;
        const toDateStr = document.getElementById('to_date').value;
        const includeEndDate = document.getElementById('includedate').checked;
        const countWorkdays = document.getElementById('dates_workday').checked;

        if (!fromDateStr || !toDateStr) {
            return displayResult('Please provide both a "From" and "To" date.', true);
        }

        let fromDate = new Date(fromDateStr);
        const toDate = new Date(toDateStr);

        if (fromDate > toDate) {
            return displayResult('"From" date cannot be after "To" date.', true);
        }

        let dayCount = 0;
        // Create a new date object for iteration to avoid modifying the original
        let currentDate = new Date(fromDate.valueOf());

        // Loop through the days, excluding the end date for now
        while (currentDate < toDate) {
            if (!countWorkdays || !isWeekend(currentDate)) {
                dayCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Handle "include end date" separately
        if (includeEndDate) {
            if (!countWorkdays || !isWeekend(toDate)) {
                dayCount++;
            }
        }

        const dayWord = dayCount === 1 ? 'day' : 'days';
        displayResult(`${dayCount} ${dayWord}.`, false);
    });

    // --- "Days" Mode: Add/Subtract Days ---
    const daysSubmitBtn = document.getElementById('days_submit');
    daysSubmitBtn.addEventListener('click', () => {
        const fromDateStr = document.getElementById('days_from_date').value;
        const addOrSub = document.getElementById('add_or_sub').value;
        const numDays = parseInt(document.getElementById('add_sub_days').value, 10);
        const countWorkdays = document.getElementById('days_workday').checked;

        if (!fromDateStr || !numDays || numDays <= 0) {
            return displayResult('Please provide a valid date and number of days.', true);
        }

        let resultDate = new Date(fromDateStr);
        const dayIncrement = (addOrSub === 'add') ? 1 : -1;

        if (countWorkdays) {
            let daysCounter = numDays;
            while (daysCounter > 0) {
                resultDate.setDate(resultDate.getDate() + dayIncrement);
                if (!isWeekend(resultDate)) {
                    daysCounter--;
                }
            }
        } else {
            resultDate.setDate(resultDate.getDate() + (numDays * dayIncrement));
        }

        displayResult(formatDateWithSuffix(resultDate), false);
    });