// Set the date we're counting down to
var countDownDate = new Date("12/07/2021 17:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

// Get today's date and time
var now = new Date().getTime();

// Find the distance between now and the count down date
var distance = countDownDate - now;

// Time calculations for days, hours, minutes and seconds
var days = Math.floor(distance / (1000 * 60 * 60 * 24));
var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
var seconds = Math.floor((distance % (1000 * 60)) / 1000);

// Display the result in the element with id="demo"
document.getElementById("days").innerText = days
document.getElementById("hours").innerText = hours
document.getElementById("minutes").innerText = minutes
document.getElementById("seconds").innerText = seconds

// If the count down is finished, write some text
if (distance < 0) {
    document.querySelector('.button_connect').disabled = true;
    document.querySelector('.message_active').style.display = 'none';
    document.querySelector('.message_inactive').style.display = 'block';
    document.getElementById('disclaimer_btn').style.display = 'none'
    clearInterval(x);0
    document.getElementById("days").innerText = '0'
    document.getElementById("hours").innerText = '0'
    document.getElementById("minutes").innerText = '0'
    document.getElementById("seconds").innerText = '0'
    document.querySelector('.message-section').style.display = 'none'
}
}, 1000);