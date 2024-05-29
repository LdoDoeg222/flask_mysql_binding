import Res from "../types/res.js";
import myFetch from "../utils/myFetch.js";

/**
 * @param userData
 * @returns rtn = {isSuccess, msg}
 */
const login = async (userData) => {
  try {
    const rtn = await myFetch("/login", userData, { method: "POST" });

    return rtn;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

export default login;
