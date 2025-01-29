const urlBase = 'http://menufish.com/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";
	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	
	var hash = md5( password );
	
	document.getElementById("loginResult").innerHTML = "";

	//let tmp = {login:login,password:password};
	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );
	
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
		
				if( userId < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
		
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
	
				window.location.href = "color.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
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
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
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

    // username validation
    let usernameRegex = /^[a-zA-Z]\w{3,18}$/;
    if (!usernameRegex.test(username)) {
        registerResult.textContent = "Username must start with a letter and contain 3-18 valid characters (letters, numbers, underscores, or hyphens). Example: A_user123 or B-12345.";
        registerResult.style.color = "red";
        return;
    }

    // password validation
    let passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,32}$/;
    if (!passwordRegex.test(password)) {
        registerResult.textContent = "Password must be 8-32 characters and include at least one letter, one number, and one special character. Example: P@ssw0rd123 or Secure!456.";
        registerResult.style.color = "red";
        return;
    }

    // passwordconfirm 
    if (password !== confirmPassword) {
        registerResult.textContent = "Passwords do not match.";
        registerResult.style.color = "red";
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
                    registerResult.textContent = response.error;
                    registerResult.style.color = "red";
                } else {
                    registerResult.textContent = "Registration successful! Please log in.";
                    showLogin();
                }
            } else {
                registerResult.textContent = `Error: ${xhr.status} - ${xhr.statusText}`;
                registerResult.style.color = "red";
            }
        }
    };

    xhr.send(jsonPayload);
}

// Show pop-up for add contact 
function showAddContactPopup() 
{
	document.getElementById('addPopup').style.display = 'block';
	document.getElementById('overlay').style.display = 'block';
}

// Close pop-up for add contact 
function closeAddPopup() 
{
	document.getElementById('addPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}

function saveNewContact() 
{
	// Josh
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

    if (!firstNameSearch && !lastNameSearch) {
        messageBox.innerText = "Please enter a first name or last name to search.";
        addEmptyRows(15);
        return;
    }

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
                    messageBox.textContent = "Error: " + response.error;
                    addEmptyRows(15);
                } else if (response.results && response.results.length > 0) {
                    response.results.forEach((contact,index) => {
                        let row = document.createElement("tr");
						row.setAttribute("data-id", contact.ID);
                        row.innerHTML = `
                            <td>${contact.FirstName}</td>
                            <td>${contact.LastName}</td>
                            <td>${contact.Phone}</td>
                            <td>${contact.Email}</td>
                            <td>
                                <div>
                                    <button class="editing-icon" onclick="showEditPopup(${index})"> Edit </button>
                                    <button class="delete-icon" onclick="deleteContact(${index})"> Delete </button>
                                </div>
                            </td>
                        `;
                        contactTableBody.appendChild(row);
                    });

                    let emptyRowCount = 15 - response.results.length;
                    if (emptyRowCount > 0) {
                        addEmptyRows(emptyRowCount);
                    }

                } else {
                    messageBox.textContent = "No records found.";
                    addEmptyRows(15);
                }
            } else {
                messageBox.textContent = "Error: Unable to connect to server.";
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

}

function closeEditPopup() 
{
	document.getElementById('editPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}


// Edit contact 
// To save the changes to the server
function saveEdit(event) 
{

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
