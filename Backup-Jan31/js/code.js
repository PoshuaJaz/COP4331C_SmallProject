const urlBase = 'http://menufish.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin(event)
{
    event.preventDefault();

    userId = 0;
    firstName = "";
    lastName = "";
    
    let login = document.getElementById("loginName").value;
    let password = document.getElementById("loginPassword").value;
    let loginResult = document.getElementById("loginResult");

    var hash = md5(password);
    
    loginResult.innerHTML = "";

    var tmp = { login: login, password: hash };
    let jsonPayload = JSON.stringify(tmp);
    
    let url = urlBase + '/Login.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                userId = jsonObject.id;

                if (userId < 1) {
                    displayMessage(loginResult, "User/Password combination incorrect");
                    return;
                }

                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                saveCookie();

                displayMessage(loginResult, "Login successful!", "green");

                // window.location.href = "color.html";
                setTimeout(() => {
                    window.location.href = "color.html";
                }, 1000);
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        displayMessage(loginResult, err.message);
    }
}

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		// document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;

        let welcomeMessage = document.querySelector(".welcome-message");
        if (welcomeMessage) {
            welcomeMessage.textContent = `Hello, ${firstName}!`;
        }
	}
}

// to remove login information
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname.includes("index.html")) {
        document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        localStorage.removeItem("userToken");
        sessionStorage.removeItem("userToken");
    }
});

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	document.cookie = "lastName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userId= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    // window.location.href = "index.html";

    localStorage.removeItem("userToken");
    sessionStorage.removeItem("userToken");
    
    let logoutResult = document.getElementById("logoutResult");

    if (logoutResult) {
        displayMessage(logoutResult, "Logout successful!", "green");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000); 
    } else {
        window.location.href = "index.html";
    }
}

// for register section
function showRegister() 
{
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
}

// Show login section 
function showLogin() 
{
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}

// Register Fucntion 
function saveRegister(event) 
{
    event.preventDefault();

    let firstName = document.getElementById("registerFirstName").value.trim();
    let lastName = document.getElementById("registerLastName").value.trim();
    let username = document.getElementById("registerUsername").value.trim();
    let password = document.getElementById("registerPassword").value.trim();
    let confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
    let registerResult = document.getElementById("registerResult");
    registerResult.textContent = ""; 

    if (!validateRegisterInput(firstName, lastName, username, password, confirmPassword)) {
        return; 
    }

    // password hash
    let hashPassword = md5(password);

    // send data to server
    let tmp = {
        FirstName: firstName,
        LastName: lastName,
        Login: username,
        Password: hashPassword
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/Register.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);

                if (response.error) {
                    displayMessage(registerResult,response.error);
                } else {
                    displayMessage(registerResult, "Registration successful!", "green");
                    // showLogin();
                    setTimeout(() => {
                        showLogin();
                    }, 1000); 
                }
            } else {
                displayMessage(registerResult,`Error: ${xhr.status} - ${xhr.statusText}`);
            }
        }
    };
    xhr.send(jsonPayload);
}

// Show pop-up for add contact 
function showAddContactPopup() 
{
	document.getElementById("contactFirstName").value = "";
    document.getElementById("contactLastName").value = "";
    document.getElementById("contactPhone").value = "";
    document.getElementById("contactEmail").value = "";
    document.getElementById("addMessage").textContent = "";
    
    document.getElementById('addPopup').style.display = 'block';
	document.getElementById('overlay').style.display = 'block';
}

// Close pop-up for add contact 
function closeAddPopup() 
{
	document.getElementById('addPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}

function saveNewContact(event) 
{
    event.preventDefault();

    let firstName = document.getElementById("contactFirstName").value.trim();
    let lastName = document.getElementById("contactLastName").value.trim();
    let phone = document.getElementById("contactPhone").value.trim();
    let email = document.getElementById("contactEmail").value.trim();
    let addResult = document.getElementById("addMessage");
    addResult.textContent = ""; 

    if (!validateInput("FirstName", firstName, "addMessage") || !validateInput("LastName", lastName, "addMessage") ||!validateInput("Phone", phone, "addMessage") ||
        !validateInput("Email", email, "addMessage")
    ) {
        return;
    }
    console.log("UserID before sending:", userId);

    // send data to server
    let tmp = {
        FirstName: firstName,
        LastName: lastName,
        Phone: phone,
        Email: email,
        UserID: userId
    };

    let jsonPayload = JSON.stringify(tmp);

    console.log("Sending JSON payload:", jsonPayload);

    let url = urlBase + '/AddContact.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log("Server Response:", xhr.responseText);

            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);

                if (response.error) {
                    displayMessage(addResult,response.error);
                } else {
                    displayMessage(addResult, "Registration successful!", "green");

                    setTimeout(() => {
                        closeAddPopup();
                        searchContacts();
                    }, 1000); 
                }
            } else {
                displayMessage(addResult,`Error: ${xhr.status} - ${xhr.statusText}`);
            }
        }
    };
    xhr.send(jsonPayload);
}

function loadUserContacts() 
{
    let contactTableBody = document.querySelector("#contactTable tbody");
    let messageBox = document.getElementById("messageBox");

    contactTableBody.innerHTML = "";
    messageBox.textContent = "";

    let tmp = {
        FirstName: "",  
        LastName: "",
        userID: userId 
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.error) {
                    addEmptyRows(15);
                } else if (response.results && response.results.length > 0) {
                    
                    response.results.sort((a, b) => a.FirstName.toLowerCase().localeCompare(b.FirstName.toLowerCase()));

                    response.results.forEach((contact, index) => {
                        let row = document.createElement("tr");
                        row.setAttribute("data-id", contact.ID);
                        row.innerHTML = `
                            <td>${contact.FirstName}</td>
                            <td>${contact.LastName}</td>
                            <td>${contact.Phone}</td>
                            <td>${contact.Email}</td>
                            <td class="button-group">
                                <button type="button" class="edit-btn btn-xs dt-edit" style="margin-right:16px;" onclick="showEditPopup(${index})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button type="button" class="delete-btn btn-xs dt-delete" onclick="deleteContact(${contact.ID})">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </td>
                        `;
                        contactTableBody.appendChild(row);
                    });

                    let emptyRowCount = 15 - response.results.length;
                    if (emptyRowCount > 0) {
                        addEmptyRows(emptyRowCount);
                    }

                } else {
                    displayMessage(messageBox,"No contacts found.");
                    addEmptyRows(15);
                }
            } else {
                displayMessage(messageBox,"Error: Unable to connect to server.");
                addEmptyRows(15);
            }
        }
    };

    xhr.send(jsonPayload);
}

