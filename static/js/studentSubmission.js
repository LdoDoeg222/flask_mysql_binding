import { uploadFile } from "./apis/fileApis.js";
import { submitWork } from "./apis/studentApis.js";
import identity from "./utils/identity.js";
import { push_react } from "./utils/reactivity.js";

const alert_text = (text = "") => {
  $(".alert-text").text(text);
};

push_react(
  () => {
    const nowSubmission = identity.nowSubmission;

    const $form = $("form");

    $form.off("submit").on("submit", (ev) => ev.preventDefault());

    const $title = $(".title-text");
    $title.text(nowSubmission["Assignment Title"]);

    const $description = $(".description-text");
    $description.text(nowSubmission.Description);

    const $fileAttacher = $(".file-attacher");
    $fileAttacher.off("click").on("click", () => {
      $("input[type=file]").trigger("click");
    });

    const $fileInput = $("input[type=file]");

    $fileInput.off("change").on("change", (ev) => {
      const file = ev.target.files[0];
      $fileAttacher.text(file.name + " attached");
      alert_text();
    });

    const $uploadBtn = $(".upload-btn");
    let file_path;
    $uploadBtn.off("click").on("click", async () => {
      if (!$fileInput[0].files[0]) {
        alert_text("Please attach a file");
        return;
      }
      const dto = { file: $fileInput[0].files[0] };
      const res = await uploadFile(dto);
      if (res.isSuccess) {
        file_path = res.data.file_path;
        alert_text("Upload Success");
      }
    });

    const $submitBtn = $(".submit-btn");
    $submitBtn.off("click").on("click", async () => {
      try {
        const { "Lecture ID": lecture_id, "Assignment Title": title } =
          nowSubmission;
        const dto = {
          title,
          lecture_id,
          student_id: identity.user_id,
          file_path,
        };
        const res = await submitWork(dto);
        if (res.isSuccess) {
          alert_text("Submit Success");
        }
      } catch (err) {
        alert_text(err.message);
      }
    });
  },
  "pageloaded",
  { immediate: true }
);
