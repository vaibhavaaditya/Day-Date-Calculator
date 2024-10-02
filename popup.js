document.getElementById('submit').addEventListener('click', ()=>{
    const fromDateStr = document.getElementById('from_date').value;
    const toDateStr = document.getElementById('to_date').value;
    
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    const diffInDays = Math.floor((toDate - fromDate) / (1000*60*60*24));

    
    const includedate = document.getElementById('includedate');
    if (fromDateStr == '' || toDateStr == ''){
        const ansElement = document.getElementById('answer');
        ansElement.innerHTML = `Please correct the input`;
        ansElement.classList.add('answer_error');
    }
    else{

        if(includedate.checked){
            const ansElement = document.getElementById('answer');
            ansElement.innerHTML = `The difference is <span>${diffInDays+1}</span> days`;
            ansElement.classList.remove('answer_error');
            ansElement.classList.add('answer_done');
        }
        else{
            const ansElement = document.getElementById('answer');
            ansElement.innerHTML = `The difference is <span>${diffInDays}</span> days`;
            ansElement.classList.remove('answer_error');
            ansElement.classList.add('answer_done');
        }
    }

});

const today = new Date();

document.getElementById('today_todate').addEventListener('click', ()=>{

    const toDateObj = document.getElementById('to_date'); 
    toDateObj.valueAsDate = today;

})

document.getElementById('today_frodate').addEventListener('click', ()=>{

    const fromDateObj = document.getElementById('from_date');
    fromDateObj.valueAsDate = today;

})