// Search contact depening user id 
function searchContacts() 
{
    let firstNameSearch = document.getElementById("searchFirstName").value.trim();
    let lastNameSearch = document.getElementById("searchLastName").value.trim();
    let contactTableBody = document.querySelector("#contactTable tbody");
    let messageBox = document.getElementById("messageBox");

    contactTableBody.innerHTML = "";
    messageBox.textContent = "";

    // send data to server
    let tmp = {
        FirstName: firstNameSearch,
        LastName: lastNameSearch,
        userID: userId 
    };

    let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);
                if (response.error) {
                    displayMessage(messageBox,"Error: " + response.error);
                    addEmptyRows(15);
                } else if (response.results && response.results.length > 0) {

                    response.results.sort((a, b) => a.FirstName.toLowerCase().localeCompare(b.FirstName.toLowerCase()));

                    response.results.forEach((contact,index) => {
                        let row = document.createElement("tr");
						row.setAttribute("data-id", contact.ID);
                        row.innerHTML = `
                            <td>${contact.FirstName}</td>
                            <td>${contact.LastName}</td>
                            <td>${contact.Phone}</td>
                            <td>${contact.Email}</td>
                            <td class="button-group">
                                <button type="button" class="edit-btn btn-xs dt-edit" style="margin-right:16px;" onclick="showEditPopup(${index})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button type="button" class="delete-btn btn-xs dt-delete" onclick="deleteContact(${contact.ID})">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </td>
                        `;
                        contactTableBody.appendChild(row);
                    });

                    let emptyRowCount = 15 - response.results.length;
                    if (emptyRowCount > 0) {
                        addEmptyRows(emptyRowCount);
                    }

                } else {
                    displayMessage(messageBox,"No contacts found.");
                    addEmptyRows(15);
                }
            } else {
                displayMessage(messageBox,"Error: Unable to connect to server.");
                addEmptyRows(15);
            }
        }
    };

    xhr.send(jsonPayload);
}

// Show popup for edit contact 
// To implement the popup so that it displays the existing contact data
function showEditPopup(index) 
{
    const contactRow = document.querySelectorAll("#contactTable tbody tr")[index];

    document.getElementById("editMessage").textContent = "";

    let contactId = contactRow.getAttribute("data-id");
	let firstName = contactRow.children[0].textContent.trim();
    let lastName = contactRow.children[1].textContent.trim();
    let phone = contactRow.children[2].textContent.trim();
    let email = contactRow.children[3].textContent.trim();
    

    document.getElementById("editPopup").setAttribute("data-id", contactId);
	document.getElementById("dropdown").value = "FirstName";
	document.getElementById("editValue").value = firstName;


	document.getElementById("dropdown").addEventListener("change", function () {
        const selectedField = this.value;
        let valueToEdit = "";

        if (selectedField === "FirstName") {
            valueToEdit = firstName;
        } else if (selectedField === "LastName") {
            valueToEdit = lastName;
        } else if (selectedField === "Phone") {
            valueToEdit = phone;
        } else if (selectedField === "Email") {
            valueToEdit = email;
        }

        document.getElementById("editValue").value = valueToEdit;
    });

    document.getElementById("editPopup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function closeEditPopup() 
{
	document.getElementById('editPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
    document.getElementById("editMessage").textContent = "";
}

function saveEdit(event) 
{
    event.preventDefault();

    const contactID = document.getElementById("editPopup").getAttribute("data-id");
    const selectedField = document.getElementById("dropdown").value;
    const newValue = document.getElementById("editValue").value.trim();
    const messageBox = document.getElementById("editMessage");

	messageBox.textContent = "";

    if (!validateInput(selectedField, newValue, "editMessage")) {
        return;
    }

    // send data to server
    const tmp = {
        ID: contactID,
        UpdateCol: selectedField,
        NewData: newValue,
    };

	let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/EditContact.' + extension;

	let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);

                if (response.error) {
                    //displayMessage(messageBox, "Error: " + response.error);
                } else {
                    displayMessage(messageBox, "Edit successful!", "green");

                    // closeEditPopup();
                    // searchContacts(); 

                    setTimeout(() => {
                        // messageBox.textContent = "";
                        closeEditPopup();
                        searchContacts();
                    }, 1000);
                }
            }
        }
    };

    xhr.send(jsonPayload);
}

function deleteContact(index) 
{
	const contactRow = document.querySelector(`#contactTable tbody tr[data-id="${index}"]`);
	const messageBox = document.getElementById("messageBox");

	messageBox.textContent = "";

	const contactID = index;

    const jsonPayload = JSON.stringify({ contactID: contactID });
    const url = urlBase + '/DeleteContact.' + extension;

	let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let response = JSON.parse(xhr.responseText);

                if (response.error) {
                    messageBox.textContent = "Error: " + response.error;
                } else {
                    alert("Contact deleted successfully!"); 
                    contactRow.remove();
                }
            } else {
                messageBox.textContent = "Error: Unable to delete the contact.";
            }
        }
    };

    xhr.send(jsonPayload);
}

document.addEventListener("click", (event) => {
    if (!event.target.matches(".ellipsis-icon") && !event.target.closest(".action-buttons")) {
        document.querySelectorAll(".action-buttons").forEach(popup => {
            popup.style.display = "none";
        });
    }
});

function addEmptyRows(count) {
    let contactTableBody = document.querySelector("#contactTable tbody");

    for (let i = 0; i < count; i++) {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        contactTableBody.appendChild(row);
    }
}

// validate for register 
function validateRegisterInput(firstName, lastName, username, password, confirmPassword) {
    const messageBox = document.getElementById("registerResult"); 

    if (!firstName.trim() || !lastName.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
        displayMessage(messageBox, "Error: All fields are required.", "red");
        return false;
    }

    // First Name & Last Name 
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstName)) {
        displayMessage(messageBox, "Error: First name must contain only letters (A-Z, a-z).", "red");
        return false;
    }
    if (!nameRegex.test(lastName)) {
        displayMessage(messageBox, "Error: Last name must contain only letters (A-Z, a-z).", "red");
        return false;
    }

    // Username 
    const usernameRegex = /^[a-zA-Z]\w{3,18}$/;
    if (!usernameRegex.test(username)) {
        displayMessage(messageBox, "Error: Username must start with a letter and contain 3-18 valid characters (letters, numbers, underscores, or hyphens).", "red");
        return false;
    }

    // Password 
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;
    if (!passwordRegex.test(password)) {
        displayMessage(messageBox, "Error: Password must be 8-32 characters and include at least one letter, one number, and one special character.", "red");
        return false;
    }

    // password confirm
    if (password !== confirmPassword) {
        displayMessage(messageBox, "Error: Passwords do not match.", "red");
        return false;
    }

    return true; 
}


