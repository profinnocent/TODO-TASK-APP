const welcome = document.querySelector(".logo");
const username = document.querySelector("#username");
const lBtn = document.getElementById('lbtn');
const ul = document.querySelector("ul");
const inputBox = document.querySelector("#inputbox");
const feedback = document.querySelector(".feedback");
const feedback1 = document.querySelector(".feedback1");
const addBtn = document.querySelector("#addbtn");
const regFormDiv = document.querySelector(".regformdiv");
const regForm = document.querySelector("#regform");
const submitBtn = document.querySelector("#submitbtn");

const score1 = document.querySelector(".score1");
const score2 = document.querySelector(".score2");
const score3 = document.querySelector(".score3");
const score4 = document.querySelector(".score4");

let ctasks = 0;
let cdone = 0;
let cundone = 0;
let cpercent = 0;


// Print welcome info
if (localStorage.getItem("curuser") != "none") {
  welcome.style.visibility = "visible";
  username.innerText = localStorage.getItem("username");
  lBtn.innerText = "Logout";
  lBtn.style.backgroundColor = "red";
}else{
  welcome.style.visibility = "hidden";
  lBtn.innerText = "Login";
  lBtn.style.backgroundColor = "blue";
}

// Onload call get Todos and display
getTodos();

// Fetch the todos from db ==================================================
function getTodos() {
  const url = "http://127.0.0.1:8000/api/todos";

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data) {

        // Refresh scoreboard count
        score1.innerText = data.length;

        const doneArr = data.filter(item => item.status != 0);

        score2.innerText = doneArr.length;

        score3.innerText = score1.innerText - score2.innerText;

        score4.innerText = ((score2.innerText/score1.innerText)*100).toFixed(1)

        showTodos(data);
      } else {
        notify("... you have no scheduled tasks for now.");
      }
    })
    .catch((err) => notify('Bad request. Try again.') );
}

// ==== Display Scoreboard counts



//  End of fetch and display section ==========================================

addBtn.addEventListener("click", addTask);

function addTask() {
  if (inputBox.value == "" || inputBox.value == 0) {
    inputBox.value = "";
    notify("Please enter a task in the input box.");
  } else {
    const posturl = "http://127.0.0.1:8000/api/todos";
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Authorization": localStorage.getItem('curuser')
      },
      body: JSON.stringify({
        task: inputBox.value,
        status: 0,
      }),
    };

    fetch(posturl, payload)
      .then((response) => response.json())
      .then((resdata) => {

        if (resdata.statuscode == 200) {
          getTodos();
        } else if ((resdata.message = "Unauthenticated.")) {
          notify(
            "You are " +
              resdata.message +
              " Please login to have access to add a Todo."
          );
        }
      })
      .catch((err) => notify('Bad request or server may be temporarily down. Try again.'));
  }
}

