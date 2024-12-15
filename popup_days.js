const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

document.getElementById('dates_mode').addEventListener('click', () => {
    window.location.href = "popup_dates.html";
})

document.getElementById('today_frodate').addEventListener('click', () => {
    const froDateObj = document.getElementById('from_date');
    froDateObj.value = `${year}-${month}-${day}`;
})

document.getElementById('submit').addEventListener('click', () => {
    const fromDateStr = document.getElementById('from_date').value;
    const addOrSub = document.getElementById('add_or_sub').value;
    const numDaysInput = Number(document.getElementById('add_sub_days').value);
    console.log(numDaysInput);
    console.log(typeof (numDaysInput));
    const bodyElement = document.body;
    const fromDate = new Date(fromDateStr);
    console.log(typeof (fromDate));
    console.log(fromDate.value);
    const workDay = document.getElementById('workday');
    let resultDate = new Date();
    let resultDateWorkDay = new Date();
    let numWeekendDays = 0;
    let froDateIdx = fromDate.getDay();

    bodyElement.style.height = '390px';

    if (fromDateStr == '' || addOrSub == '' || numDaysInput == '' || numDaysInput <= 0 || isNaN(Number(numDaysInput))) {
        const ansElement = document.getElementById('result_container');
        ansElement.innerHTML = `Please correct the input`;
        ansElement.classList.add('answer_error');
    }
    else {
        const ansElement = document.getElementById('result_container');
        ansElement.classList.remove('answer_error');
        ansElement.classList.add('answer_done');
        ansElement.style.padding = '46px 125px 46px 125px';

        if (workDay.checked) {

            let workdayCount = numDaysInput;
            let workdayDate = new Date(fromDate);

            if (addOrSub == 'add') {
                while (workdayCount > 0) {
                    workdayDate.setDate(workdayDate.getDate() + 1);
                    if (workdayDate.getDay() != 0 && workdayDate.getDay() != 6) {
                        workdayCount -= 1;
                    }
                }
            }
            else if (addOrSub == 'sub') {
                while (workdayCount > 0) {
                    workdayDate.setDate(workdayDate.getDate() - 1);
                    if (workdayDate.getDay() != 0 && workdayDate.getDay() != 6) {
                        workdayCount -= 1;
                    }
                }
            }

            const workdayDateYear = workdayDate.getFullYear();
            const workdayDateMonth = String(workdayDate.getMonth() + 1).padStart(2, '0');
            const workdayDateDay = String(workdayDate.getDate());
            const suffix = (workdayDateDay % 10 === 1 && workdayDateDay !== 11) ? 'st' :
                (workdayDateDay % 10 === 2 && workdayDateDay !== 12) ? 'nd' :
                    (workdayDateDay % 10 === 3 && workdayDateDay !== 13) ? 'rd' : 'th';
            ansElement.innerHTML = `<span>Result:</span> &nbsp; ${workdayDateDay} <sup> ${suffix} </sup> &nbsp; ${months[workdayDateMonth - 1]}  ${workdayDateYear} `;
        }
        else {
            if (addOrSub == 'add') {
                resultDate.setDate(fromDate.getDate() + numDaysInput);
            }
            else {
                resultDate.setDate(fromDate.getDate() - numDaysInput);
            }

            const resultDateYear = resultDate.getFullYear();
            const resultDateMonth = String(resultDate.getMonth() + 1).padStart(2, '0');
            const resultDateDay = String(resultDate.getDate());
            const suffix = (resultDateDay % 10 === 1 && resultDateDay !== 11) ? 'st' :
                (resultDateDay % 10 === 2 && resultDateDay !== 12) ? 'nd' :
                    (resultDateDay % 10 === 3 && resultDateDay !== 13) ? 'rd' : 'th';
            ansElement.innerHTML = `<span>Result:</span> &nbsp; ${resultDateDay} <sup> ${suffix} </sup> &nbsp; ${months[resultDateMonth - 1]}  ${resultDateYear} `;
        }

    }

});





