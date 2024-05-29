import Res from "../types/res.js";
import myFetch from "../utils/myFetch.js";

/**
 * !Done
 * @param {{submission_id: number}} dto
 * @returns {Promise<Res>}
 */
const getSubmissionFeedBackBySubmissionId = async (dto) => {
  try {
    const res = await myFetch(
      "/submission/getSubmissionFeedBackBySubmissionId",
      dto,
      { method: "POST" }
    );
    if (res.isSuccess) {
      const {
        submissionFeedBack: feedback,
        submissionFeedBackDetailList: detailList,
      } = res.data.SubmissionFeedBackInfo;
      res.data = { feedback, detailList };
      res.data.detailList.map((detail) => {
        const { criteria, comment, score_get, score_sum } = detail;
        return {
          criteria,
          comment,
          score_get,
          score_sum,
        };
      });
      return res;
    }
    throw new Error(res.msg);
  } catch (err) {
    console.error(err);
    return new Res(err.message, false, { feedback: {}, detailList: [] });
  }
};

/**
 * !Done
 * @param {{submission_id: number, title_information: string}} dto
 */
const addSubmissionFeedBack = async (dto) => {
  try {
    const res = await myFetch("/submission/addSubmissionFeedBack", dto, {
      method: "PUT",
    });

    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};
/**
 * TODO:
 * @param {{submission_feedback_id: number, title_information: string\
 * , score_total: number, score_get: number}} dto
 */
const updateSubmissionFeedBack = async (dto) => {
  try {
    const res = await myFetch("/submission/updateSubmissionFeedBack", dto, {
      method: "POST",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};
/**
 * TODO:
 * @param {{submission_feedback_id: number, criteria: string, comment:string, score_sum:number, score_get:number}} dto
 * @returns {Promise<Res>}
 */
const addSubmissionFeedBackDetail = async (dto) => {
  try {
    const res = await myFetch("/submission/addSubmissionFeedBackDetail", dto, {
      method: "PUT",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !Done
 * @param {{submission_feedback_detail_id: number, criteria: string, comment: string, score_sum: number, score_get: number}} dto
 * @returns
 */
const updateSubmissionFeedBackDetail = async (dto) => {
  try {
    const res = await myFetch(
      "/submission/updateSubmissionFeedBackDetail",
      dto,
      {
        method: "POST",
      }
    );
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * TODO:
 * @param {{submission_feedback_detail_id: number}} dto
 * @returns
 */
const deleteSubmissionFeedBackDetail = async (dto) => {
  try {
    const res = await myFetch(
      "/submission/deleteSubmissionFeedBackDetail",
      dto,
      { method: "DELETE" }
    );
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

export {
  addSubmissionFeedBack,
  updateSubmissionFeedBack,
  getSubmissionFeedBackBySubmissionId,
  addSubmissionFeedBackDetail,
  updateSubmissionFeedBackDetail,
  deleteSubmissionFeedBackDetail,
};
