if (getCookie('twitterSend')) {
    console.log('esta el cookie')
    document.querySelector('.form-section').style.display = 'none'
} else {
    document.querySelector('.form-section').style.display = 'block'
}
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

const twForm = document.querySelector('#twForm')
const tiwtter_user = document.querySelector('#tiwtter_user')
const walletId = document.querySelector('#walletId')

twForm.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log(tiwtter_user.value)
    let data = {
        tiwtter_user: tiwtter_user.value,
        walletId: walletId.value
    };
    fetch('https://hooks.zapier.com/hooks/catch/803715/bma2ygb/', {
        method: 'POST', // or 'PUT'
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'no-cors',
    })
        .then(response => response)
        .then(data => {
            console.log('Success:', data);
            swal({
                title: "Your Twitter username was successfully submitted!",
                text: "We will get back to you via DM shortly.",
                icon: "success",
                button: "Exit",
            });
            document.querySelector('.form-section').style.display = 'none'
            setCookie('twitterSend', true, 2);
            // window.location.href = window.location.href;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});