// validate for edit 
function validateInput(field, value,messageBoxId) {

    const messageBox = document.getElementById(messageBoxId);

    const nameRegex = /^[a-zA-Z]+$/; 
    const phoneRegex = /^[0-9\-\+\s]{10,17}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

    let errorMessage = "";

    if (field === "FirstName" || field === "LastName") {
        if (!nameRegex.test(value)) {
            errorMessage = "Error: Name must contain only letters.";
        }
    } else if (field === "Phone") {
        if (!phoneRegex.test(value)) {
            errorMessage = "Error: Phone number must be 10-15 digits (numbers only).";
        }
    } else if (field === "Email") {
        if (!emailRegex.test(value)) {
            errorMessage = "Error: Invalid email format (example@example.com).";
        }
    }

    if (errorMessage) {
        displayMessage(messageBox, errorMessage, "red");
        return false;
    }

    return true; 
}

function displayMessage(element, message, color = "red") {
    element.textContent = message;
    element.style.color = color;
    element.style.fontSize = "14px";
    element.style.marginTop = "5px";
    element.style.backgroundColor = color === "red" ? "#ffe6e6" : "#e6ffe6";
    element.style.padding = "5px 10px";
    element.style.borderRadius = "5px";
    element.style.display = "inline-block";
    if (color === "green") {
        setTimeout(() => {
            element.textContent = "";
            element.style.display = "none";
        }, 1000);
    }
    if (color === "red") {
        setTimeout(() => {
            element.textContent = "";
            element.style.display = "none";
        }, 1200);
    }
}




// const urlBase = 'http://menufish.com/LAMPAPI';
// const extension = 'php';

// let userId = 0;
// let firstName = "";
// let lastName = "";

// function doLogin(event)
// {
//     event.preventDefault();

//     userId = 0;
//     firstName = "";
//     lastName = "";
    
//     let login = document.getElementById("loginName").value;
//     let password = document.getElementById("loginPassword").value;
//     let loginResult = document.getElementById("loginResult");

//     var hash = md5(password);
    
//     loginResult.innerHTML = "";

//     var tmp = { login: login, password: hash };
//     let jsonPayload = JSON.stringify(tmp);
    
//     let url = urlBase + '/Login.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     try {
//         xhr.onreadystatechange = function () {
//             if (this.readyState == 4 && this.status == 200) {
//                 let jsonObject = JSON.parse(xhr.responseText);
//                 userId = jsonObject.id;

//                 if (userId < 1) {
//                     displayMessage(loginResult, "User/Password combination incorrect");
//                     return;
//                 }

//                 firstName = jsonObject.firstName;
//                 lastName = jsonObject.lastName;

//                 saveCookie();

//                 displayMessage(loginResult, "Login successful!", "green");

//                 // window.location.href = "color.html";
//                 setTimeout(() => {
//                     window.location.href = "color.html";
//                 }, 1000);
//             }
//         };
//         xhr.send(jsonPayload);
//     } catch (err) {
//         displayMessage(loginResult, err.message);
//     }
// }

// function saveCookie()
// {
// 	let minutes = 20;
// 	let date = new Date();
// 	date.setTime(date.getTime()+(minutes*60*1000));	
// 	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
// }

// function readCookie()
// {
// 	userId = -1;
// 	let data = document.cookie;
// 	let splits = data.split(",");
// 	for(var i = 0; i < splits.length; i++) 
// 	{
// 		let thisOne = splits[i].trim();
// 		let tokens = thisOne.split("=");
// 		if( tokens[0] == "firstName" )
// 		{
// 			firstName = tokens[1];
// 		}
// 		else if( tokens[0] == "lastName" )
// 		{
// 			lastName = tokens[1];
// 		}
// 		else if( tokens[0] == "userId" )
// 		{
// 			userId = parseInt( tokens[1].trim() );
// 		}
// 	}
	
// 	if( userId < 0 )
// 	{
// 		window.location.href = "index.html";
// 	}
// 	else
// 	{
// 		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
// 	}
// }

// function doLogout()
// {
// 	userId = 0;
// 	firstName = "";
// 	lastName = "";
// 	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
// 	// window.location.href = "index.html";

//     let logoutResult = document.getElementById("logoutResult");

//     if (logoutResult) {
//         displayMessage(logoutResult, "Logout successful!", "green");

//         setTimeout(() => {
//             window.location.href = "index.html";
//         }, 1000); 
//     } else {
//         window.location.href = "index.html";
//     }
// }

// // for register section
// function showRegister() 
// {
//     document.getElementById("loginSection").style.display = "none";
//     document.getElementById("registerSection").style.display = "block";
// }

// // Show login section 
// function showLogin() 
// {
//     document.getElementById("registerSection").style.display = "none";
//     document.getElementById("loginSection").style.display = "block";
// }

// // Register Fucntion 
// function saveRegister(event) 
// {
//     event.preventDefault();

//     let firstName = document.getElementById("registerFirstName").value.trim();
//     let lastName = document.getElementById("registerLastName").value.trim();
//     let username = document.getElementById("registerUsername").value.trim();
//     let password = document.getElementById("registerPassword").value.trim();
//     let confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
//     let registerResult = document.getElementById("registerResult");

//      // First Name & Last Name validation (Only Letters)
//      let nameRegex = /^[A-Za-z]+$/;
//      if (!nameRegex.test(firstName)) {
//         displayMessage(registerResult, "First name must contain only letters (A-Z, a-z).");
//         return;
//      }
 
//      if (!nameRegex.test(lastName)) {
//         displayMessage(registerResult, "Last name must contain only letters (A-Z, a-z).");
//         return;
//      }

//     // username validation
//     let usernameRegex = /^[a-zA-Z]\w{3,18}$/;
//     if (!usernameRegex.test(username)) {
//         displayMessage(registerResult, "Username must start with a letter and contain 3-18 valid characters (letters, numbers, underscores, or hyphens). Example: A_user123 or B-12345.");
//         return;
//     }

//     // password validation
//     let passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;
//     if (!passwordRegex.test(password)) {
//         displayMessage(registerResult, "Password must be 8-32 characters and include at least one letter, one number, and one special character. Example: P@ssw0rd123 or Secure!456.");
//         return;
//     }

//     // passwordconfirm 
//     if (password !== confirmPassword) {
//         displayMessage(registerResult,"Passwords do not match.");
//         return;
//     }

//     // password hash
//     let hashPassword = md5(password);

//     // send data to server
//     let tmp = {
//         FirstName: firstName,
//         LastName: lastName,
//         Login: username,
//         Password: hashPassword
//     };

//     let jsonPayload = JSON.stringify(tmp);

//     let url = urlBase + '/Register.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     displayMessage(registerResult,response.error);
//                 } else {
//                     displayMessage(registerResult, "Registration successful!", "green");
//                     // showLogin();
//                     setTimeout(() => {
//                         showLogin();
//                     }, 1500); 
//                 }
//             } else {
//                 displayMessage(registerResult,`Error: ${xhr.status} - ${xhr.statusText}`);
//             }
//         }
//     };
//     xhr.send(jsonPayload);
// }

// // Show pop-up for add contact 
// function showAddContactPopup() 
// {
// 	document.getElementById('addPopup').style.display = 'block';
// 	document.getElementById('overlay').style.display = 'block';
// }

