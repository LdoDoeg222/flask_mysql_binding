import { run_react } from "./js/utils/reactivity.js";
import identity from "./js/utils/identity.js";
import {} from "./js/utils/router.js";

$("#header").load("./static/html/layout/header.html");
$("#main").load("./static/html/layout/main.html");

Date.prototype.toString = function () {
  return `${this.getFullYear()}-${(this.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${this.getDate()
    .toString()
    .padStart(2, "0")}T${this.getHours()
    .toString()
    .padStart(2, "0")}:${this.getMinutes()
    .toString()
    .padStart(2, "0")}:${this.getSeconds().toString().padStart(2, "0")}`;
};

identity.checkLocalLoggedIn();

$(window).on("resize", () => {
  run_react("resize");
});
