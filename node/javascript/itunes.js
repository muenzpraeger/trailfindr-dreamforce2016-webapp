function registerItunes() {
  var mail = document.getElementById('mail').value;
  if (validateEmail(mail)) {
    var mailAddress = {};
    mailAddress.mail = mail;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/itunes");
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText == 'done') {
          alert('TestFlight invitation has been sent to ' + mail + '.');
          document.getElementById('mail').value = '';
        } else if (xhr.status > 200) {
          alert('Error ' + xhr.status);
        }
    }
    xhr.send(JSON.stringify(mailAddress));
  } else {
    // TODO Add info for non-valid mail address
  }
}


function validateEmail(mail)
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    alert("You have entered an invalid email address!")
    return (false)
}
