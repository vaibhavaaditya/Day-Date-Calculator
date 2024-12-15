
document.getElementById('days_mode').addEventListener('click', () => {
    window.location.href = "popup_days.html";
})

document.getElementById('submit').addEventListener('click', () => {
    const fromDateStr = document.getElementById('from_date').value;
    const toDateStr = document.getElementById('to_date').value;

    const toDate = new Date(toDateStr);
    const fromDate = new Date(fromDateStr);
    const workDay = document.getElementById('workday');
    let diffInDays = Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
    let resultInDays = diffInDays;
    let zeroDayFlag = false;
    let numWeekendDays = 0;
    let toDateIdx = toDate.getDay();
    let froDateIdx = fromDate.getDay();

    if (diffInDays === 0) {
        zeroDayFlag = true;
    }

    const includedate = document.getElementById('includedate');
    const bodyElement = document.body;
    bodyElement.style.height = '390px';

    if (fromDateStr == '' || toDateStr == '') {
        const ansElement = document.getElementById('result_container');
        ansElement.innerHTML = `Please correct the input`;
        ansElement.classList.add('answer_error');
    }
    else {
        const ansElement = document.getElementById('result_container');
        ansElement.classList.remove('answer_error');
        ansElement.classList.add('answer_done');

        if (workDay.checked) {
            let remFirstWeekDays = 7 - froDateIdx;
            let remLastWeekDays = 7 - (7 - toDateIdx);
            let blockWeekDays = diffInDays - (remFirstWeekDays + remLastWeekDays);
            numWeekendDays = (blockWeekDays / 7) * 2;

            if (froDateIdx > 0 && froDateIdx <= 6) {
                numWeekendDays += 1;
            }
            else if (froDateIdx == 0) {
                if (diffInDays <= 7) {
                    numWeekendDays += 1;
                }
                else {
                    numWeekendDays += 2;
                }
            }

            if (toDateIdx > 0 && toDateIdx <= 6) {
                numWeekendDays += 1;
            }

            resultInDays = diffInDays - numWeekendDays;
        }

        if (includedate.checked) {
            if (workDay.checked) {
                if (toDateIdx != 0 && toDateIdx != 6) {
                    ansElement.innerHTML = `<span> Result: </span> &nbsp; ${resultInDays + 1} ${zeroDayFlag ? 'day.' : 'days.'} `;
                }
                else {
                    ansElement.innerHTML = `<span> Result: </span> &nbsp; ${resultInDays} ${zeroDayFlag ? 'day.' : 'days.'} `;
                }
            }
            else {
                ansElement.innerHTML = `<span> Result: </span> &nbsp; ${resultInDays + 1} ${zeroDayFlag ? 'day.' : 'days.'} `;
            }

        }
        else {
            ansElement.innerHTML = `<span> Result: </span> &nbsp; ${resultInDays} days. `;
        }
    }

});

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');


document.getElementById('today_todate').addEventListener('click', () => {
    const toDateObj = document.getElementById('to_date');
    toDateObj.value = `${year}-${month}-${day}`;
})

document.getElementById('today_frodate').addEventListener('click', () => {
    const froDateObj = document.getElementById('from_date');
    froDateObj.value = `${year}-${month}-${day}`;
})




