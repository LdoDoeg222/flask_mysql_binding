import myFetch from "../utils/myFetch.js";
import Res from "../types/res.js";
import {
  createAssignmentDto,
  updateAssignmentDto,
  updateSubmissionDto,
} from "../dtos/instructorDtos.js";

/**
 * !Done
 */
const getCourseAndLecture = async (dto) => {
  try {
    const res = await myFetch("/course/getCourseAndLecture", dto, {
      method: "POST",
    });
    const lectureListData = [...res.data.lectureListData];
    const resData = [];
    // if course_id same, put lecture into same array
    lectureListData.map((item) => {
      const { course_id, course_name, id, lecture_name, time } = item;
      const existingCourse = resData.find(
        (data) => data.course_id === course_id
      );
      if (existingCourse) {
        existingCourse.lectureListData.push({
          id,
          "Lecture Name": lecture_name,
          "Lecture Time": new Date(time),
        });
      } else {
        resData.push({
          course_id,
          "Course Name": course_name,
          lectureListData: [
            {
              id,
              "Lecture Name": lecture_name,
              "Lecture Time": new Date(time),
            },
          ],
        });
      }

      resData.sort((a, b) => a.course_id - b.course_id);
    });
    res.data = resData;
    // console.warn(...lectureListData);

    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !Done
 */
const getStudentByInstructorId = async (dto) => {
  try {
    const res = await myFetch("/student/getStudentByInstructorId", dto, {
      method: "POST",
    });
    const lectureList = [...res.data.lectureListData];
    lectureList.map((item, index) => {
      const { lecture_name } = item;
      const studentList = [...item.studentListData];
      studentList.map((item, index) => {
        const { username, major } = item;
        studentList[index] = {
          "Student Name": username,
          Major: major,
        };
      });
      lectureList[index] = {
        "Lecture Name": lecture_name,
        "Student List": studentList,
      };
    });

    res.data = lectureList;

    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !Done
 */
const getSubmitWorkByInstructorId = async (dto) => {
  try {
    const res = await myFetch("/submission/getsubmitWorkByInstructorId", dto, {
      method: "POST",
    });

    const resultList = [...res.data.resultList];

    resultList.map((item, index) => {
      const { lecture_name, submissionListData } = item;
      const submissionList = [...submissionListData];
      submissionList.map((item, index) => {
        const { id, student_id, title, description, submit_time } = item;
        submissionList[index] = {
          id,
          student_id,
          "Submission Title": title,
          "Submit Time": new Date(submit_time),
          Grades: description,
        };
      });

      resultList[index] = {
        "Lecture Name": lecture_name,
        "Submission List": submissionList,
      };
    });

    res.data = resultList;
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 * !Done
 * @param {{"Lecture Name": string, "Course ID": number, Time: Date, instructor_id: number }} dto
 * @returns {Promise<Res>}
 */
const createLecture = async (dto) => {
  const {
    "Lecture Name": lecture_name,
    "Course ID": course_id,
    Time: time,
    instructor_id,
  } = dto;
  dto = {
    lecture_name,
    course_id,
    time,
    instructor_id,
  };
  try {
    const res = await myFetch("/lecture/createLecture", dto, {
      method: "PUT",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 *
 * @param {{instructor_id: number}} dto
 * @returns
 */
const getAllAssignmentByInstructorId = async (dto) => {
  try {
    const res = await myFetch(
      "/assignment/getAllAssignmentByInstructorId",
      dto,
      { method: "POST" }
    );
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 *
 * @param {{lecture_id: number, title: string, deadline: time, description: string}} dto
 *
 */
const createAssignment = async (dto) => {
  const {
    "Assignment Title": title,
    DeadLine: deadline,
    Description: description,
    lecture_id,
  } = dto;
  dto = {
    lecture_id,
    title,
    deadline,
    description,
  };
  try {
    const res = await myFetch("/assignment/createAssignment", dto, {
      method: "PUT",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

/**
 *
 * @param {{id, lecture_id, "Assignment Title", "Lecture Name", Description, DeadLine}} dto
 */
const updateAssignment = async (dto) => {
  const {
    id,
    lecture_id,
    "Assignment Title": title,
    DeadLine: deadline,
    Description: description,
  } = dto;
  dto = { id, lecture_id, title, deadline, description };
  try {
    const res = await myFetch("/assignment/updateAssignment", dto, {
      method: "POST",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};
// TODO:
const updateSubmission = async () => {
  try {
    const res = await myFetch(
      "/submission/updateSubmission",
      updateSubmissionDto,
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

export {
  getCourseAndLecture,
  getStudentByInstructorId,
  getSubmitWorkByInstructorId,
  createLecture,
  getAllAssignmentByInstructorId,
  createAssignment,
  updateAssignment,
  // updateSubmission,
};
