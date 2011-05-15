onload = function() {
  if(localStorage.status && localStorage.status == 'true') {
    message.style.color = "red";
  }else{
    message.style.class = "white"
  }
  if(typeof localStorage.user == 'undefined') init();
  options.user.value        = (localStorage.user) ? localStorage.user : "";
  options.password.value    = (localStorage.password) ? localStorage.password : "";
  options.seconds.value     = (localStorage.seconds) ? localStorage.seconds : 5;

  options.seconds.onchange  = function() {
    localStorage.seconds    = options.seconds.value;
  };
  options.isActive.checked  = (localStorage.isActive) ? JSON.parse(localStorage.isActive) : false;

  gray_out(options.isActive.checked);
  options.isActive.onchange = function() {
    localStorage.isActive = options.isActive.checked;
    gray_out(options.isActive.checked);
  };

};
function init() {
  localStorage.user = "";
  localStorage.password = "";
  localStorage.seconds = 5;
  localStorage.isActive = false;
  options.isActive.checked = JSON.parse(localStorage.isActive);
}
function gray_out(status) {
  options.style.color = status ? 'graytext' : 'black';
  options.seconds.disabled = status;
  if(status) {
    options.user.disabled = "disabled";
    options.password.disabled = "disabled";
  }else{
    options.user.disabled = "";
    options.password.disabled = "";
  }
};
function save() {
  localStorage.user = options.user.value;
  localStorage.password = options.password.value;
  options.seconds = options.seconds.value;
  localStorage.isActive = options.isActive.checked;
  chrome.extension.getBackgroundPage().start();
};
function restart() {
  chrome.extension.getBackgroundPage().start();
}
