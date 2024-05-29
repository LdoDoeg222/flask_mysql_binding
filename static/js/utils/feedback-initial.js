import identity from "./identity.js";
import { push_react } from "./reactivity.js";

import {
  getSubmissionFeedBackBySubmissionId,
  addSubmissionFeedBack,
  updateSubmissionFeedBackDetail,
  updateSubmissionFeedBack,
  deleteSubmissionFeedBackDetail,
} from "../apis/feedbackApis.js";

const keys = ["criteria", "comment", "score_get", "score_sum"];

const alert_text = (text = "") => {
  $(`.alert-text`).text(text);
};

// 用 try-catch 重构
const initData = async (nowSubmission) => {
  try {
    if (identity.Feedback.feedback.submission_id != nowSubmission["id"]) {
      const { data: feedbackData } = await getSubmissionFeedBackBySubmissionId({
        submission_id: nowSubmission["id"],
      });
      return feedbackData;
    }
    return identity.Feedback;
  } catch {
    const { data } = await addSubmissionFeedBack({
      submission_id: nowSubmission["id"],
      title_information: nowSubmission["Submission Title"],
    });
    return {
      feedback: {
        id: data.submission_feedback_id,
        provisional_total: 0,
        score_get: 0,
        score_total: 0,
        submission_id: nowSubmission["id"],
        title_information: "No Title",
      },
      detailList: [],
    };
  }
};

const fillTable = (feedbackData) => {
  const detailList = feedbackData.detailList;
  if (detailList.length == 0) return;

  const $tbody = $(".feedback table>tbody").empty();
  for (let i = 0; i < detailList.length; i++) {
    const detail = detailList[i];

    const $tr = $(`<tr></tr>`);
    for (let j = 0; j < 3; j++) {
      const $td = $(`<td></td>`);
      if (j == 0) {
        const $strong = $(
          `<strong class=${keys[j]}>${detail[keys[j]]}</strong>`
        );
        $td.append($strong);
      } else if (j == 1) {
        const $span = $(`<span class=${keys[j]}>${detail[keys[j]]}</span>`);
        $td.append($span);
      } else if (j == 2) {
        const $div = $(`<div></div>`);
        const $strong = $(
          `<strong class="${keys[2]}">${detail[keys[2]]}</strong>`
        );
        const $span = $(`<span class="${keys[3]}">${detail[keys[3]]}</span>`);
        $div.append($strong, "/", $span);
        $td.append($div);
      }
      $tr.append($td);
    }
    $tbody.append($tr);
  }
};

const fillTitleAndFile = (feedbackData) => {
  const $feedbackTitle = $(".feedback-title");
  $feedbackTitle.text(feedbackData.feedback.title_information);

  const $feedbackFile = $(".feedback-file");
  // TODO: $feedbackFile.text(feedbackData.feedback);
};
const fillTotal = (feedbackData) => {
  const $total = $(".feedback .provision");
  $total.text(feedbackData.feedback.provisional_total * 100);
};

const setEditEvent = (feedbackData) => {
  const detailList = feedbackData.detailList;

  for (let i = 0; i < detailList.length; i++) {
    // 构建结构
    const $detailRow = $(`.feedback table>tbody>tr:nth-child(${i + 1})`);
    const $td = $(`<td></td>`);
    const $btnContainer = $(`<div class="operation"></div>`);
    const $editBtn = $(`<button>Edit</button>`);
    const $deleteBtn = $(`<button>Delete</button>`);
    const $confirmBtn = $(`<button>Confirm</button>`).hide();
    const $cancelBtn = $(`<button>Cancel</button>`).hide();
    $detailRow.append($td);
    $td.append($btnContainer);
    $btnContainer.append($editBtn, $deleteBtn, $confirmBtn, $cancelBtn);

    // 添加事件
    const $doms = [];
    const olddata = [];
    // 编辑按钮事件
    $editBtn.off("click").on("click", () => {
      // 使对应数据可更改
      keys.forEach((key) => {
        const $cell = $detailRow.find(`.${key}`);
        $doms.push($cell);
        olddata.push($cell.text());
        const $input = $(
          `<input class="edit-${key}" type="text" value="${detailList[i][key]}">`
        );
        const $textarea = $(
          `<textarea class="edit-${key}" type="text">${detailList[i][key]}</textarea>`
        );
        if (key !== "comment") {
          $cell.empty().append($input);
        } else {
          $cell.empty().append($textarea);
        }
      });
      $editBtn.hide();
      $deleteBtn.hide();
      $confirmBtn.show();
      $cancelBtn.show();
      // 确定按钮事件
      $confirmBtn.off("click").on("click", async () => {
        keys.forEach((key, index) => {
          const $input = $detailRow.find(`.edit-${key}`);
          detailList[i][key] = $input.val(); // 1. 更改 detailList
          $doms[index].text(detailList[i][key]); // 2. 以 detailList 更改 dom
        });
        $confirmBtn.hide();
        $cancelBtn.hide();
        $editBtn.show();
        $deleteBtn.show();
        const {
          id: submission_feedback_detail_id,
          criteria,
          comment,
          score_get,
          score_sum,
        } = detailList[i];
        await updateSubmissionFeedBackDetail({
          submission_feedback_detail_id,
          criteria,
          comment,
          score_get,
          score_sum,
        });
        feedbackData.detailList[i] = detailList[i];
        identity.Feedback = feedbackData;
      });
      // 取消按钮事件
      $cancelBtn.off("click").on("click", () => {
        keys.forEach((key, index) => {
          $doms[index].text(detailList[i][key]); // 2.
        });
        $confirmBtn.hide();
        $cancelBtn.hide();
        $editBtn.show();
        $deleteBtn.show();
      });
    });

    $deleteBtn.off("click").on("click", () => {
      $editBtn.hide();
      $deleteBtn.hide();
      $confirmBtn.show();
      $cancelBtn.show();
      $confirmBtn.off("click").on("click", async () => {
        $confirmBtn.remove();
        $cancelBtn.remove();
        $editBtn.remove();
        $confirmBtn.remove();
        $detailRow.remove();
        const { submission_feedback_detail_id } = detailList[i];
        detailList.splice(i, 1);
        await deleteSubmissionFeedBackDetail({ submission_feedback_detail_id });
      });
      $cancelBtn.off("click").on("click", () => {
        $confirmBtn.hide();
        $cancelBtn.hide();
        $editBtn.show();
        $deleteBtn.show();
      });
    });
  }
};

const setAddEvent = (feedbackData) => {
  const $addBtn = $(`<button class="add-btn">Add</button>`);
  const $addContainer = $(`<div class="add-container"></div>`).append($addBtn);
  const $td = $(`<td colspan="4"></td>`).append($addContainer);
  const $tr = $(`<tr></tr>`).append($td);
  const $tbody = $(".feedback tbody").append($tr);

  $addBtn.off("click").on("click", () => {
    $tbody;
  });
};

const initFeedback = (config = { enableEdit: false }) => {
  const nowSubmission = identity.nowSubmission;
  // DEBUG:
  // nowSubmission["id"] = 27;
  initData(nowSubmission).then((feedbackData) => {
    fillTitleAndFile(feedbackData);
    fillTable(feedbackData);
    fillTotal(feedbackData);
    if (config.enableEdit) {
      setEditEvent(feedbackData);
      // setAddEvent(feedbackData);
    }
  });
};

export { initFeedback, alert_text };