// // Close pop-up for add contact 
// function closeAddPopup() 
// {
// 	document.getElementById('addPopup').style.display = 'none';
// 	document.getElementById('overlay').style.display = 'none';
// }

// function saveNewContact() 
// {
// 	// Josh
// }

// function loadUserContacts() 
// {
//     let contactTableBody = document.querySelector("#contactTable tbody");
//     let messageBox = document.getElementById("messageBox");

//     contactTableBody.innerHTML = "";
//     messageBox.textContent = "";

//     let tmp = {
//         FirstName: "",  
//         LastName: "",
//         userID: userId 
//     };

//     let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/SearchContacts.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);
//                 if (response.error) {
//                     //displayMessage(messageBox,`Error: ${xhr.status} - ${xhr.statusText}`);
//                     addEmptyRows(15);
//                 } else if (response.results && response.results.length > 0) {
//                     response.results.forEach((contact, index) => {
//                         let row = document.createElement("tr");
//                         row.setAttribute("data-id", contact.ID);
//                         row.innerHTML = `
//                             <td>${contact.FirstName}</td>
//                             <td>${contact.LastName}</td>
//                             <td>${contact.Phone}</td>
//                             <td>${contact.Email}</td>
//                             <td>
//                                 <div>
//                                     <button class="editing-icon" onclick="showEditPopup(${index})"> Edit </button>
//                                     <button onclick="deleteContact(${contact.ID})">Delete</button>
//                                 </div>
//                             </td>
//                         `;
//                         contactTableBody.appendChild(row);
//                     });

//                     let emptyRowCount = 15 - response.results.length;
//                     if (emptyRowCount > 0) {
//                         addEmptyRows(emptyRowCount);
//                     }

//                 } else {
//                     displayMessage(messageBox,"No contacts found.");
//                     addEmptyRows(15);
//                 }
//             } else {
//                 displayMessage(messageBox,"Error: Unable to connect to server.");
//                 addEmptyRows(15);
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// // Search contact depening user id 
// function searchContacts() 
// {
//     let firstNameSearch = document.getElementById("searchFirstName").value.trim();
//     let lastNameSearch = document.getElementById("searchLastName").value.trim();
//     let contactTableBody = document.querySelector("#contactTable tbody");
//     let messageBox = document.getElementById("messageBox");

//     contactTableBody.innerHTML = "";
//     messageBox.textContent = "";

//     // if (!firstNameSearch && !lastNameSearch) {
//     //     displayMessage(messageBox,"Please enter a first name or last name to search.");
//     //     addEmptyRows(15);
//     //     return;
//     // }

//     // send data to server
//     let tmp = {
//         FirstName: firstNameSearch,
//         LastName: lastNameSearch,
//         userID: userId 
//     };

//     let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/SearchContacts.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);
//                 if (response.error) {
//                     displayMessage(messageBox,"Error: " + response.error);
//                     addEmptyRows(15);
//                 } else if (response.results && response.results.length > 0) {
//                     response.results.forEach((contact,index) => {
//                         let row = document.createElement("tr");
// 						row.setAttribute("data-id", contact.ID);
//                         row.innerHTML = `
//                             <td>${contact.FirstName}</td>
//                             <td>${contact.LastName}</td>
//                             <td>${contact.Phone}</td>
//                             <td>${contact.Email}</td>
//                             <td>
//                                 <div>
//                                     <button class="editing-icon" onclick="showEditPopup(${index})"> Edit </button>
//                                     <button onclick="deleteContact(${contact.ID})">Delete</button>
//                                 </div>
//                             </td>
//                         `;
//                         contactTableBody.appendChild(row);
//                     });

//                     let emptyRowCount = 15 - response.results.length;
//                     if (emptyRowCount > 0) {
//                         addEmptyRows(emptyRowCount);
//                     }

//                 } else {
//                     displayMessage(messageBox,"No contacts found.");
//                     addEmptyRows(15);
//                 }
//             } else {
//                 displayMessage(messageBox,"Error: Unable to connect to server.");
//                 addEmptyRows(15);
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// // Show popup for edit contact 
// // To implement the popup so that it displays the existing contact data
// function showEditPopup(index) 
// {
//     const contactRow = document.querySelectorAll("#contactTable tbody tr")[index];

//     let contactId = contactRow.getAttribute("data-id");
// 	let firstName = contactRow.children[0].textContent.trim();
//     let lastName = contactRow.children[1].textContent.trim();
//     let phone = contactRow.children[2].textContent.trim();
//     let email = contactRow.children[3].textContent.trim();

//     document.getElementById("editPopup").setAttribute("data-id", contactId);
// 	document.getElementById("dropdown").value = "FirstName";
// 	document.getElementById("editValue").value = firstName;

// 	document.getElementById("dropdown").addEventListener("change", function () {
//         const selectedField = this.value;
//         let valueToEdit = "";

//         if (selectedField === "FirstName") {
//             valueToEdit = firstName;
//         } else if (selectedField === "LastName") {
//             valueToEdit = lastName;
//         } else if (selectedField === "Phone") {
//             valueToEdit = phone;
//         } else if (selectedField === "Email") {
//             valueToEdit = email;
//         }

//         document.getElementById("editValue").value = valueToEdit;
//     });

//     document.getElementById("editPopup").style.display = "block";
//     document.getElementById("overlay").style.display = "block";
// }

// function closeEditPopup() 
// {
// 	document.getElementById('editPopup').style.display = 'none';
// 	document.getElementById('overlay').style.display = 'none';
// }


// // Edit contact 
// // To save the changes to the server
// function saveEdit(event) 
// {
//     event.preventDefault();

//     const contactID = document.getElementById("editPopup").getAttribute("data-id");
//     const selectedField = document.getElementById("dropdown").value;
//     const newValue = document.getElementById("editValue").value.trim();
//     const messageBox = document.getElementById("editMessage");

// 	messageBox.textContent = "";

//     // send data to server
//     const tmp = {
//         ID: contactID,
//         UpdateCol: selectedField,
//         NewData: newValue,
//     };

// 	let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/EditContact.' + extension;

// 	let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

// 	xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent("Error: " + response.error);
//                 } else {
//                     displayMessage(messageBox, "Edit successful!", "green");

//                     // closeEditPopup();
//                     // searchContacts(); 

//                     setTimeout(() => {
//                         closeEditPopup();
//                         searchContacts();
//                     }, 1500);
//                 }
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// function deleteContact(index) 
// {
// 	const contactRow = document.querySelector(`#contactTable tbody tr[data-id="${index}"]`);
// 	const messageBox = document.getElementById("messageBox");

// 	messageBox.textContent = "";

// 	const contactID = index;

//     const jsonPayload = JSON.stringify({ contactID: contactID });
//     const url = urlBase + '/DeleteContact.' + extension;

// 	let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

