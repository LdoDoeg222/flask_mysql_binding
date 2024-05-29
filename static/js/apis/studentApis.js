import Res from "../types/res.js";
import myFetch from "../utils/myFetch.js";
import { submitWorkDto } from "../dtos/studentDtos.js";

/**
 * !Done
 */
const enterEnrollment = async (dto) => {
  try {
    const res = await myFetch("/enrollment/enterEnrollment", dto, {
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
 * @param {typeof submitWorkDto} dto
 */
const submitWork = async (dto) => {
  try {
    const res = await myFetch("/submission/submitWork", dto, {
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
 */
const getAssignmentByStudentId = async (dto) => {
  try {
    const res = await myFetch("/assignment/getAssignmentByStudentId", dto, {
      method: "POST",
    });
    const lectureList = res.data;

    lectureList.map((lecture, lectIndex) => {
      const { lecture_name, assignmentList } = lecture;

      assignmentList.map((assignment, assignIndex) => {
        const { id, title, deadline, description, lecture_id } = assignment;
        assignmentList[assignIndex] = {
          "Assignment ID": id,
          "Lecture ID": lecture_id,
          "Assignment Title": title,
          Deadline: deadline,
          Description: description,
        };
      });

      lectureList[lectIndex] = {
        "Lecture Name": lecture_name,
        Assignments: assignmentList,
      };
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !DONE
 */
const getEnrolledLectureByStudentId = async (dto) => {
  try {
    const res = await myFetch("/course/getCourseByStudentId", dto, {
      method: "POST",
    });
    res.data = res.data.lectureListData.map((data) => {
      const { instructorName, lectureData } = data;
      const { academic_year, course_name, lecture_name, time, id } =
        lectureData;
      return {
        "Lecture ID": id,
        "Lecture Name": lecture_name,
        "Course Name": course_name,
        "Instructor Name": instructorName,
        "Academic Year": academic_year,
        Time: new Date(time),
      };
    });

    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !Done
 */
const getAllLectureByCourseId = async (dto) => {
  try {
    const res = await myFetch("/lecture/getAllLectureByCourseId", dto, {
      method: "POST",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};
/**
 * !Done
 */
const findAllLecture = async () => {
  try {
    const res = await myFetch("/lecture/findAllLecture");

    res.data = res.data.map((item) => {
      const { course_name, instructorName, lecture } = item;
      const { academic_year, lecture_name, time, id } = lecture;
      return {
        "Lecture ID": id,
        "Lecture Name": lecture_name,
        "Course Name": course_name,
        "Instructor Name": instructorName,
        "Academic Year": academic_year,
        Time: new Date(time),
      };
    });
    res.data.sort((a, b) => a["Lecture ID"] - b["Lecture ID"]);
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !Done
 * @param {typeof getSubmitWorkByStudentIdDto} dto
 */
const getSubmitWorkByStudentId = async (dto) => {
  try {
    const res = await myFetch("/submission/getSubmitWorkByStudentId", dto, {
      method: "POST",
    });

    const submissionList = res.data.submissionListData;
    submissionList.map((submission, index) => {
      const { id, title, description, submit_time } = submission;
      submissionList[index] = {
        id,
        Title: title,
        Description: description,
        Time: new Date(submit_time),
      };
    });
    res.data = submissionList;

    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

export {
  getAssignmentByStudentId,
  getEnrolledLectureByStudentId,
  enterEnrollment,
  findAllLecture,
  getAllLectureByCourseId,
  getSubmitWorkByStudentId,
  submitWork,
};
