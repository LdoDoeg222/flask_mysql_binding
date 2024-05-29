import identity from "./utils/identity.js";
import { push_react } from "./utils/reactivity.js";
import {
  MenuAndTable,
  createOperationFunc,
  initialize,
} from "./utils/menu-and-table.js";

import {
  enterEnrollment,
  findAllLecture,
  getEnrolledLectureByStudentId,
} from "./apis/studentApis.js";

//#region
// DONE:
const enrollCourseOperationFunc = createOperationFunc(($td) => {
  const $enrollBtn = $(`<button>Enroll</button>`);
  // 从 $td 的同一行内获取 academic_year 信息
  const academic_year = $td.parent().children(":nth-child(5)").text();
  $enrollBtn.off("click").on("click", async () => {
    const lecture_id = $td.parent().children(":nth-child(1)").text();
    const res = await enterEnrollment({
      lecture_id,
      student_id: identity.user_id,
      academic_year,
    });
    if (res.isSuccess) {
      const dialog = document.querySelector("dialog");
      if (dialog) {
        const $dialog = $(dialog);
        const $form = $dialog.children("form");
        $form.off("submit").on("submit", (ev) => ev.preventDefault());

        dialog.showModal();
        // 提示成功信息，提供确认按钮
        const $textContainer = $(`<div></div>`);
        const $text = $(`<p>Lecture enrollment request sent successfully!</p>`);
        $dialog.append($textContainer.append($text));

        const $buttonContainer = $(`<div></div>`);
        const $button = $(`<button>I know that</button>`);
        $button.off("click").on("click", () => {
          dialog.close();
        });
        $dialog.append($buttonContainer.append($button));
      }
    }
  });

  $td.append($enrollBtn);
});

const allCourseMAT = new MenuAndTable("All Lecture", findAllLecture, [
  enrollCourseOperationFunc,
]);
//#endregion

// #region
const getEnrolledLecture = () => {
  return getEnrolledLectureByStudentId({
    student_id: identity.user_id,
  });
};

const enrolledCourseMAT = new MenuAndTable(
  "Enrolled Lecture",
  getEnrolledLecture
);
//#endregion

push_react(
  () => {
    initialize([allCourseMAT, enrolledCourseMAT], {
      menu_class: "course-type",
      init_menu_index: 0,
    });
  },
  "pageloaded",
  { immediate: true }
);
