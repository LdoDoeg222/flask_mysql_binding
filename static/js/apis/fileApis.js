import Res from "../types/res.js";
import myFetch from "../utils/myFetch.js";

const listFiles = async () => {
  try {
    const res = await myFetch("/file/ListFiles");
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

const uploadFile = async (dto) => {
  try {
    const res = await myFetch("/file/upload", dto, { method: "POST" });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

export { listFiles, uploadFile };
