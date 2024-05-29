import { push_react } from "./utils/reactivity.js";
push_react(
  () => {
    $("#main").height($(window).height() - $("#header").height());
    $(".modal").height($(window).height() - $("#header").height());
  },
  "resize",
  { immediate: true }
);