// 	xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent = "Error: " + response.error;
//                 } else {
//                     alert("Contact deleted successfully!"); 
//                     contactRow.remove();
//                 }
//             } else {
//                 messageBox.textContent = "Error: Unable to delete the contact.";
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// document.addEventListener("click", (event) => {
//     if (!event.target.matches(".ellipsis-icon") && !event.target.closest(".action-buttons")) {
//         document.querySelectorAll(".action-buttons").forEach(popup => {
//             popup.style.display = "none";
//         });
//     }
// });

// function addEmptyRows(count) {
//     let contactTableBody = document.querySelector("#contactTable tbody");

//     for (let i = 0; i < count; i++) {
//         let row = document.createElement("tr");
//         row.innerHTML = `
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//         `;
//         contactTableBody.appendChild(row);
//     }
// }

// function displayMessage(element, message, color = "red") {
//     element.textContent = message;
//     element.style.color = color;
//     element.style.fontSize = "14px";
//     element.style.marginTop = "5px";
//     element.style.backgroundColor = color === "red" ? "#ffe6e6" : "#e6ffe6";
//     element.style.padding = "5px 10px";
//     element.style.borderRadius = "5px";
//     element.style.display = "inline-block";
// }


// const urlBase = 'http://menufish.com/LAMPAPI';
// const extension = 'php';

// let userId = 0;
// let firstName = "";
// let lastName = "";

// function doLogin(event)
// {
//     event.preventDefault();

//     userId = 0;
//     firstName = "";
//     lastName = "";
    
//     let login = document.getElementById("loginName").value;
//     let password = document.getElementById("loginPassword").value;
//     let loginResult = document.getElementById("loginResult");

//     var hash = md5(password);
    
//     loginResult.innerHTML = "";

//     var tmp = { login: login, password: hash };
//     let jsonPayload = JSON.stringify(tmp);
    
//     let url = urlBase + '/Login.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     try {
//         xhr.onreadystatechange = function () {
//             if (this.readyState == 4 && this.status == 200) {
//                 let jsonObject = JSON.parse(xhr.responseText);
//                 userId = jsonObject.id;

//                 if (userId < 1) {
//                     loginResult.innerHTML = "User/Password combination incorrect";
//                     loginResult.style.color = "red";         
//                     loginResult.style.fontSize = "14px";      
//                     loginResult.style.marginTop = "5px";     
//                     loginResult.style.backgroundColor = "#ffe6e6"; 
//                     loginResult.style.padding = "5px 10px";   
//                     loginResult.style.borderRadius = "5px";   
//                     loginResult.style.display = "inline-block"; 

//                     return;
//                 }

//                 firstName = jsonObject.firstName;
//                 lastName = jsonObject.lastName;

//                 saveCookie();

//                 window.location.href = "color.html";
//             }
//         };
//         xhr.send(jsonPayload);
//     } catch (err) {
//         loginResult.innerHTML = err.message;
//         loginResult.style.color = "red";
//         loginResult.style.fontSize = "14px";
//         loginResult.style.marginTop = "5px";
//         loginResult.style.backgroundColor = "#ffe6e6";
//         loginResult.style.padding = "5px 10px";
//         loginResult.style.borderRadius = "5px";
//         loginResult.style.display = "inline-block";
//     }
// }

// function saveCookie()
// {
// 	let minutes = 20;
// 	let date = new Date();
// 	date.setTime(date.getTime()+(minutes*60*1000));	
// 	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
// }

// function readCookie()
// {
// 	userId = -1;
// 	let data = document.cookie;
// 	let splits = data.split(",");
// 	for(var i = 0; i < splits.length; i++) 
// 	{
// 		let thisOne = splits[i].trim();
// 		let tokens = thisOne.split("=");
// 		if( tokens[0] == "firstName" )
// 		{
// 			firstName = tokens[1];
// 		}
// 		else if( tokens[0] == "lastName" )
// 		{
// 			lastName = tokens[1];
// 		}
// 		else if( tokens[0] == "userId" )
// 		{
// 			userId = parseInt( tokens[1].trim() );
// 		}
// 	}
	
// 	if( userId < 0 )
// 	{
// 		window.location.href = "index.html";
// 	}
// 	else
// 	{
// 		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
// 	}
// }

// function doLogout()
// {
// 	userId = 0;
// 	firstName = "";
// 	lastName = "";
// 	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
// 	window.location.href = "index.html";
// }

// // for register section
// function showRegister() 
// {
//     document.getElementById("loginSection").style.display = "none";
//     document.getElementById("registerSection").style.display = "block";
// }

// // Show login section 
// function showLogin() 
// {
//     document.getElementById("registerSection").style.display = "none";
//     document.getElementById("loginSection").style.display = "block";
// }

// // Register Fucntion 
// function saveRegister(event) 
// {
//     event.preventDefault();

//     let firstName = document.getElementById("registerFirstName").value.trim();
//     let lastName = document.getElementById("registerLastName").value.trim();
//     let username = document.getElementById("registerUsername").value.trim();
//     let password = document.getElementById("registerPassword").value.trim();
//     let confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
//     let registerResult = document.getElementById("registerResult");

//     // First Name & Last Name validation (Only Letters)
//     let nameRegex = /^[A-Za-z]+$/;

//     if (!nameRegex.test(firstName)) {
//         registerResult.textContent = "First name must contain only letters (A-Z, a-z).";
//         registerResult.style.color = "red";
//         registerResult.style.fontSize = "14px";
//         registerResult.style.marginTop = "5px";
//         registerResult.style.backgroundColor = "#ffe6e6";
//         registerResult.style.padding = "5px 10px";
//         registerResult.style.borderRadius = "5px";
//         registerResult.style.display = "inline-block";
//         return;
//     }

//     if (!nameRegex.test(lastName)) {
//         registerResult.textContent = "Last name must contain only letters (A-Z, a-z).";
//         registerResult.style.color = "red";
//         registerResult.style.fontSize = "14px";
//         registerResult.style.marginTop = "5px";
//         registerResult.style.backgroundColor = "#ffe6e6";
//         registerResult.style.padding = "5px 10px";
//         registerResult.style.borderRadius = "5px";
//         registerResult.style.display = "inline-block";
//         return;
//     }

//      // username validation
//     let usernameRegex = /^[a-zA-Z]\w{3,18}$/;
//     if (!usernameRegex.test(username)) {
//         registerResult.textContent = "Username must start with a letter and contain 3-18 valid characters (letters, numbers, underscores, or hyphens). Example: A_user123 or B-12345.";
//         registerResult.style.color = "red";
//         registerResult.style.fontSize = "14px";
//         registerResult.style.marginTop = "5px";
//         registerResult.style.backgroundColor = "#ffe6e6";
//         registerResult.style.padding = "5px 10px";
//         registerResult.style.borderRadius = "5px";
//         registerResult.style.display = "inline-block";
//         return;
//     }

