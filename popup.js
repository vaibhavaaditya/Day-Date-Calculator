document.addEventListener('DOMContentLoaded', () => {
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

    // --- Theme Switching Logic ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            // Show sun icon to switch to light
            sunIcon.classList.remove('hidden'); 
            moonIcon.classList.add('hidden');
        } else {
            body.classList.remove('dark-mode');
            // Show moon icon to switch to dark
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden'); 
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        chrome.storage.sync.set({ theme: newTheme });
        applyTheme(newTheme);
    });

    // Load saved theme on startup
    chrome.storage.sync.get('theme', (data) => {
        // Default to light mode if no theme is saved
        const savedTheme = data.theme || 'light';
        applyTheme(savedTheme);
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>${message}</span>
            `;
        } else {
            resultContainer.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>Result:</span> <span class="result_value">${message}</span>
            `;
        }

        resultContainer.classList.remove('answer_done', 'answer_error', 'hidden');
        resultContainer.classList.add(isError ? 'answer_error' : 'answer_done');
    };

    const formatDateWithSuffix = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                       (day % 10 === 2 && day !== 12) ? 'nd' :
                       (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
        return `${day}<sup>${suffix}</sup> ${month} ${year}`; // Removed "Result: " and extra &nbsp;
    };

    // --- Universal "Today" Button Logic ---
    document.querySelectorAll('.today_btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const targetInputId = e.target.dataset.target;
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
            const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
            if (!countWorkdays || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
                dayCount++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Handle "include end date" separately
        if (includeEndDate) {
            const endDayOfWeek = toDate.getDay();
            if (!countWorkdays || (endDayOfWeek !== 0 && endDayOfWeek !== 6)) {
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
                const dayOfWeek = resultDate.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    daysCounter--;
                }
            }
        } else {
            resultDate.setDate(resultDate.getDate() + (numDays * dayIncrement));
        }

        displayResult(formatDateWithSuffix(resultDate), false);
    });
});