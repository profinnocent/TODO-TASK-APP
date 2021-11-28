const ul = document.querySelector('ul');
const inputBox = document.querySelector('#inputbox');
const addBtn = document.querySelector('#addbtn');

addBtn.onclick = function(){
    let task = inputBox.value;
    if(task == ''){
        alert('Please enter a task');
    }else{
        const li = document.createElement('li');
        li.innerText = task;
        const delBtn = document.createElement('button');
        delBtn.innerText = 'x';
        delBtn.classList.add('delbtn');
        li.appendChild(delBtn);
        li.classList.add('liclass');
        ul.appendChild(li);
        inputBox.value = '';


        // delBtn
        delBtn.onclick = function(){
            li.classList.remove('liclass');
            li.classList.add('remclass');
        }

        // delBtn.addEventListener("click", () => {
        //     li.classList.add('remclass');
        // });
    }
}

