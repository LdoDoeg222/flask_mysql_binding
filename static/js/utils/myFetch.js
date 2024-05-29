import Res from "../types/res.js";

let lock = false;
const timeout = 100;

/**
 * @param {string} url
 * @param {any} data
 * @param {RequestInit} [options = { method }]
 * @return {Promise<Res>}
 */
const myFetch = async (url, data = undefined, options = { method: "GET" }) => {
  const baseUrl = "http://127.0.0.1:5000";
  try {
    if (!lock) lock = true;
    while (lock) {
      await new Promise((resolve) => {
        setTimeout(resolve, timeout);
      });

      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      // if get, data attach to url
      if (options.method === "GET") {
        if (data) {
          // Add param in URL
          url += "?";
          for (const key in data) {
            url += key + "=" + data[key] + "&";
          }
        }
      }
      // DEBUG:
      // console.warn(`fetching in ${url} with data:`, data, options);
      const fetchResult = await fetch(baseUrl + url, {
        ...options,
        mode: "cors",
        // if not get, data attach to body
        body: options.method === "GET" ? undefined : formData,
      });
      const response = await fetchResult.json();
      lock = false;
      if (response.code === 200) {
        return new Res(response.msg, response.code === 200, response.data);
      } else {
        throw new Error(response.msg);
      }
    }
    throw new Error("locked panic");
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

export default myFetch;
