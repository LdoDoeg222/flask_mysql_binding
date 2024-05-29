import register from "./apis/registerApis.js";
import { push_react } from "./utils/reactivity.js";
const alert_text = (text = "") => {
  $(".alert").text(text);
};
const handleSubmit = async () => {
  const type = $('input[name="type"]:checked').val();
  const username = $('input[title="username"]').val();
  const email = $('input[title="email"]').val();
  const department = $('input[title="department"]').val();
  const password = $('input[title="password"]').val();
  const password_confirm = $('input[title="password_confirm"]').val();

  if (password !== password_confirm) {
    alert_text("Password does not match.");
  } else if (
    !email ||
    !username ||
    !password ||
    !password_confirm ||
    (type === "1" && !department)
  ) {
    alert_text("Some form item null");
  } else {
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
    if (type === "1") {
      userData.department = department;
    }

    const result = await register(userData);
    $(".modal input").prop("disabled", false);
    $('.modal input[type="submit"]').prop("disabled", false);
    $('.modal input[type="button"]').prop("disabled", false);
    if (result.isSuccess) {
      alert_text("Register Successfully, redirecting to login page...");
      setTimeout(() => {
        window.location.href = "#/login";
        location.reload();
      }, 2000);
    } else {
      alert_text(result.msg);
    }
  }
};
push_react(
  () => {
    $('input[name="type"]')
      .off("change")
      .on("change", (ev) => {
        if (ev.target.value === "1") {
          $(".Instructor").show();
        } else {
          $(".Instructor").hide();
        }
      });
    $(".Instructor").hide();
    $("form")
      .off("submit")
      .on("submit", (ev) => {
        ev.preventDefault();
        handleSubmit(ev);
      });
  },
  "pageloaded",
  { immediate: true }
);