// ====== Display Todos Map function =============================
function showTodos(tdarray) {
 
  ul.innerText = "";

  tdarray.map((todo) => {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.innerText = todo["task"];
    li.appendChild(p);

    const div1 = document.createElement("div");

    const doneBtn = document.createElement("button");
    doneBtn.innerText = "Undone";
    doneBtn.classList.add("donebtn");

    if (todo["status"] == 1) {
      doneBtn.classList.add("donebtngreen");
      doneBtn.innerText = "Done";
      doneBtn.style.border = "1px solid white";
      li.style.backgroundColor = "green";
    }
    div1.appendChild(doneBtn);

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.classList.add("editbtn");
    div1.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.innerText = "Del";
    delBtn.classList.add("delbtn");
    div1.appendChild(delBtn);

    li.appendChild(div1);
    li.classList.add("liclass");
    ul.appendChild(li);
    inputBox.value = "";

    // delBtn ======================================================
    delBtn.onclick = function () {
      // Send Delete request to db
      const delurl = `http://127.0.0.1:8000/api/todos/${todo["id"]}`;

      const payload = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": localStorage.getItem('curuser')
        },
      };

      fetch(delurl, payload)
        .then((response) => response.json())
        .then((resdata) => {

          if (resdata.message == "Unauthenticated.") {
            notify(
              "You are " +
                resdata.message +
                " You need to be logged in to have delete access."
            );
          } else {
            if (resdata == 1) {
              // notify("Todo deleted successfully");
            } else {
              notify("Todo delete failed. Please try again.");
            }

            // location.reload();
            getTodos();
          }
        })
        .catch((err) => notify('Bad request. Try again.'));
    };

    // EditBtn ====================================================
    editBtn.addEventListener("click", () => {
      if (editBtn.innerText == "Edit") {
        inputBox.value = p.innerText;
        editBtn.innerText = "Save";
        addBtn.disabled = true;
        addBtn.style.backgroundColor = "grey";
        // addBtn.innerText = "disabled";
      } else {
        if (inputBox.value == "" || inputBox.value == 0) {
          inputBox.value = "";
          notify("Please enter a task in the input box.");
        } else {
          const completed = 0;
          updateTodo(todo["id"], completed, inputBox.value);
        }
      }
    });

    function returnebtn(){
      editBtn.innerText = "Edit";
      inputBox.value = "";
      getTodos();
    }
    // End of editBtn section ====================================

    // Done Btn ====================================================
    doneBtn.addEventListener("click", () => {
      if (doneBtn.innerText == "Undone") {
        const completed1 = 1;
        updateTodo(todo["id"], completed1, p.innerText);
      } else {
        const completed2 = 0;
        updateTodo(todo["id"], completed2, p.innerText);
      }
    });
    // End of Done Btn section ====================================
  });
}

// Search Todos =============================================
function searchTodos() {
  let searchitem = inputBox.value;

  if (searchitem == "" || searchitem == 0) {
    inputBox.value = "";
    notify("Please enter a searchitem in the input box.");
  } else {
    const searchurl = `http://127.0.0.1:8000/api/todos/search/${searchitem}`;

    const payload = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    fetch(searchurl)
      .then((response) => response.json())
      .then((resdata) => {
        if (resdata.length > 0) {
          ul.innerText = "";
          showTodos(resdata);
        } else {
          ul.innerText = "";
          ul.innerHTML = '<li class="liclass">No match found</li>';
        }
      })
      .catch((err) => notify('Failed. There is an issue with the request.'));
  }
}

// Upadte Todo function ========================================
function updateTodo(todoid, statusState, tasktxt) {
  const updateurl = `http://127.0.0.1:8000/api/todos/${todoid}`;
  const payload = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: localStorage.getItem('curuser')
    },
    body: JSON.stringify({
      task: tasktxt,
      status: statusState,
    }),
  };

  fetch(updateurl, payload)
    .then((response) => response.json())
    .then((resdata) => {

      if (resdata == 1) {
        // doneBtn.style.backgroundColor = 'green';
        // doneBtn.innerText = "Done"
        getTodos();
      } else if (resdata == 0) {
        notify("Todo could not be updated. Please try again.");
      } else if (resdata.message == "Unauthenticated.") {
        notify(
          "You are " +
            resdata.message +
            " Please login to have access to update a Todo."
        );
        addBtn.disabled = false;
        addBtn.style.backgroundColor = "#4785ff";
        getTodos();
      }
    })
    .catch((err) => notify('Bad request. Try again.'));
}


// =======================================================================
// Registration & Login handler ==========================================
// =======================================================================
regForm.addEventListener("submit", regNewUser);

