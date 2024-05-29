import identity from "./utils/identity.js";
import { push_react } from "./utils/reactivity.js";
import {
  getAssignmentByStudentId,
  getEnrolledLectureByStudentId,
  getSubmitWorkByStudentId,
} from "./apis/studentApis.js";

/**
 * !Done
 */
const fetchData = async () => {
  const dto = { student_id: identity.user_id };
  if (identity.Courses.length === 0 || identity.Lectures.length === 0) {
    const { data } = await getEnrolledLectureByStudentId(dto);
    identity.Courses = data;
    identity.Lectures = data;
  }
  if (identity.Assignments.length === 0)
    ({ data: identity.Assignments } = await getAssignmentByStudentId(dto));
  if (identity.Submissions.length === 0)
    ({ data: identity.Submissions } = await getSubmitWorkByStudentId(dto));
};

/**
 * !Done
 */
const fillCourse = () => {
  const data = identity.Lectures;
  const lecturesContainer = $("#courses")
    .append(`<div></div>`)
    .find(`div`)
    .last();

  for (let i = 0; i < data.length; i++) {
    const lecture = data[i];
    const li = lecturesContainer.append(`<ul><li></li></ul>`).find(`li`).last();
    li.append(`<h4>${lecture["Lecture Name"]}</h4>`);
  }
};

/**
 * !Done
 */
const fillAssignMent = () => {
  const data = identity.Assignments;
  if (data.length === 0) {
    return;
  }
  const assignment = $("#assignment");
  for (let i = 0; i < data.length; i++) {
    const div = assignment.append(`<div></div>`).find(`>div`).last();
    const assignmentList = data[i]["Assignments"];
    div.append(`<h3>Lecture Name: ${data[i]["Lecture Name"]}</h3>`);
    const listContainer = div
      .append(`<div class="list-container"></div>`)
      .find(`>div`)
      .last();

    if (assignmentList.length === 0)
      listContainer.html(`<ul><li>There is no assignment.</li></ul>`);
    const ol = listContainer.append(`<ol></ol>`).find(`ol`).last();
    for (let j = 0; j < assignmentList.length; j++) {
      const keys = Object.keys(data[0]["Assignments"][0]);
      ol.append(`<li></li>`).find(`li`).last();
      const secondUl = ol.append(`<ul></ul>`).find(`ul`).last();
      keys.forEach((key) => {
        secondUl.append(`<li>${key}: ${assignmentList[j][key]}</li>`);
      });
    }
  }
};

/**
 * !Done
 */
const fillTimeTable = () => {
  const data = identity["Lectures"];

  const nowTime = new Date(Date.now());
  let upcoming_lecture;

  for (let i = 0; i < data.length; i++) {
    const lecture = data[i];

    if (
      nowTime < lecture["Time"] &&
      (!upcoming_lecture || lecture["Time"] < upcoming_lecture["Time"])
    ) {
      upcoming_lecture = lecture;
    }
  }

  const $timeTableDiv = $("#time-table>div").last();
  if (!upcoming_lecture) {
    upcoming_lecture = {
      "Lecture Name": "No upcoming lecture",
      Time: "No upcoming lecture",
      "Instructor Name": "No upcoming lecture",
    };
  }
  $timeTableDiv.append(`
      <div><div>Lecture Name: </div> <div>${upcoming_lecture["Lecture Name"]}</div></div>
      <div><div>Start Time: </div> <div>${upcoming_lecture["Time"]}</div></div>
      <div><div>Instructor: </div> <div>${upcoming_lecture["Instructor Name"]}</div></div>
  `);
};

/**
 * ?Doing
 */
const fillGrades = () => {
  const data = identity.Submissions;
  const gradeDiv = $("#grades")
    .append(`<div><ol></ol></div>`)
    .find(`ol`)
    .last();
  for (let i = 0; i < data.length; i++) {
    gradeDiv.append(`<li>${data[i]["Title"]}</li>`);
    const ul = gradeDiv.append(`<ul></ul>`).find(`ul`).last();
    ul.append(`<li>Time: ${data[i]["Time"]}</li>`);
    ul.append(`<li>Grade: ${data[i]["Description"]}</li>`);
  }
};

push_react(
  () => {
    fetchData().then(() => {
      fillAssignMent();
      fillCourse();
      fillTimeTable();
      fillGrades();
    });
  },
  "pageloaded",
  { immediate: true }
);
