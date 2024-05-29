import login from "./apis/loginApis.js";
import identity from "./utils/identity.js";
const alert_text = (text = "") => {
  $(".alert").text(text);
};
const handleSubmit = async () => {
  const username = $('input[title="username"]').val();
  const password = $('input[title="password"]').val();
  const type = $('input[name="type"]:checked').val();

  // after checking form
  $(".modal input").prop("disabled", true);
  $('.modal input[type="submit"]').prop("disabled", true);
  $('.modal input[type="button"]').prop("disabled", true);
  alert_text();
  const userData = {
    username,
    password,
    type,
  };
  const result = await login(userData);
  $(".modal input").prop("disabled", false);
  $('.modal input[type="submit"]').prop("disabled", false);
  $('.modal input[type="button"]').prop("disabled", false);
  if (result.isSuccess) {
    alert_text("Login Successfully, redirecting to home page...");
    setTimeout(() => {
      identity.type = result.data.identity;
      identity.user_id = result.data.userId || 1;
      identity.username = userData.username;
      identity.setLoggedIn();
      window.location.href = "#/home";
    }, 1500);
  } else {
    alert_text(result.msg);
  }
};

$(window).ready(() => {
  $("form")
    .off("submit")
    .on("submit", (ev) => {
      ev.preventDefault();
      handleSubmit(ev);
    });
});