function regNewUser(e) {
  e.preventDefault();

  // let formData = new FormData()
  const name = document.getElementById("nameinp").value;
  const email = document.getElementById("emailinp").value;
  const password = document.getElementById("passinp").value;
  const password2 = document.getElementById("passinp2").value;

  // Handle Registration ============================================
  if (submitBtn.value == "Register") {
    if (password != password2) {
      notify1("Passwords does not match.");
    } else {
      const regposturl = "http://127.0.0.1:8000/api/register";
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
        }),
      };

      fetch(regposturl, payload)
        .then((response) => response.json())
        .then((regdata) => {

          if (regdata.statuscode == 201) {

            notify1("New User Registration successful. Please Login.");
            displayLoginForm();

          } else if(regdata.statuscode == 402) {

            notify1(regdata.message);

          } else {

            notify1(regdata.errors.email + "Please register with another email.");

          }
        })
        .catch((err) => notify1('Bad request. Try again.'));
    }

  }else{

    // Handle Login ===================================================
    if (!email || !password) {

      notify1("Please fill email and password.");

    } else {

      const logposturl = "http://127.0.0.1:8000/api/login";
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      };

      fetch(logposturl, payload)
        .then((response) => response.json())
        .then((logdata) => {

          if (logdata.statuscode == 200) {

            // Add Bearer to the token
            const btoken = `Bearer ${logdata.token}`;
            localStorage.setItem("curuser", btoken);
            localStorage.setItem("username", logdata.user.name);

            lBtn.innerText = "Logout";

            welcome.style.visibility = "visible";
            username.innerText = logdata.user.name;

            regFormDiv.style.display = "none";
            document.getElementById("todoarea").style.display = "block";
          } else {
            notify1("Wrong email or password. Please try again.");
          }
        })
        .catch((err) => notify1('Bad request. Try again.'));
    }

  }


}



// Show Registration form ======================================
function showRegForm() {

  if(lBtn.innerText == "Login"){
  regFormDiv.style.display = "block";
  document.getElementById("nameinp").style.display = "block";
  document.getElementById("passinp2").style.display = "block";
  document.getElementById("submitbtn").value = "Register";
  document.getElementById("todoarea").style.display = "none";

  }else{
    notify("A user is already logged in. Please log the user out first.")
  }
}

// =========================================================
// Handle Logout & Show Login form ===========================
function showLoginForm() {

  if(lBtn.innerText == "Logout"){

    console.log("logged out");
    console.log(localStorage.getItem('curuser'));
    const logoposturl = "http://127.0.0.1:8000/api/logout";
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": localStorage.getItem('curuser')
      },
    };

    fetch(logoposturl, payload)
      .then((response) => response.json())
      .then((logdata) => {

        if (logdata.statuscode == 200) {
          localStorage.setItem("curuser", "none");
          localStorage.setItem("username", "none");

          lBtn.innerText = "Login";
          welcome.style.visibility = "hidden";

        } else if(logdata.message == 'Unauthenticated.') {

          notify(`You are ${logdata.message}`);

        }else {

          notify("You are already logged out");

        }

      })
      .catch((err) => notify('Bad request. Try again.'));

    
  }else{
    
   displayLoginForm();

  }

}

// Display Login form
function displayLoginForm(){
  regFormDiv.style.display = "block";
  document.getElementById("nameinp").style.display = "none";
  document.getElementById("passinp2").style.display = "none";
  document.getElementById("submitbtn").value = "Login";
  document.getElementById("todoarea").style.display = "none";
}

// Close registration or login form
function closeForm() {
  regFormDiv.style.display = "none";
  document.getElementById("todoarea").style.display = "block";
}

// Error feedback notification handler
function notify(txt){

  feedback.innerText = txt;
  feedback.style.visibility = 'visible';

  setTimeout(()=> {
    feedback.style.visibility = 'hidden';
  }, 3000)
}

function notify1(txt){

  feedback1.innerText = txt;
  feedback1.style.visibility = 'visible';

  setTimeout(()=> {
    feedback1.style.visibility = 'hidden';
    feedback1.style.position = 'absolute';

  }, 3000)
}

// Handle Enter key to add new todo
addEventListener('keypress', (e) => {
  
  if(e.keyCode == 13)  addTask();

});


// Hnadle Scores
const lis = ul.getElementsByTagName('li');
// const spanUndone = lis.getElementsByTagName('span');
console.log(lis.length);

const liArr = Array.from(lis);
console.log(liArr);
// console.log(spanDone.length);
// console.log(spanUndone.length);