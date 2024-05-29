import {
  MenuAndTable,
  initialize,
  createOperationFunc,
} from "./utils/menu-and-table.js";
import {
  addUser,
  addCourse,
  addLecture,
  getAllUser,
  getAllCourse,
  getAllLecture,
  editUser,
  deleteUser,
  editCourse,
  deleteCourse,
  editLecture,
  deleteLecture,
} from "./apis/adminApis.js";

const createDeleteOperationFunc = (deleteFunc) => {
  return createOperationFunc(($td, other) => {
    const { tableController, dataIndex } = other;
    const data = tableController.menu_and_table.data_list[dataIndex];

    let $deleteButton = $(`<button class="delete-btn">Delete</button>`);

    $deleteButton.on("click", () => {
      const dialog = document.querySelector("dialog");

      const form = dialog.querySelector("form");
      const $form = $(form);
      $form.empty();
      $form.off("submit");
      $form.on("submit", (ev) => ev.preventDefault());

      const $mainMsgDiv = $(`<div></div>`);
      const $mainMsg = $(`<span></span>`);
      $mainMsg.text("Are you sure to delete?");
      $mainMsgDiv.append($mainMsg);
      $form.append($mainMsgDiv);

      const $msgDiv = $(`<div></div>`);
      const $msg = $(`<span></span>`);
      $msgDiv.append($msg);
      $form.append($msgDiv);

      const $buttonDiv = $(`<div></div>`);
      const $confirmButton = $(`<button class="confirm-btn">Confirm</button>`);
      const $cancelBtn = $(`<button class="cancel-btn">Cancel</button>`);
      $form.append($buttonDiv);
      $buttonDiv.append($confirmButton).append($cancelBtn);

      $confirmButton.on("click", async () => {
        const { isSuccess, msg } = await deleteFunc(data); // ! deleteFunc
        if (isSuccess) {
          tableController.deleteData(dataIndex);
          dialog.close();
        } else {
          $msg.text(msg);
        }
      });

      $cancelBtn.on("click", () => dialog.close());

      dialog.showModal();
    });

    $td.html($deleteButton);
  });
};

const createEditOperationFunc = (editFunc) => {
  return createOperationFunc(($td, otherInfo) => {
    const { tableController, dataIndex } = otherInfo;
    const data = tableController.menu_and_table.data_list[dataIndex];
    const keys = Object.keys(data);
    const $editButton = $(`<button class="edit-btn">Edit</button>`);

    $editButton.on("click", () => {
      const dialog = document.querySelector("dialog");
      const form = dialog.querySelector("form"); /* ?? new HTMLFormElement() */

      const $form = $(form);
      $form.empty();
      $form.off("submit").on("submit", (ev) => ev.preventDefault());

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const $form_item = $(
          `<div>
          <label>${key}</label>
          <input type="${
            key === "Time" ? "datetime-local" : key
          }" name="${key}" value="${data[key]}" ${
            key === "ID" ? "disabled" : ""
          }>
          </div>`
        );
        $form.append($form_item);
      }

      const $msgDiv = $(`<div></div>`);
      const $msgSpan = $(`<span style="color:red"></span>`);
      $msgDiv.append($msgSpan);
      $form.append($msgDiv);

      const $buttonDiv = $(`<div></div>`);

      const $submitBtn = $(`<button type="submit">Submit</button>`);
      const $cancelBtn = $(`<button>Cancel</button>`);

      $submitBtn.off("click").on("click", async () => {
        const dto = {};
        for (let i = 0; i < tableController.table_item_keys.length; i++) {
          const key = tableController.table_item_keys[i];
          const $input = $form.find(`input[name="${key}"]`);

          dto[key] = $input.val();
        }

        // ? 这里不统一
        const { isSuccess, msg } = await editFunc(dto);
        // endregion
        if (isSuccess) {
          tableController.updateData(dataIndex, dto);
          $msgSpan.text();
          dialog.close();
        } else {
          $msgSpan.text(msg);
        }
      });
      $cancelBtn.off("click").on("click", () => dialog.close());

      $form.append($buttonDiv.append($submitBtn, $cancelBtn));
      dialog.showModal();
    });

    $td.html($editButton);
  });
};

const editUserOperator = createEditOperationFunc(editUser);
const deleteUserOperator = createDeleteOperationFunc(deleteUser);

const editCourseOperator = createEditOperationFunc(editCourse);
const deleteCourseOperator = createDeleteOperationFunc(deleteCourse);

const editLectureOperator = createEditOperationFunc(editLecture);
const deleteLectureOperator = createDeleteOperationFunc(deleteLecture);

const userMenuAndTable = new MenuAndTable(
  "User Manage",
  getAllUser,
  [editUserOperator, deleteUserOperator],
  addUser
);
const courseMenuAndTable = new MenuAndTable(
  "Course Manage",
  getAllCourse,
  [editCourseOperator, deleteCourseOperator],
  addCourse
);
const lectureMenuAndTable = new MenuAndTable(
  "Lecture Manage",
  getAllLecture,
  [editLectureOperator, deleteLectureOperator],
  addLecture
);

const menu_and_table_list = [
  userMenuAndTable,
  courseMenuAndTable,
  lectureMenuAndTable,
];

initialize(menu_and_table_list);

export { createEditOperationFunc, createDeleteOperationFunc };
