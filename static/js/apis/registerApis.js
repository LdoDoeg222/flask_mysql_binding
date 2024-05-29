import Res from "../types/res.js";
import myFetch from "../utils/myFetch.js";

/**
 * @param userData
 */
const register = async (userData) => {
  try {
    const rtn = await myFetch("/register", userData, { method: "PUT" });
    return rtn;
  } catch (error) {
    return new Res(error.message);
  }
};

export default register;