//     // password validation
//     let passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;
//     if (!passwordRegex.test(password)) {
//         registerResult.textContent = "Username must start with a letter and contain 3-18 valid characters (letters, numbers, underscores, or hyphens). Example: A_user123 or B-12345.";
//         registerResult.style.color = "red";
//         registerResult.style.fontSize = "14px";
//         registerResult.style.marginTop = "5px";
//         registerResult.style.backgroundColor = "#ffe6e6";
//         registerResult.style.padding = "5px 10px";
//         registerResult.style.borderRadius = "5px";
//         registerResult.style.display = "inline-block";
//         return;
//     }

//     // passwordconfirm 
//     if (password !== confirmPassword) {
//         registerResult.textContent = "Passwords do not match.";
//         registerResult.style.color = "red";
//         registerResult.style.fontSize = "14px";
//         registerResult.style.marginTop = "5px";
//         registerResult.style.backgroundColor = "#ffe6e6";
//         registerResult.style.padding = "5px 10px";
//         registerResult.style.borderRadius = "5px";
//         registerResult.style.display = "inline-block";
//         return;
//     }

//     // password hash
//     let hashPassword = md5(password);

//     // send data to server
//     let tmp = {
//         FirstName: firstName,
//         LastName: lastName,
//         Login: username,
//         Password: hashPassword
//     };

//     let jsonPayload = JSON.stringify(tmp);

//     let url = urlBase + '/Register.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     registerResult.textContent = response.error;
//                     registerResult.style.color = "red";
//                 } else {
//                     registerResult.textContent = "Registration successful! Please log in.";
//                     showLogin();
//                 }
//             } else {
//                 registerResult.textContent = `Error: ${xhr.status} - ${xhr.statusText}`;
//                 registerResult.style.color = "red";
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// // Show pop-up for add contact 
// function showAddContactPopup() 
// {
// 	document.getElementById('addPopup').style.display = 'block';
// 	document.getElementById('overlay').style.display = 'block';
// }

// // Close pop-up for add contact 
// function closeAddPopup() 
// {
// 	document.getElementById('addPopup').style.display = 'none';
// 	document.getElementById('overlay').style.display = 'none';
// }

// function saveNewContact() 
// {
// 	// Josh
// }


// // Search contact depening user id 
// function searchContacts() 
// {
//     let firstNameSearch = document.getElementById("searchFirstName").value.trim();
//     let lastNameSearch = document.getElementById("searchLastName").value.trim();
//     let contactTableBody = document.querySelector("#contactTable tbody");
//     let messageBox = document.getElementById("messageBox");

//     contactTableBody.innerHTML = "";
//     messageBox.textContent = "";

//     if (!firstNameSearch && !lastNameSearch) {
//         messageBox.innerText = "Please enter a first name or last name to search.";
//         return;
//     }

//     // send data to server
//     let tmp = {
//         FirstName: firstNameSearch,
//         LastName: lastNameSearch,
//         userID: userId 
//     };

//     let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/SearchContacts.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent = "Error: " + response.error;
//                 } else if (response.results && response.results.length > 0) {
//                     response.results.forEach((contact,index) => {
//                         let row = document.createElement("tr");
// 						row.setAttribute("data-id", contact.ID);
//                         row.innerHTML = `
// 							<td>${contact.ID}</td>
//                             <td>${contact.FirstName}</td>
//                             <td>${contact.LastName}</td>
//                             <td>${contact.Phone}</td>
//                             <td>${contact.Email}</td>
//                             <td>
//                                 <img src="../images/ellipsis.png" alt="Actions" class="ellipsis-icon" onclick="toggleActions(${index})">
//                                 <div class="action-buttons" id="actions-${index}">
//                                     <button onclick="showEditPopup(${index})">Edit</button>
//                                     <button onclick="deleteContact(${contact.ID})">Delete</button>
//                                 </div>
//                             </td>
//                         `;
//                         contactTableBody.appendChild(row);
//                     });
//                 } else {
//                     messageBox.textContent = "No records found.";
//                     addEmptyRows(10);
//                 }
//             } else {
//                 messageBox.textContent = "Error: Unable to connect to server.";
//                 addEmptyRows(10);
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// // show popup for edit contact 
// function showEditPopup(index) 
// {
//     const contactRow = document.querySelectorAll("#contactTable tbody tr")[index];

//     let contactId = contactRow.getAttribute("data-id");
// 	let firstName = contactRow.children[0].textContent.trim();
//     let lastName = contactRow.children[1].textContent.trim();
//     let phone = contactRow.children[2].textContent.trim();
//     let email = contactRow.children[3].textContent.trim();

//     document.getElementById("editPopup").setAttribute("data-id", contactId);
// 	document.getElementById("dropdown").value = "FirstName";
// 	document.getElementById("editValue").value = firstName;

// 	document.getElementById("dropdown").addEventListener("change", function () {
//         const selectedField = this.value;
//         let valueToEdit = "";

//         if (selectedField === "FirstName") {
//             valueToEdit = firstName;
//         } else if (selectedField === "LastName") {
//             valueToEdit = lastName;
//         } else if (selectedField === "Phone") {
//             valueToEdit = phone;
//         } else if (selectedField === "Email") {
//             valueToEdit = email;
//         }

//         document.getElementById("editValue").value = valueToEdit;
//     });

//     document.getElementById("editPopup").style.display = "block";
//     document.getElementById("overlay").style.display = "block";

// }

// function closeEditPopup() 
// {
// 	document.getElementById('editPopup').style.display = 'none';
// 	document.getElementById('overlay').style.display = 'none';
// }


// // edit contact 
// function saveEdit(event) 
// {
//     const contactID = document.getElementById("editPopup").getAttribute("data-id");
//     const selectedField = document.getElementById("dropdown").value;
//     const newValue = document.getElementById("editValue").value.trim();
//     const messageBox = document.getElementById("messageBox");

// 	messageBox.textContent = "";

//     // send data to server
//     const tmp = {
//         ID: contactID,
//         UpdateCol: selectedField,
//         NewData: newValue,
//     };

// 	let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/EditContact.' + extension;

// 	let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

// 	xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent("Error: " + response.error);
//                 } else {
//                     closeEditPopup();
//                     searchContacts(); 
//                 }
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// function deleteContact(index) 
// {
// 	const contactRow = document.querySelector(`#contactTable tbody tr[data-id="${index}"]`);
// 	const messageBox = document.getElementById("messageBox");

// 	messageBox.textContent = "";

// 	const contactID = index;

//     const jsonPayload = JSON.stringify({ contactID: contactID });
//     const url = urlBase + '/DeleteContact.' + extension;

// 	let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

// 	xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent = "Error: " + response.error;
//                 } else {
//                     contactRow.remove();
//                 }
//             } else {
//                 messageBox.textContent = "Error: Unable to delete the contact.";
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// document.addEventListener("click", (event) => {
//     if (!event.target.matches(".ellipsis-icon") && !event.target.closest(".action-buttons")) {
//         document.querySelectorAll(".action-buttons").forEach(popup => {
//             popup.style.display = "none";
//         });
//     }
// });

