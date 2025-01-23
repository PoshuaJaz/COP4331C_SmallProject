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

function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddColor.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
	
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchColors.' + extension;
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
	
}

// FOR REGISTER 
function showRegister() {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("registerSection").style.display = "block";
}

function showLogin() {
    document.getElementById("registerSection").style.display = "none";
    document.getElementById("loginSection").style.display = "block";
}

// yoni function: done 
// need to implement restrictions for the username and password ??
function saveRegister(event) {
    event.preventDefault();

    let firstName = document.getElementById("registerFirstName").value.trim();
    let lastName = document.getElementById("registerLastName").value.trim();
    let username = document.getElementById("registerUsername").value.trim();
    let password = document.getElementById("registerPassword").value.trim();
    let confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
    let registerResult = document.getElementById("registerResult");

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

// FOR SEARCH
// yoni working 
function showAllContacts() {
	let contactTableBody = document.querySelector("#contactTable tbody");
	let messageBox = document.getElementById("messageBox");

    contactTableBody.innerHTML = "";
	messageBox.textContent = "";

	// send data to server
	let tmp = { userId: userId }; 
	let jsonPayload = JSON.stringify(tmp);
    let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	
	xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200)
		{	
			let response = JSON.parse(xhr.responseText);

            if (response.error) {
                messageBox.textContent = "Error: " + response.error; 
            } else {
				response.results.forEach(contact => {
					let row = document.createElement("tr");
					row.innerHTML = `
						<td>${contact.firstName}</td>
						<td>${contact.lastName}</td>
						<td>${contact.phone}</td>
						<td>${contact.email}</td>
					`;
					contactTableBody.appendChild(row);
				});
			}
        }
    };

    xhr.send(jsonPayload);
}

// yoni - working 
function searchContacts() {
    let firstNameSearch = document.getElementById("searchFirstName").value.trim();
    let lastNameSearch = document.getElementById("searchLastName").value.trim();
    let contactTableBody = document.querySelector("#contactTable tbody");
	let messageBox = document.getElementById("messageBox");

	contactTableBody.innerHTML = "";
    messageBox.textContent = "";

	if (!firstNameSearch && !lastNameSearch) {
		document.getElementById("messageBox").innerText = "Please enter a first name or last name to search.";
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
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);

            if (response.error) {
                messageBox.textContent = "Error: " + response.error;
            } else {
                response.results.forEach(contact => {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${contact.FirstName}</td>
                        <td>${contact.LastName}</td>
                        <td>${contact.Phone}</td>
                        <td>${contact.Email}</td>
                    `;
                    contactTableBody.appendChild(row);
                });
            }
        }
    };

    xhr.send(jsonPayload);
}

// FOR ADD
function showAddContactPopup() {
	document.getElementById('addPopup').style.display = 'block';
	document.getElementById('overlay').style.display = 'block';
}

function closeAddPopup() {
	document.getElementById('addPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}

function saveNewContact() {
	// Josh
}

// FOR EDIT
function showEditPopup(index) {
	// TBD
}

function closeEditPopup() {
	document.getElementById('editPopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}
	
function saveEdit() {
  console.log("saveEdit");
  closeEditPopup();
}

// FOR DELETE
function closeDeletePopup() {
	document.getElementById('deletePopup').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}
	
function deleteContact() {
	// TBD
}

