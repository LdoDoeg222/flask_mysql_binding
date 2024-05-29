import { initFeedback } from "./utils/feedback-initial.js";
import { push_react } from "./utils/reactivity.js";
push_react(
  () => {
    initFeedback();
  },
  "pageloaded",
  { immediate: true }
);
