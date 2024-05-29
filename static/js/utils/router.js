import { run_react } from "./reactivity.js";
import identity from "./identity.js";
// methods
const loadContent = async (route) => {
  console.log("router.js", "loadContent", route);
  const complete_data = (response, status) => {
    if (status === "success") {
      run_react("pageloaded");
    }
  };
  if (route && route !== "/") {
    $("#main").load(`/static/html/pages${route}.html`, complete_data);
  } else {
    $("#main").load(`/static/html/pages/home.html`);
  }
};
const getPageFromHash = () => window.location.hash.substring(1);
const clearParam = () => {
  const href = location.href;
  if (href.indexOf("?") !== -1) {
    location.href =
      href.substring(0, href.lastIndexOf("?")) +
      href.substring(href.indexOf("#"));
  }
};
const needIdentifyRoutes = ["", "/home", "/courses", "/message"];
const identifyRoutes = ["/login", "/register"];

/**
 * @brief Guard route and return false if route is not allowed.
 * @description
 * Redirect to login page if not identified and accessing routes need identify. \
 * Redirect to type/home page if identified and accessing routes to identifying. \
 * If window.location.href changed, return false. \
 * Else, return true.
 * @param route
 * @returns {boolean}
 */
const guardRoute = (route) => {
  let guardLocation = route;
  // console.log("guarding route");
  // console.error(guardLocation);

  if (needIdentifyRoutes.includes(route)) {
    // Route need identify
    // console.log("awa");

    if (identity.type !== -1) {
      // is identified
      if (route.lastIndexOf(identity.type_id[identity.type]) === -1) {
        guardLocation = `/${identity.type_id[identity.type]}${route}`;
        history.replaceState({ page: route }, "", `#${guardLocation}`);
        loadContent(guardLocation);
        return false;
      }
    } else {
      // not identified
      guardLocation = `/login`;
      history.replaceState({ page: route }, null, `#${guardLocation}`);
      loadContent(guardLocation);
      return false;
    }
  } else if (identifyRoutes.includes(route)) {
    // Route is identification
    // console.log("bwb");

    if (identity.type !== -1) {
      // not identified
      const prev = history.state || "/home";
      window.location.href = `#${prev}`;
      return false;
    }
  } else if (route.lastIndexOf(identity.type_id[identity.type]) === 1) {
    // console.log("cwc");
  } else if (identity.type === -1) {
    // console.log("dwd");
    history.replaceState({ page: route }, "", "#/login");
    return false;
  } else {
    // console.log("ewe");
  }

  return true;
};

/**
 * If route guard and hash change,
 * this handler function will be triggered again.
 */
const hashchangeHandler = async () => {
  const nowRoute = getPageFromHash();
  // console.log("router.js", nowRoute, "hashchangeHandler");

  if (guardRoute(nowRoute)) {
    // console.warn("guard true", nowRoute);
    // history.pushState(null, null, `#${nowRoute}`);
    await loadContent(nowRoute);
  }
};

// lifecycles & events
// init pages
$(window).ready(() => {
  $(document).ready(() => {
    const initialPage = getPageFromHash() || "/home";
    history.replaceState({ page: initialPage }, "", `#${initialPage}`);
    hashchangeHandler();
  });
  // location.reload();
});
clearParam();

$(window).on("hashchange", hashchangeHandler);