// function addEmptyRows(count) {
//     let contactTableBody = document.querySelector("#contactTable tbody");

//     for (let i = 0; i < count; i++) {
//         let row = document.createElement("tr");
//         row.innerHTML = `
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//         `;
//         contactTableBody.appendChild(row);
//     }
// }


// const urlBase = 'http://menufish.com/LAMPAPI';
// const extension = 'php';

// let userId = 0;
// let firstName = "";
// let lastName = "";

// function doLogin(event)
// {
//     event.preventDefault();

//     userId = 0;
//     firstName = "";
//     lastName = "";
    
//     let login = document.getElementById("loginName").value;
//     let password = document.getElementById("loginPassword").value;
//     let loginResult = document.getElementById("loginResult");

//     var hash = md5(password);
    
//     loginResult.innerHTML = "";

//     var tmp = { login: login, password: hash };
//     let jsonPayload = JSON.stringify(tmp);
    
//     let url = urlBase + '/Login.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     try {
//         xhr.onreadystatechange = function () {
//             if (this.readyState == 4 && this.status == 200) {
//                 let jsonObject = JSON.parse(xhr.responseText);
//                 userId = jsonObject.id;

//                 if (userId < 1) {
//                     displayMessage(loginResult, "User/Password combination incorrect");
//                     return;
//                 }

//                 firstName = jsonObject.firstName;
//                 lastName = jsonObject.lastName;

//                 saveCookie();

//                 window.location.href = "color.html";
//             }
//         };
//         xhr.send(jsonPayload);
//     } catch (err) {
//         displayMessage(loginResult, err.message);
//     }
// }

// function saveCookie()
// {
// 	let minutes = 20;
// 	let date = new Date();
// 	date.setTime(date.getTime()+(minutes*60*1000));	
// 	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
// }

// function readCookie()
// {
// 	userId = -1;
// 	let data = document.cookie;
// 	let splits = data.split(",");
// 	for(var i = 0; i < splits.length; i++) 
// 	{
// 		let thisOne = splits[i].trim();
// 		let tokens = thisOne.split("=");
// 		if( tokens[0] == "firstName" )
// 		{
// 			firstName = tokens[1];
// 		}
// 		else if( tokens[0] == "lastName" )
// 		{
// 			lastName = tokens[1];
// 		}
// 		else if( tokens[0] == "userId" )
// 		{
// 			userId = parseInt( tokens[1].trim() );
// 		}
// 	}
	
// 	if( userId < 0 )
// 	{
// 		window.location.href = "index.html";
// 	}
// 	else
// 	{
// 		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
// 	}
// }

// function doLogout()
// {
// 	userId = 0;
// 	firstName = "";
// 	lastName = "";
// 	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
// 	window.location.href = "index.html";
// }

// // for register section
// function showRegister() 
// {
//     document.getElementById("loginSection").style.display = "none";
//     document.getElementById("registerSection").style.display = "block";
// }

// // Show login section 
// function showLogin() 
// {
//     document.getElementById("registerSection").style.display = "none";
//     document.getElementById("loginSection").style.display = "block";
// }

// // Register Fucntion 
// function saveRegister(event) 
// {
//     event.preventDefault();

//     let firstName = document.getElementById("registerFirstName").value.trim();
//     let lastName = document.getElementById("registerLastName").value.trim();
//     let username = document.getElementById("registerUsername").value.trim();
//     let password = document.getElementById("registerPassword").value.trim();
//     let confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
//     let registerResult = document.getElementById("registerResult");

//      // First Name & Last Name validation (Only Letters)
//      let nameRegex = /^[A-Za-z]+$/;
//      if (!nameRegex.test(firstName)) {
//         displayMessage(registerResult, "First name must contain only letters (A-Z, a-z).");
//         return;
//      }
 
//      if (!nameRegex.test(lastName)) {
//         displayMessage(registerResult, "Last name must contain only letters (A-Z, a-z).");
//         return;
//      }

//     // username validation
//     let usernameRegex = /^[a-zA-Z]\w{3,18}$/;
//     if (!usernameRegex.test(username)) {
//         displayMessage(registerResult, "Username must start with a letter and contain 3-18 valid characters (letters, numbers, underscores, or hyphens). Example: A_user123 or B-12345.");
//         return;
//     }

//     // password validation
//     let passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;
//     if (!passwordRegex.test(password)) {
//         displayMessage(registerResult, "Password must be 8-32 characters and include at least one letter, one number, and one special character. Example: P@ssw0rd123 or Secure!456.");
//         return;
//     }

//     // passwordconfirm 
//     if (password !== confirmPassword) {
//         displayMessage(registerResult,"Passwords do not match.");
//         return;
//     }

//     // password hash
//     let hashPassword = md5(password);

//     // send data to server
//     let tmp = {
//         FirstName: firstName,
//         LastName: lastName,
//         Login: username,
//         Password: hashPassword
//     };

//     let jsonPayload = JSON.stringify(tmp);

//     let url = urlBase + '/Register.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     displayMessage(registerResult,response.error);
//                 } else {
//                     showLogin();
//                 }
//             } else {
//                 displayMessage(registerResult,`Error: ${xhr.status} - ${xhr.statusText}`);
//             }
//         }
//     };
//     xhr.send(jsonPayload);
// }

// // Show pop-up for add contact 
// function showAddContactPopup() 
// {
// 	document.getElementById('addPopup').style.display = 'block';
// 	document.getElementById('overlay').style.display = 'block';
// }

// // Close pop-up for add contact 
// function closeAddPopup() 
// {
// 	document.getElementById('addPopup').style.display = 'none';
// 	document.getElementById('overlay').style.display = 'none';
// }

// function saveNewContact() 
// {
// 	// Josh
// }

// function loadUserContacts() 
// {
//     let contactTableBody = document.querySelector("#contactTable tbody");
//     let messageBox = document.getElementById("messageBox");

//     contactTableBody.innerHTML = "";
//     messageBox.textContent = "";

//     let tmp = {
//         FirstName: "",  
//         LastName: "",
//         userID: userId 
//     };

//     let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/SearchContacts.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);
//                 if (response.error) {
//                     displayMessage(messageBox,`Error: ${xhr.status} - ${xhr.statusText}`);
//                     addEmptyRows(15);
//                 } else if (response.results && response.results.length > 0) {
//                     response.results.forEach((contact, index) => {
//                         let row = document.createElement("tr");
//                         row.setAttribute("data-id", contact.ID);
//                         row.innerHTML = `
//                             <td>${contact.FirstName}</td>
//                             <td>${contact.LastName}</td>
//                             <td>${contact.Phone}</td>
//                             <td>${contact.Email}</td>
//                             <td>
//                                 <div>
//                                     <button class="editing-icon" onclick="showEditPopup(${index})"> Edit </button>
//                                     <button onclick="deleteContact(${contact.ID})">Delete</button>
//                                 </div>
//                             </td>
//                         `;
//                         contactTableBody.appendChild(row);
//                     });

