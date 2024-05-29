import myFetch from "../utils/myFetch.js";
import { decideEnterEnrollmentDto } from "../dtos/adminDtos.js";
import Res from "../types/res.js";

const userTypeStringCheck = (type) => {
  if (type !== "Student" && type !== "Instructor") {
    throw new EvalError(
      'User type can only fill with "Student" or "Instructor"'
    );
  }
};

const addCourse = async (dto) => {
  const { ID: id, "Course Name": course_name, Description: description } = dto;
  dto = {
    id,
    course_name,
    description,
  };
  try {
    const res = await myFetch("/course/addCourse", dto, {
      method: "PUT",
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

const addLecture = async (dto) => {
  const {
    "Lecture Name": lecture_name,
    "Course ID": course_id,
    "Instructor ID": instructor_id,
    Time: time,
  } = dto;
  dto = {
    lecture_name,
    instructor_id,
    course_id,
    time,
  };
  const res = await myFetch("/lecture/addLecture", dto, {
    method: "POST",
  });
  return res;
};

const addUser = async (dto) => {
  try {
    const {
      "User Name": username,
      Email: email,
      Type: type,
      "Major/Department": major_or_department,
    } = dto;
    userTypeStringCheck(type);
    dto = {
      username,
      email,
      major: type === "Student" ? major_or_department : undefined,
      department: type === "Instructor" ? major_or_department : undefined,
      type: type === "Student" ? 0 : 1,
      password: "123456",
    };

    const res = await myFetch("/user/addUser", dto, {
      method: "PUT",
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

const deleteCourse = async (dto) => {
  const { ID: id } = dto;
  dto = { id };
  try {
    const res = await myFetch("/course/deleteCourse", dto, {
      method: "DELETE",
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

const editCourse = async (dto) => {
  const { ID: id, "Course Name": course_name, Description: description } = dto;
  dto = {
    course_name,
    description,
    id,
  };
  try {
    const res = await myFetch("/course/editCourse", dto, {
      method: "POST",
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

const deleteLecture = async (dto) => {
  const { ID: id } = dto;
  dto = { id };
  try {
    const res = await myFetch("/lecture/deleteLecture", dto, {
      method: "DELETE",
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

const editLecture = async (dto) => {
  const {
    ID: id,
    "Lecture Name": lecture_name,
    Time: time,
    Status: status,
    "Is Delete": is_delete,
  } = dto;

  dto = {
    id,
    lecture_name,
    time,
    status,
    is_delete: Number.parseInt(is_delete),
  };
  const res = await myFetch("/lecture/editLecture", dto, {
    method: "POST",
  });
  return res;
};

const deleteUser = async (dto) => {
  const { ID: id, Type: type } = dto;
  dto = {
    id,
    type: type == "Student" ? 0 : 1,
  };
  try {
    const res = await myFetch("/user/deleteUser", dto, {
      method: "DELETE",
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

const editUser = async (dto) => {
  try {
    const {
      ID,
      "User Name": username,
      Email: email,
      "Major/Department": major_or_department,
      Type: type,
    } = dto;

    userTypeStringCheck(type);

    dto = {
      id: ID,
      username: username,
      email: email,
      type: type === "Student" ? 0 : 1,
    };
    if (type === "Student") {
      dto.major = major_or_department;
    } else if (type === "Instructor") {
      dto.department = major_or_department;
    }

    const res = await myFetch("/user/editUser", dto, {
      method: "POST",
    });
    return res;
  } catch (err) {
    console.error(err);
    return new Res(err.message);
  }
};

const getAllCourse = async () => {
  const res = await myFetch("/course/getAllCourse");
  res.data = res.data.courseList;
  if (Array.isArray(res.data)) {
    res.data.map((item, index) => {
      const { id, course_name, description } = item;
      res.data[index] = {
        ID: id,
        "Course Name": course_name,
        Description: description,
      };
    });
  }

  return res;
};

const getAllLecture = async () => {
  const res = await myFetch("/lecture/getAllLecture");

  if (Array.isArray(res.data)) {
    res.data = res.data.map((item) => {
      const { instructorName, lecture } = item;
      const {
        id,
        course_id,
        course_name,
        lecture_name,
        time,
        is_delete,
        status,
      } = lecture;
      return {
        ID: id,
        "Lecture Name": lecture_name,
        "Course ID": course_id,
        "Course Name": course_name,
        "Instructor Name": instructorName,
        Time: time,
        Status: status,
        "Is Delete": is_delete,
      };
    });
  }

  return res;
};

const getAllUser = async () => {
  const res = await myFetch("/user/getAllUser");

  let studentList = res.data[0].studentList;
  let instructorList = res.data[1].instructorList;
  studentList.map((item, index) => {
    studentList[index].type = "Student";
  });
  instructorList.map((item, index) => {
    instructorList[index].type = "Instructor";
  });
  res.data = [...studentList, ...instructorList];
  if (Array.isArray(res.data)) {
    res.data.map((item, index) => {
      const { username, email, type, id } = item;
      res.data[index] = {
        ID: id,
        "User Name": username,
        Email: email,
        Type: type,
        "Major/Department": item.major || item.department,
      };
    });
  }

  return res;
};

const decideEnterEnrollment = async () => {
  const res = await myFetch(
    "/enrollment/decideEnterEnrollment",
    decideEnterEnrollmentDto,
    {
      method: "POST",
    }
  );
  return res;
};

export {
  addUser,
  addCourse,
  addLecture,
  editUser,
  deleteUser,
  editCourse,
  deleteCourse,
  editLecture,
  deleteLecture,
  getAllUser,
  getAllCourse,
  getAllLecture,
  decideEnterEnrollment,
};
