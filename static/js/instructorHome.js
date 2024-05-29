import identity from "./utils/identity.js";
import { push_react } from "./utils/reactivity.js";
import {
  getCourseAndLecture,
  getStudentByInstructorId,
  getSubmitWorkByInstructorId,
  createLecture,
} from "./apis/instructorApis.js";

const fetchData = async () => {
  const dto = { instructor_id: identity.user_id };
  if (identity.Courses.length == 0)
    ({ data: identity.Courses } = await getCourseAndLecture(dto));
  if (identity.StudentList.length == 0)
    ({ data: identity.StudentList } = await getStudentByInstructorId(dto));
  if (identity.Submissions.length == 0)
    ({ data: identity.Submissions } = await getSubmitWorkByInstructorId(dto));
};

const fillCourse = () => {
  const data = identity.Courses;
  const courseUl = $("#courses>div>ul");

  for (let i = 0; i < data.length; i++) {
    courseUl.append(`
    <li><h4>${data[i]["Course Name"]}</h4></li>
    `);
  }
};

const fillStudentList = () => {
  const data = identity.StudentList;
  const $student = $("#student-list");
  const $div = $(`<div></div>`);
  $student.append($div);

  for (let i = 0; i < data.length; i++) {
    $div.append(`<h3>${data[i]["Lecture Name"]}</h3>`);
    const studentList = data[i]["Student List"];
    const ul = $div.append(`<ul></ul>`);
    for (let j = 0; j < studentList.length; j++) {
      ul.append(`<li>${studentList[j]["Student Name"]}</li>`);
    }
  }
};

const fillSubmission = () => {
  const data = identity.Submissions;
  const $submission = $("#student-submission");
  const $div = $(`<div></div>`);
  for (let i = 0; i < data.length; i++) {
    $div.append(`<h3>${data[i]["Lecture Name"]}</h3>`);
    const $ul = $div.append(`<ul></ul>`);
    const submissionList = data[i]["Submission List"];
    for (let j = 0; j < submissionList.length; j++) {
      const $li = $(`<li></li>`);
      $li.append(`<b>${submissionList[j]["Submission Title"]}</b>`);
      $li.append(
        `<p><u>Submit Time:</u> ${submissionList[j]["Submit Time"]}</p>`
      );
      $ul.append($li);
    }
  }
  $submission.append($div);
};

const addLecture = () => {
  const $lecture = $("#lecture");
  const $form = $lecture.find("form");

  $form.empty();

  const keys = ["Lecture Name", "Course ID", "Time"];

  for (let i = 0; i < keys.length; i++) {
    const $div = $(`<div></div>`);
    const $input = $(
      `<label>${keys[i]}: </label><input title="${keys[i]}" type="${
        keys[i] === "Time" ? "datetime-local" : keys[i]
      }">`
    );
    $div.append($input);
    $form.append($div);
  }

  const $msgDiv = $(`<div></div>`);
  const $msgSpan = $(`<span></span>`);
  $msgDiv.append($msgSpan);
  $form.append($msgDiv);

  const $addLectureBtn = $("<button>Add Lecture</button>");
  $addLectureBtn.off("click").on("click", async () => {
    const dto = {};
    for (let i = 0; i < keys.length; i++) {
      const $input = $form.find(`input[title="${keys[i]}"]`);
      dto[keys[i]] = $input.val();
    }
    dto.instructor_id = identity.user_id;
    const { isSuccess, msg } = await createLecture(dto);
    if (isSuccess) {
      $msgSpan.text(msg);
      $msgDiv.css("color", "green");
    } else {
      $msgSpan.text(msg);
      $msgDiv.css("color", "red");
    }
  });
  const $div = $(`<div></div>`);
  $form.append($div);
  $div.append($addLectureBtn);

  // createLecture();
};

const addFile = () => {
  const $file = $("#add-file");
  const $attachFileBtn = $file.find("button");
  const $fileInput = $file.find(`input[type="file"]`);
  const $fileName = $file.find(`.file-name`);
  $attachFileBtn.off("click").on("click", () => {
    $fileInput.trigger("click");
  });
  $fileInput.off("change").on("change", (ev) => {
    const file = ev.target.files[0];
    $fileName.text("file name: " + file.name);
  });
};

push_react(
  () => {
    addLecture();
    addFile();
    fetchData().then(() => {
      const $form = $("form");
      $form.off("submit").on("submit", (ev) => ev.preventDefault());
      fillCourse();
      fillStudentList();
      fillSubmission();
    });
  },
  "pageloaded",
  { immediate: true }
);