//                     let emptyRowCount = 15 - response.results.length;
//                     if (emptyRowCount > 0) {
//                         addEmptyRows(emptyRowCount);
//                     }

//                 } else {
//                     displayMessage(messageBox,"No contacts found.");
//                     addEmptyRows(15);
//                 }
//             } else {
//                 displayMessage(messageBox,"Error: Unable to connect to server.");
//                 addEmptyRows(15);
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// // Search contact depening user id 
// function searchContacts() 
// {
//     let firstNameSearch = document.getElementById("searchFirstName").value.trim();
//     let lastNameSearch = document.getElementById("searchLastName").value.trim();
//     let contactTableBody = document.querySelector("#contactTable tbody");
//     let messageBox = document.getElementById("messageBox");

//     contactTableBody.innerHTML = "";
//     messageBox.textContent = "";

//     if (!firstNameSearch && !lastNameSearch) {
//         displayMessage(messageBox,"Please enter a first name or last name to search.");
//         addEmptyRows(15);
//         return;
//     }

//     // send data to server
//     let tmp = {
//         FirstName: firstNameSearch,
//         LastName: lastNameSearch,
//         userID: userId 
//     };

//     let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/SearchContacts.' + extension;

//     let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);
//                 if (response.error) {
//                     displayMessage(messageBox,"Error: " + response.error);
//                     addEmptyRows(15);
//                 } else if (response.results && response.results.length > 0) {
//                     response.results.forEach((contact,index) => {
//                         let row = document.createElement("tr");
// 						row.setAttribute("data-id", contact.ID);
//                         row.innerHTML = `
//                             <td>${contact.FirstName}</td>
//                             <td>${contact.LastName}</td>
//                             <td>${contact.Phone}</td>
//                             <td>${contact.Email}</td>
//                             <td>
//                                 <div>
//                                     <button class="editing-icon" onclick="showEditPopup(${index})"> Edit </button>
//                                     <button onclick="deleteContact(${contact.ID})">Delete</button>
//                                 </div>
//                             </td>
//                         `;
//                         contactTableBody.appendChild(row);
//                     });

//                     let emptyRowCount = 15 - response.results.length;
//                     if (emptyRowCount > 0) {
//                         addEmptyRows(emptyRowCount);
//                     }

//                 } else {
//                     displayMessage(messageBox,"No contacts found.");
//                     addEmptyRows(15);
//                 }
//             } else {
//                 displayMessage(messageBox,"Error: Unable to connect to server.");
//                 addEmptyRows(15);
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// // Show popup for edit contact 
// // To implement the popup so that it displays the existing contact data
// function showEditPopup(index) 
// {
//     const contactRow = document.querySelectorAll("#contactTable tbody tr")[index];

//     let contactId = contactRow.getAttribute("data-id");
// 	let firstName = contactRow.children[0].textContent.trim();
//     let lastName = contactRow.children[1].textContent.trim();
//     let phone = contactRow.children[2].textContent.trim();
//     let email = contactRow.children[3].textContent.trim();

//     document.getElementById("editPopup").setAttribute("data-id", contactId);
// 	document.getElementById("dropdown").value = "FirstName";
// 	document.getElementById("editValue").value = firstName;

// 	document.getElementById("dropdown").addEventListener("change", function () {
//         const selectedField = this.value;
//         let valueToEdit = "";

//         if (selectedField === "FirstName") {
//             valueToEdit = firstName;
//         } else if (selectedField === "LastName") {
//             valueToEdit = lastName;
//         } else if (selectedField === "Phone") {
//             valueToEdit = phone;
//         } else if (selectedField === "Email") {
//             valueToEdit = email;
//         }

//         document.getElementById("editValue").value = valueToEdit;
//     });

//     document.getElementById("editPopup").style.display = "block";
//     document.getElementById("overlay").style.display = "block";
// }

// function closeEditPopup() 
// {
// 	document.getElementById('editPopup').style.display = 'none';
// 	document.getElementById('overlay').style.display = 'none';
// }


// // Edit contact 
// // To save the changes to the server
// function saveEdit(event) 
// {
//     const contactID = document.getElementById("editPopup").getAttribute("data-id");
//     const selectedField = document.getElementById("dropdown").value;
//     const newValue = document.getElementById("editValue").value.trim();
//     const messageBox = document.getElementById("messageBox");

// 	messageBox.textContent = "";

//     // send data to server
//     const tmp = {
//         ID: contactID,
//         UpdateCol: selectedField,
//         NewData: newValue,
//     };

// 	let jsonPayload = JSON.stringify(tmp);
//     let url = urlBase + '/EditContact.' + extension;

// 	let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

// 	xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent("Error: " + response.error);
//                 } else {
//                     closeEditPopup();
//                     searchContacts(); 
//                 }
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// function deleteContact(index) 
// {
// 	const contactRow = document.querySelector(`#contactTable tbody tr[data-id="${index}"]`);
// 	const messageBox = document.getElementById("messageBox");

// 	messageBox.textContent = "";

// 	const contactID = index;

//     const jsonPayload = JSON.stringify({ contactID: contactID });
//     const url = urlBase + '/DeleteContact.' + extension;

// 	let xhr = new XMLHttpRequest();
//     xhr.open("POST", url, true);
//     xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

// 	xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 let response = JSON.parse(xhr.responseText);

//                 if (response.error) {
//                     messageBox.textContent = "Error: " + response.error;
//                 } else {
//                     contactRow.remove();
//                 }
//             } else {
//                 messageBox.textContent = "Error: Unable to delete the contact.";
//             }
//         }
//     };

//     xhr.send(jsonPayload);
// }

// document.addEventListener("click", (event) => {
//     if (!event.target.matches(".ellipsis-icon") && !event.target.closest(".action-buttons")) {
//         document.querySelectorAll(".action-buttons").forEach(popup => {
//             popup.style.display = "none";
//         });
//     }
// });

// function addEmptyRows(count) {
//     let contactTableBody = document.querySelector("#contactTable tbody");

//     for (let i = 0; i < count; i++) {
//         let row = document.createElement("tr");
//         row.innerHTML = `
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//             <td></td>
//         `;
//         contactTableBody.appendChild(row);
//     }
// }

// function displayMessage(element, message, color = "red") {
//     element.textContent = message;
//     element.style.color = color;
//     element.style.fontSize = "14px";
//     element.style.marginTop = "5px";
//     element.style.backgroundColor = color === "red" ? "#ffe6e6" : "#e6ffe6";
//     element.style.padding = "5px 10px";
//     element.style.borderRadius = "5px";
//     element.style.display = "inline-block";
// }
