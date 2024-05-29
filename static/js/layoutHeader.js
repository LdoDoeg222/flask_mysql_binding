import identity from "./utils/identity.js";
import { push_react } from "./utils/reactivity.js";
$(document).ready(() => {
  const updateUserContainer = () => {
    if (identity.type != -1) {
      $(".user-info-container").show();
      $(".login-container").hide();
    } else {
      $(".user-info-container").hide();
      $(".login-container").show();
    }
  };
  $(".user-container").on("click", () => {
    updateUserContainer();
  });
  push_react(updateUserContainer, "pageloaded", { immediate: true });
});
$(document).ready(() => {
  push_react(
    () => {
      if (identity.type === 0) {
        $(".nav-container").html(`
      <a href="#/student/home">Home</a>
      <a href="#/student/courses">Courses</a>
      <a href="#/student/content-access">Content Access</a>
      `);
        $(".message-container").hide();
        $(".user-name").attr("href", "#/student/home").text(identity.username);
      } else if (identity.type === 1) {
        $(".nav-container").html(`
      <a href="#/instructor/home">Home</a>
      <a href="#/instructor/courses">Courses</a>
      `);
        $(".message-container").hide();
        $(".user-name")
          .attr("href", "#/instructor/home")
          .text(identity.username);
      } else if (identity.type === 2) {
        $(".nav-container").html(`
      <a href="#/admin/home">Home</a>
      `);
        $(".message-container").hide();
        $(".user-name").attr("href", "#/admin/home").text(identity.username);
      }
    },
    "pageloaded",
    { immediate: true }
  );

  $(document).on("click", "a", function (event) {
    let href = $(this).attr("href");
    if (href && href.startsWith("/") && !$(this).hasClass("no-routing")) {
      event.preventDefault();
      let page = href.substring(1);
      loadContent(page);
      history.pushState({ page: page }, "", "/" + page);
    }
  });
  $(".user-log-out").on("click", () => {
    identity.logout();
    setTimeout(() => {
      window.location.href = "#/login";
    }, 100);
  });
});
