import identity from "./utils/identity.js";
import {
  MenuAndTable,
  initialize,
  createOperationFunc,
} from "./utils/menu-and-table.js";

import {
  getEnrolledLectureByStudentId,
  getAssignmentByStudentId,
  getSubmitWorkByStudentId,
} from "./apis/studentApis.js";
import { push_react } from "./utils/reactivity.js";

//#region EnrolledCourse
const getEnrolledLecture = () => {
  const dto = { student_id: identity.user_id };
  return getEnrolledLectureByStudentId(dto);
};

const enrolledCourseMAT = new MenuAndTable(
  "Enrolled Lecture",
  getEnrolledLecture
);
//#endregion

//#region assignment
const getAssignment = async () => {
  const dto = { student_id: identity.user_id };
  const res = await getAssignmentByStudentId(dto);
  // res.data 是一个包含 Lecture Name 和 Assignments 对象数组的对象数组
  // 我需要重构 res.data 为一个对象数组
  // 数组的每一个对象包含 lecturename, 和 Assignments 的对象
  const resData = [];
  res.data.forEach((item) => {
    const { "Lecture Name": name, Assignments } = item;
    Assignments.forEach((assignment) => {
      const {
        "Assignment ID": id,
        "Assignment Title": title,
        "Lecture ID": lecture_id,
        Deadline,
        Description,
      } = assignment;
      resData.push({
        "Assignment ID": id,
        "Assignment Title": title,
        "Lecture ID": lecture_id,
        "Lecture Name": name,
        Description,
        Deadline,
      });
    });
  });
  res.data = resData;
  return res;
};

const submitAssignment = createOperationFunc(($td, other) => {
  const { tableController, dataIndex } = other;
  const $btn = $(`<button>Submit</button>`);
  // 获取当前行的 Assignment ID

  $btn.off("click").on("click", () => {
    identity.nowSubmission =
      tableController.menu_and_table.data_list[dataIndex];

    location.href = "#/student/submission";
  });
  $td.html($btn);
});

const assignmentMAT = new MenuAndTable("Assignments", getAssignment, [
  submitAssignment,
]);
//#endregion
//#region

const getSubmission = async () =>
  getSubmitWorkByStudentId({ student_id: identity.user_id });

const checkSubmission = createOperationFunc(($td, other) => {
  const { tableController, dataIndex } = other;
  const $checkBtn = $(`<button>Check</button>`);
  $checkBtn.off("click").on("click", () => {
    identity.nowSubmission =
      tableController.menu_and_table.data_list[dataIndex];
    location.href = "#/student/feedback";
  });
  $td.html($checkBtn);
});

const submissionMAT = new MenuAndTable("Submissions", getSubmission, [
  checkSubmission,
]);
//#endregion

push_react(
  () => {
    initialize([enrolledCourseMAT, assignmentMAT, submissionMAT], {
      menu_class: "content-access",
      init_menu_index: 0,
    });
  },
  "pageloaded",
  { immediate: true }
);
