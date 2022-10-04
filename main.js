const welcome = document.querySelector(".logo");
const username = document.querySelector("#username");
const lBtn = document.getElementById('lbtn');
const ul = document.querySelector("ul");
const inputBox = document.querySelector("#inputbox");
const feedback = document.querySelector(".feedback");
const addBtn = document.querySelector("#addbtn");
const regFormDiv = document.querySelector(".regformdiv");
const regForm = document.querySelector("#regform");
const submitBtn = document.querySelector("#submitbtn");

// Print welcome info
if (localStorage.getItem("curuser") != null) {
  welcome.style.visibility = "visible";
  username.innerText = localStorage.getItem("username");
  lBtn.innerText = "Logout";
  lBtn.style.backgroundColor = "red";
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
        showTodos(data);
      } else {
        console.log("feedback");
        feedback.innerText = "... you have no scheduled tasks for now.";
      }
    })
    .catch(
      (err) =>
        (feedback.innerText = "... could not fetch scheduled tasks for now.")
    );
}

//  End of fetch and display section ==========================================

addBtn.addEventListener("click", addTask);

function addTask() {
  if (inputBox.value == "" || inputBox.value == 0) {
    inputBox.value = "";
    alert("Please enter a task in the input box.");
  } else {
    const posturl = "http://127.0.0.1:8000/api/todos";
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer 6|lIcFZpQxcOhDFflKs0MalwRwP0nIOXlPXvNa5ALw",
      },
      body: JSON.stringify({
        task: inputBox.value,
        status: 0,
      }),
    };

    fetch(posturl, payload)
      .then((response) => response.json())
      .then((resdata) => {
        console.log(resdata);

        if (resdata.statuscode == 200) {
          getTodos();
        } else if ((resdata.message = "Unauthenticated.")) {
          alert(
            "You are " +
              resdata.message +
              " Please login to have access to add a Todo."
          );
        }
      })
      .catch((err) => console.log(err));
  }
}

// ====== Display Todos Map function =============================
function showTodos(tdarray) {
  // let task = inputBox.value;
  // if(task == ''){
  //     alert('Please enter a task');
  // }else{
  ul.innerText = "";

  tdarray.map((todo) => {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.innerText = todo["task"];
    // li.innerText = task;
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
      console.log(delurl);

      const payload = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer 6|lIcFZpQxcOhDFflKs0MalwRwP0nIOXlPXvNa5ALw",
        },
      };

      fetch(delurl, payload)
        .then((response) => response.json())
        .then((resdata) => {
          console.log(resdata);

          if (resdata.message == "Unauthenticated.") {
            alert(
              "You are " +
                resdata.message +
                " You need to be logged in to have delete access."
            );
          } else {
            if (resdata == 1) {
              // alert("Todo deleted successfully");
            } else {
              alert("Todo delete failed. Please try again.");
            }

            // location.reload();
            getTodos();
          }
        })
        .catch((err) => console.log(err));
    };

    // EditBtn ====================================================
    editBtn.addEventListener("click", () => {
      if (editBtn.innerText == "Edit") {
        inputBox.value = p.innerText;
        editBtn.innerText = "Save";
        addBtn.disabled = true;
        addBtn.style.backgroundColor = "grey";
        addBtn.innerText = "disabled";
      } else {
        if (inputBox.value == "" || inputBox.value == 0) {
          inputBox.value = "";
          alert("Please enter a task in the input box.");
        } else {
          const completed = 0;
          updateTodo(todo["id"], completed, inputBox.value);
        }
      }
    });
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
    alert("Please enter a searchitem in the input box.");
  } else {
    const searchurl = `http://127.0.0.1:8000/api/todos/search/${searchitem}`;
    console.log(searchurl);

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
      .catch((err) => console.log(err));
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
      Authorization: "Bearer 6|lIcFZpQxcOhDFflKs0MalwRwP0nIOXlPXvNa5ALw",
    },
    body: JSON.stringify({
      task: tasktxt,
      status: statusState,
    }),
  };

  fetch(updateurl, payload)
    .then((response) => response.json())
    .then((resdata) => {
      console.log(resdata);

      if (resdata == 1) {
        // doneBtn.style.backgroundColor = 'green';
        // doneBtn.innerText = "Done"
        getTodos();
      } else if (resdata == 0) {
        alert("Todo could not be updated. Please try again.");
      } else if (resdata.message == "Unauthenticated.") {
        alert(
          "You are " +
            resdata.message +
            " Please login to have access to update a Todo."
        );
      }
    })
    .catch((err) => console.log(err));
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
      alert("Passwords does not match.");
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
          console.log(regdata);

          if (regdata.statuscode == 201) {

            alert("New User Registration successful. Please Login.");
            displayLoginForm();

          } else {
            alert("Your Registration failed. Please try again.");
          }
        })
        .catch((err) => console.log(err));
    }

  }else{

    // Handle Login ===================================================
    if (!email || !password) {

      alert("Please fill email and password.");

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
          console.log(logdata);

          if (logdata.statuscode == 201) {
            localStorage.setItem("curuser", logdata.token);
            localStorage.setItem("username", logdata.user.name);

            lBtn.innerText = "Logout";

            welcome.style.visibility = "visible";
            username.innerText = logdata.user.name;

            regFormDiv.style.display = "none";
            document.getElementById("todoarea").style.display = "block";
          } else {
            alert("Wrong email or password. Please try again.");
          }
        })
        .catch((err) => console.log(err));
    }

  }


}



// Show Registration form ======================================
function showRegForm() {
  regFormDiv.style.display = "block";
  document.getElementById("nameinp").style.display = "block";
  document.getElementById("passinp2").style.display = "block";
  document.getElementById("submitbtn").value = "Register";
  document.getElementById("todoarea").style.display = "none";
}

// Handle Logout & Show Login form
function showLoginForm() {

  if(lBtn.innerText = "Logout"){

    console.log("logged out");
    const logoposturl = "http://127.0.0.1:8000/api/logout";
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": "Bearer 6|lIcFZpQxcOhDFflKs0MalwRwP0nIOXlPXvNa5ALw",
      },
    };

    fetch(logoposturl, payload)
      .then((response) => response.json())
      .then((logdata) => {
        console.log(logdata);

        if (logdata.statuscode == 200) {
          localStorage.setItem("curuser", null);
          localStorage.setItem("username", null);

          lBtn.innerText = "Login";

          welcome.style.visibility = "hidden";

        } else {

          alert("You are already logged out");

        }

      })
      .catch((err) => console.log(err));

    
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