import { createEditOperationFunc } from "./adminHome.js";
import {
  createAssignment,
  createLecture,
  getAllAssignmentByInstructorId,
  getCourseAndLecture,
  getSubmitWorkByInstructorId,
  updateAssignment,
} from "./apis/instructorApis.js";
import identity from "./utils/identity.js";
import {
  initialize,
  MenuAndTable,
  createOperationFunc,
} from "./utils/menu-and-table.js";
import { push_react } from "./utils/reactivity.js";
//#region Lecture
const getAllLecture = async () => {
  const res = await getCourseAndLecture({
    instructor_id: identity.user_id,
  });
  const resData = [];
  res.data.forEach((courseItem) => {
    const {
      course_id,
      "Course Name": course_name,
      lectureListData: lectureList,
    } = courseItem;
    lectureList.forEach((lecture) => {
      const {
        id,
        "Lecture Name": lecture_name,
        "Lecture Time": time,
      } = lecture;
      resData.push({
        "Lecture ID": id,
        "Lecture Name": lecture_name,
        "Course ID": course_id,
        "Course Name": course_name,
        Time: new Date(time),
      });
    });
  });
  res.data = resData;
  return res;
};

const addLecture = async (dto) => {
  const res = await createLecture({
    "Lecture Name": dto["Lecture Name"],
    "Course ID": dto["Course ID"],
    Time: dto.Time,
    instructor_id: identity.user_id,
  });
  return res;
};

const lectureMAT = new MenuAndTable(
  "All Lecture",
  getAllLecture,
  undefined,
  addLecture
);
//#endregion

//#region Assignment

const getAllAssignments = async () => {
  const res = await getAllAssignmentByInstructorId({
    instructor_id: identity.user_id,
  });
  res.data = res.data.resultList;

  const resData = [];
  res.data.forEach((item) => {
    const { assignmentList, lectureName: name } = item;
    assignmentList.forEach((assignment) => {
      const { id, deadline, description, lecture_id, title } = assignment;
      const item = {
        id,
        lecture_id,
        "Assignment Title": title,
        "Lecture Name": name,
        Description: description,
        DeadLine: new Date(deadline),
      };
      resData.push(item);
    });
  });
  res.data = resData;
  resData.sort((a, b) => a.id - b.id);
  return res;
};

const editAssignment = createEditOperationFunc(updateAssignment);

const assignmentMAT = new MenuAndTable(
  "All Assignments",
  getAllAssignments,
  [editAssignment],
  createAssignment
);
//#endregion

//#region submission
const getAllSubmitWork = async () => {
  const res = await getSubmitWorkByInstructorId({
    instructor_id: identity.user_id,
  });
  const resData = [];
  res.data.forEach((item) => {
    const { "Lecture Name": name, "Submission List": submissionList } = item;

    submissionList.forEach((submission) => {
      const {
        id,
        "Submission Title": title,
        "Submit Time": time,
        Grades,
      } = submission;
      const dto = {
        id: Number.parseInt(id),
        "Lecture Name": name,
        "Submission Title": title,
        "Submit Time": new Date(time),
        Grades,
      };
      resData.push(dto);
      resData.sort((a, b) => a.id - b.id);
    });
  });
  res.data = resData;

  return res;
};

const feedbackSubmission = createOperationFunc(($td, other) => {
  const { tableController, dataIndex } = other;
  const $feedbackBtn = $(`<button>Feedback</button>`);
  $feedbackBtn.off("click").on("click", async () => {
    identity.nowSubmission =
      tableController.menu_and_table.data_list[dataIndex];

    location.href = "#/instructor/feedback";
  });

  $td.append($feedbackBtn);
});

const studentSubmissionMAT = new MenuAndTable(
  "All Submissions",
  getAllSubmitWork,
  [feedbackSubmission]
);
//#endregion
push_react(
  () => {
    initialize([lectureMAT, assignmentMAT, studentSubmissionMAT], {
      menu_class: "instructor",
      init_menu_index: 0,
    });
  },
  "pageloaded",
  { immediate: true }
);
