var iframe_id = "example";
var updateIframeHeight = "true";
var hide_page_until_loaded_external = "true";
var scroll_to_top = "#totop";
var usePostMessage = true;
// var debugPostMessage = true;
var resize_on_element_resize = "body";
var resize_on_element_resize_delay = 0;
var enable_responsive_iframe = "true";

loadScript("./js/jquery.js");
loadScript("./js/ai_external.js");
loadScript("./govuk-frontend/govuk-frontend-4.0.0.min.js");

function loadScript(url) {
  let script = document.createElement('script'); // create a script DOM node
  script.src = url; // set its src to the provided URL
  document.head.appendChild(script); // add it to the end of the head section of the page (could change 'head' to 'body' to add it to the end of the body section instead)
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function updateScoreHTML() {
  let score = getUrlParameter('score');
  score = score ? score : 0;
  document.querySelector('.score').innerHTML = score;
}

// format: DD/MM/YY hh:mm:ss
function getFormattedDate(date) {
  let year = date.getFullYear(),
      month = (date.getMonth() + 1).toString(),
      formattedMonth = (month.length === 1) ? ('0' + month) : month,
      day = date.getDate().toString(),
      formattedDay = (day.length === 1) ? ('0' + day) : day,
      hour = date.getHours().toString(),
      formattedHour = (hour.length === 1) ? ('0' + hour) : hour,
      minute = date.getMinutes().toString(),
      formattedMinute = (minute.length === 1) ? ('0' + minute) : minute,
      second = date.getSeconds().toString(),
      formattedSecond = (second.length === 1) ? ('0' + second) : second;
  return formattedDay + '/' + formattedMonth + '/' + year + ' ' + formattedHour + ':' + formattedMinute + ':' + formattedSecond;
}

// format: hh:mm:ss
function getDiffTimeString(diff) {
  // time calculations for hours, minutes and seconds
  let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.round((diff % (1000 * 60)) / 1000);
  hours = (hours.toString().length === 1) ? ('0' + hours) : hours;
  minutes = (minutes.toString().length === 1) ? ('0' + minutes) : minutes;
  seconds = (seconds.toString().length === 1) ? ('0' + seconds) : seconds;
  return `${hours}:${minutes}:${seconds}`;
}

function backToTop() {
  document.querySelector('.anchor').scrollIntoView({ block: "start" });
}

backToTop();
