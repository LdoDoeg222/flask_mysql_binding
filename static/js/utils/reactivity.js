const react = {};
const push_react = (
  reactFunc,
  eventName,
  option = { immediate: false, times: -1 }
) => {
  try {
    if (eventName == undefined || eventName == "")
      throw new Error("Event cannot be null");
    if (!(reactFunc instanceof Function))
      throw new Error("Object push into react array must be a function!");

    if (option.immediate) reactFunc();
    if (!react[eventName]) react[eventName] = [];

    react[eventName].push({ reactFunc, times: option.times ?? -1 });
  } catch (err) {
    console.error(err.message);
  }
};
const run_react = (eventName) => {
  if (eventName) {
    if (react[eventName]) {
      react[eventName].forEach((reactObj, index) => {
        reactObj.reactFunc();
        if (reactObj.times > 0) {
          react[eventName][index].times--;
        } else if (reactObj.times == 0) {
          react[eventName].splice(index, 1);
        }
      });
    }
  }
};

export { push_react, run_react };
