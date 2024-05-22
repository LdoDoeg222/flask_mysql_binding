# flask路由，返回json相关
from flask import request, jsonify, Flask, send_from_directory, Response
from flask_cors import CORS

app = Flask(__name__)
origin = ['http://127.0.0.1:3000']
CORS(app, origins=origin)  # 跨域

"""从自定义包装类获取数据库连接，引入的db才是对应数据库的连接"""
from mysql_connector.Entity.MyModel import (Student, Instructor, Admin, Enrollment, Lecture, Course, Assignment,
                                            Submission, SubmissionFeedBack, SubmissionFeedBackDetail)
from mysql_connector.mysql_config.config import db

"""从自定义密码加密获取:密码加密，密码校验,参数占位符获取"""
from mysql_connector.utill.utills import myBcryptEncoder, myCheckpw, myGetPlaceHolders, myToDir

"""从自定义用户类型枚举导入"""
from Enum.UserTyprEnums import UserType
# 日期相关
import datetime

# 文件存储目录
UPLOAD_FOLDER = 'uploadFiles'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# os操作流
import os


# 创建目标文件夹（如果不存在）

# 登录
@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    type = request.form.get('type')
    type = int(type)
    print(type)
    if type == UserType.student.value:
        # 表名为学生
        user = Student.query(db).filter("username = %s", username).first()
        print("login学生:=====>" + "username:" + username + "password:" + password)
    if type == UserType.instructor.value:
        # 表名为老师
        user = Instructor.query(db).filter("username = %s", username).first()
        print("login教师:=====>" + "username:" + username + "password:" + password)
    if type == UserType.admin.value:
        user = Admin.query(db).filter("username = %s", username).first()
        print("login管理:=====>" + "username:" + username + "password:" + password)

    if user:
        # 判断取出的密码是否匹配
        if myCheckpw(password, user.password):
            return jsonify({
                'code': 200,
                'data': {
                    'identity': type,
                    'userId': user.id
                },
                'msg': '登录成功'
            })

    return jsonify({
        'code': 500,
        'data': {'res': False},
        'msg': '登录失败,用户名或密码出错'
    })


# 注册
@app.route('/register', methods=['PUT'])
def register():
    # 获取数据
    username = request.form.get('username')
    password = request.form.get('password')
    phone = request.form.get('phone')
    email = request.form.get('email')
    major = request.form.get('major')
    department = request.form.get('department')
    type = request.form.get('type')
    type = int(type)
    if type == UserType.student.value:
        # 表名为学生
        userTest = Student.query(db).filter("username = %s ", username).first()
        if userTest:
            return jsonify({
                'code': 500,
                'data': {'res': False},
                'msg': '用户已存在，请检查类型或者名字'
            })
        user = Student(username=username, password=myBcryptEncoder(password), phone=phone, email=email, major=major)
    if type == UserType.instructor.value:
        # 表名为老师
        userTest = Instructor.query(db).filter("username = %s", username).first()
        if userTest:
            return jsonify({
                'code': 500,
                'data': {'res': False},
                'msg': '用户已存在，请检查类型或者名字'
            })
        user = Instructor(username=username, password=myBcryptEncoder(password), phone=phone, email=email,
                          department=department)
    if type == UserType.admin.value:
        # 表名为管理员
        userTest = Admin.query(db).filter("username = %s", username).first()
        if userTest:
            return jsonify({
                'code': 500,
                'data': {'res': False},
                'msg': '用户已存在，请检查类型或者名字'
            })
        user = Admin(username=username, password=myBcryptEncoder(password), phone=phone, email=email)

    # 用户实体提交
    result = user.save(db)

    return jsonify({
        'code': 200,
        'data': {
            'identity': type,
            'userId': result
        },
        'msg': '注册成功'
    })


# # (获取个人注册课程列表)
@app.route('/course/getCourseByStudentId', methods=['POST'])
def getByStudentId():
    studentId = request.form.get('student_id')
    print("getByStudentId:" + "查询studentId:======>" + studentId)
    # 获取个人选择的教学课程
    enrollmentList = Enrollment.query(db).filter(" student_id = %s and status != 0", studentId).all()
    # 获取id列表
    enrollmentLectureIdList = []
    for enrollment in enrollmentList:
        enrollmentLectureIdList.append(enrollment.lecture_id)

    # 生成SQL查询中的占位符字符串
    placeholders = myGetPlaceHolders(enrollmentLectureIdList)

    # 构建查询
    query_string = f"id IN ({placeholders})"

    # 获取教学课程
    lectureList = Lecture.query(db).filter(query_string, *enrollmentLectureIdList).all()

    lectureListData = []
    # 获取教师信息
    for lecture in lectureList:
        instructor = Instructor.query(db).filter("id = %s", lecture.instructor_id).first()
        # 构造lectureData
        lecture = lecture.to_dict()
        perLectureData = {"instructorName": instructor.username, "lectureData": lecture}
        # 包装
        lectureListData.append(perLectureData)
    # print(lectureListData)
    # 获取真正课程
    return jsonify({
        'code': 200,
        'data': {'lectureListData': lectureListData},
        'msg': '成功查询'
    })


# (获取教师发布的作业)
@app.route('/assignment/getAssignmentByStudentId', methods=['POST'])
def getAssignmentByStudentId():
    studentId = request.form.get('student_id')
    print("getAssignmentByStudentId:" + "查询studentId:======>" + studentId)
    # 注册课程列表
    enrollmentList = Enrollment.query(db).filter("student_id = %s", studentId).all()

    # 构建id列表
    enrollmentLectureIdList = []
    for enrollment in enrollmentList:
        enrollmentLectureIdList.append(enrollment.lecture_id)

    # 生成SQL查询中的占位符字符串
    placeholders = myGetPlaceHolders(enrollmentLectureIdList)

    # 构建查询
    query_string = f"id IN ({placeholders})"

    # 获取教学课程
    lectureList = Lecture.query(db).filter(query_string, *enrollmentLectureIdList).all()

    lectureIdList = [lecture.id for lecture in lectureList]

    resultList = []
    for lecture in lectureList:
        assignmentList = Assignment.query(db).filter("is_delete = 0").filter("lecture_id = %s", lecture.id).all()
        # 序列化每一个类
        assignmentResultList = myToDir(assignmentList)

        # 作业map, # 教学课程map
        perResult = {'lecture_name': lecture.lecture_name, 'assignmentList': assignmentResultList}
        resultList.append(perResult)

    return jsonify({
        'code': 200,
        'data': resultList,
        'msg': '成功查询'
    })


# (获取某个课程的教学班列表)
@app.route('/lecture/getAllLectureByCourseId', methods=['POST'])
def getAllLectureByCourseId():
    courseId = request.form.get('course_id')
    print("getAllLectureByCourseId:" + "查询course_id:======>" + courseId)
    lectureList = Lecture.query(db).filter("course_id = %s", courseId).all()
    lectureListData = myToDir(lectureList)
    return jsonify({
        'code': 200,
        'data': lectureListData,
        'msg': '成功查询'
    })


# (获取所有课程的教学班列表)
@app.route('/lecture/findAllLecture', methods=['GET'])
def findAllLecture():
    # 所有课程列表
    courseList = Course.query(db).all()

    # 定义返回结果
    resultList = []
    # 根据课程id批量查询教学课程
    for course in courseList:
        # 课程map
        # courseMap = {'course_name': course.course_name}
        courseId = course.id
        # 查询教学课程
        lectureList = Lecture.query(db).filter("course_id = %s", courseId).all()
        # 序列化每一个类
        lectureListData = myToDir(lectureList)
        # 教学课程map
        # lectureMap = {'lectureList': lectureListData}
        perResult = {'course_name': course.course_name, 'lectureList': lectureListData}
        resultList.append(perResult)

    return jsonify({
        'code': 200,
        'data': resultList,
        'msg': '成功查询'
    })


# (提交作业)
@app.route('/submission/submitWork', methods=['PUT'])
def submitWork():
    lectureId = request.form.get('lecture_id')
    title = request.form.get('title')
    studentId = request.form.get('student_id')
    submit_time = request.form.get('submit_time')
    if submit_time != '' and submit_time != ' ' and submit_time is not None:
        submission = Submission(title=title, lecture_id=lectureId, student_id=studentId, submit_time=submit_time
                                )
    else:
        submission = Submission(title=title, lecture_id=lectureId, student_id=studentId,
                                submit_time=datetime.datetime.now())
    resultId = submission.save(db)
    print(resultId)
    return jsonify({
        'code': 200,
        'data': True,
        'msg': '成功提交'
    })


# (获取作业提交后的状态)
@app.route('/submission/getSubmitWorkByStudentId', methods=['POST'])
def getSubmitWorkByStudentId():
    studentId = request.form.get('student_id')

    submissionList = Submission.query(db).filter("student_id = %s", studentId).all()

    submissionListData = myToDir(submissionList)

    return jsonify({
        'code': 200,
        'data': {'submissionListData': submissionListData},
        'msg': '获取提交状态成功'
    })


# (获取作业反馈)
@app.route('/submission/getSubmissionFeedBackBySubmissionId', methods=['POST'])
def getSubmissionFeedBackBySubmissionId():
    submissionId = request.form.get('submission_id')

    # 获取反馈信息
    submissionFeedBack = SubmissionFeedBack.query(db).filter("submission_id = %s ", submissionId).first()
    # submissionFeedBackMap = {"submissionFeedBack": submissionFeedBack}
    # 获取反馈详细信息列表
    submissionFeedBackDetailList = SubmissionFeedBackDetail.query(db).filter("submission_feedback_id = %s ",
                                                                             submissionFeedBack.id).all()
    submissionFeedBackDetailListData = myToDir(submissionFeedBackDetailList)
    # submissionFeedBackDetailListMap = {"submissionFeedBackDetailList": submissionFeedBackDetailListData}

    submissionFeedBack = submissionFeedBack.to_dict()
    resultMap = {"submissionFeedBack": submissionFeedBack,
                 "submissionFeedBackDetailList": submissionFeedBackDetailListData}
    return jsonify({
        'code': 200,
        'data': {'SubmissionFeedBackInfo': resultMap},
        'msg': '获取提交状态成功'
    })


# 申请加入课程
@app.route('/enrollment/enterEnrollment', methods=['PUT'])
def enterEnrollment():
    # 教学课程id
    lectureId = request.form.get('lecture_id')
    # level:等级,condition:状态,都有默认值,因为只是学生申请,管理员同意才能修改
    studentId = request.form.get('student_id')
    academicYear = request.form.get('academic_year')

    enrollment = Enrollment(lecture_id=lectureId, student_id=studentId, academic_year=academicYear)

    resulId = enrollment.save(db)
    print(resulId)
    return jsonify({
        'code': 200,
        'data': True,
        'msg': '成功提交'
    })


# 获取所教教学班、课程列表
@app.route('/course/getCourseAndLecture', methods=['POST'])
def getCourseAndLecture():
    instructorId = request.form.get('instructor_id')
    print("getCourseAndLecture:" + "查询instructorId:======>" + instructorId)

    # 获取个人所教的教学课程
    lectureList = Lecture.query(db).filter("instructor_id = %s", instructorId).all()
    lectureListData = myToDir(lectureList)
    # 获取课程

    # 获取真正课程
    return jsonify({
        'code': 200,
        'data': {"lectureListData": lectureListData},
        'msg': '成功查询'
    })


# 获取教学班内学生列表
@app.route('/student/getStudentByInstructorId', methods=['POST'])
def getStudentByInstructorId():
    instructorId = request.form.get('instructor_id')
    print("getStudentByInstructorId:" + "查询instructorId:======>" + instructorId)

    # 获取个人所教的教学课程
    lectureList = Lecture.query(db).filter("instructor_id = %s", instructorId).all()

    resultList = []
    for lecture in lectureList:
        # lectureNameMap = {"lecture_name": lecture.lecture_name}
        # 获取教学班得学生列表
        studentList = (Student.query(db)
                       .join(Enrollment, "enrollment.student_id = student.id and enrollment.status != 0")
                       .join(Lecture, "lecture.id = enrollment.lecture_id and lecture.id = %s", lecture.id)
                       .all()
                       )
        studentListData = myToDir(studentList)

        # 每个返回map
        perMap = {"lecture_name": lecture.lecture_name, "studentListData": studentListData}

        #    添加到结果
        resultList.append(perMap)
    # 获取真正课程
    return jsonify({
        'code': 200,
        'data': {"lectureListData": resultList},
        'msg': '成功查询'
    })


# (创建教学班)
@app.route('/lecture/createLecture', methods=['PUT'])
def createLecture():
    instructorId = request.form.get('instructor_id')
    courseId = request.form.get('course_id')
    time = request.form.get('time')
    lectureName = request.form.get('lecture_name')
    # 根据课程id获取课程名字
    course = Course.query(db).filter("id = %s", courseId).first()
    if course:
        if time != '' and time != ' ' and time is not None:
            lecture = Lecture(instructor_id=instructorId, time=time,
                              course_id=courseId, lecture_name=lectureName,
                              course_name=course.course_name)
        else:
            lecture = Lecture(instructor_id=instructorId, time=datetime.datetime.now(),
                              course_id=courseId, lecture_name=lectureName,
                              course_name=course.course_name)
        resultId = lecture.save(db)
        print(resultId)
        return jsonify({
            'code': 200,
            'data': True,
            'msg': '成功创建'
        })
    else:
        return jsonify({
            'code': 500,
            'data': False,
            'msg': '对应的课程不存在，检查一下？'
        })


# (创建,布置作业)
@app.route('/assignment/createAssignment', methods=['PUT'])
def createAssignment():
    # 关联得教学课程
    lectureId = request.form.get('lecture_id')
    title = request.form.get('title')
    deadline = request.form.get('deadline')
    description = request.form.get('description')
    # 截至时间若不设置则默认为1星期后
    if deadline != '' and deadline != ' ' and deadline is not None:
        print("传入deadline参数===>{}".format(deadline))
        assignment = Assignment(lecture_id=lectureId, title=title, deadline=deadline, description=description)
    else:
        print("未传入deadline参数")
        assignment = Assignment(lecture_id=lectureId, title=title,
                                deadline=datetime.datetime.utcnow() + datetime.timedelta(days=7),
                                description=description)
    assignment.save(db)

    return jsonify({
        'code': 200,
        'data': True,
        'msg': '成功创建'
    })


# (修改，删除作业)
@app.route('/assignment/updateAssignment', methods=['POST'])
def updateAssignment():
    # 关联得教学课程
    id = request.form.get('id')
    lectureId = request.form.get('lecture_id')
    title = request.form.get('title')
    deadline = request.form.get('deadline')
    description = request.form.get('description')
    is_delete = request.form.get('is_delete')
    # 格式转换
    if is_delete == "true" or is_delete == "1":
        isDelete = True
    else:
        isDelete = False
    # 查询特定的 Assignment
    assignment = Assignment.query(db).filter("id = %s", id).first()

    if assignment:
        # 选择性更新字段，只有当相应字段不为空时才更新
        if lectureId:
            assignment.lecture_id = lectureId
        if title:
            assignment.title = title
        if deadline:
            assignment.deadline = deadline
        if description:
            assignment.description = description
        if isDelete:
            assignment.is_delete = isDelete

        # 提交更新到数据库
        resultId = assignment.update(db)
        print(resultId)
        return jsonify({
            'code': 200,
            'data': {'res': True},
            'msg': '成功修改'
        })
    else:
        print(" 跟据提供的ID查询不到数据")
        return jsonify({
            'code': 500,
            'data': {'res': '跟据提供的ID查询不到数据,或者没有传id'},
            'msg': '跟据提供的ID查询不到数据,或者没有传id'
        })


# 访问学生的提交作业
@app.route('/submission/getsubmitWorkByInstructorId', methods=['POST'])
def getsubmitWorkByInstructorId():
    instructorId = request.form.get('instructor_id')

    lectureList = Lecture.query(db).filter("instructor_id = %s ", instructorId).all()
    # 返回结果
    resultList = []

    for lecture in lectureList:
        # 查找每一个教学班对应的作业
        # print(lecture.id)
        submissionList = Submission.query(db).filter("lecture_id = %s ", lecture.id).all()
        # 手动序列化,避免无法进行json转换
        submissionListData = myToDir(submissionList)
        perResultMap = {'lecture_name': lecture.lecture_name, "submissionListData": submissionListData}

        resultList.append(perResultMap)

    return jsonify({
        'code': 200,
        'data': {"resultList": resultList},
        'msg': '查询成功'
    })


# (评分)
@app.route('/submission/updateSubmission', methods=['POST'])
def updateSubmission():
    id = request.form.get('id')
    description = request.form.get('description')
    # 查询特定的 Assignment
    submission = Submission.query(db).filter("id = %s", id).first()

    if submission:
        # 选择性更新字段，只有当相应字段不为空时才更新
        if description:
            submission.description = description

        # 提交更新到数据库
        submission.update(db)
    else:
        print(" 跟据提供的ID查询不到数据")
        return jsonify({
            'code': 500,
            'data': {'res': '跟据提供的ID查询不到数据,或者没有传id'},
            'msg': '跟据提供的ID查询不到数据,或者没有传id'
        })
    return jsonify({
        'code': 200,
        'data': {'res': True},
        'msg': '成功评价'
    })


# 创建反馈信息
@app.route('/submission/addSubmissionFeedBack', methods=['PUT'])
def addSubmissionFeedBack():
    submissionId = request.form.get('submission_id')
    titleInformation = request.form.get('title_information')
    # 查询特定的 Assignment
    submission = Submission.query(db).filter("id = %s", submissionId).first()
    if submission:
        # 构建反馈框架
        submissionFeedback = SubmissionFeedBack(submission_id=submissionId, title_information=titleInformation)
        resultId = submissionFeedback.save(db)
        return jsonify({
            'code': 200,
            'data': {'submission_feedback_id': resultId},
            'msg': '增加成功'
        })
    else:
        return jsonify({
            'code': 500,
            'data': {'res': False},
            'msg': '该submission不存在，请检查？'
        })


# 更新反馈信息
@app.route('/submission/updateSubmissionFeedBack', methods=['POST'])
def updateSubmissionFeedBack():
    feedback_id = request.form.get('submission_feedback_id')
    titleInformation = request.form.get('title_information')
    scoreTotal = request.form.get('score_total')
    # 格式转换
    scoreTotal = int(scoreTotal)
    scoreGet = request.form.get('score_get')
    # 格式转换
    scoreGet = int(scoreGet)
    provisionalTotal = request.form.get('provisional_total')
    # 格式转换
    if provisionalTotal != '' and provisionalTotal != ' ' and provisionalTotal is not None:
        provisionalTotal = float(provisionalTotal)
        # 查询特定的 SubmissionFeedBack
    submissionFeedBack = SubmissionFeedBack.query(db).filter("id = %s", feedback_id).first()
    if submissionFeedBack:
        # 构建反馈框架
        if titleInformation:
            submissionFeedBack.title_information = titleInformation
        if scoreTotal:
            submissionFeedBack.score_total = scoreTotal
        if scoreGet:
            submissionFeedBack.score_get = scoreGet
        if provisionalTotal != '' and provisionalTotal != ' ' and provisionalTotal is not None:
            submissionFeedBack.provisional_total = provisionalTotal
        else:
            submissionFeedBack.provisional_total = float(scoreGet / scoreTotal)
        resultId = submissionFeedBack.update(db)
        return jsonify({
            'code': 200,
            'data': {'submission_feedback_id': resultId},
            'msg': '更新成功'
        })
    else:
        return jsonify({
            'code': 500,
            'data': {'res': False},
            'msg': '该SubmissionFeedBack不存在，请检查submission_feedback_id？'
        })


# 创建反馈详细信息
@app.route('/submission/addSubmissionFeedBackDetail', methods=['PUT'])
def addSubmissionFeedBackDetail():
    submissionFeedBackId = request.form.get('submission_feedback_id')
    criteria = request.form.get('criteria')
    comment = request.form.get('comment')
    scoreSum = request.form.get('score_sum')
    scoreSum = int(scoreSum)
    scoreGet = request.form.get('score_get')
    scoreGet = int(scoreGet)

    # 查询特定的 SubmissionFeedBack
    submissionFeedBack = SubmissionFeedBack.query(db).filter("id = %s", submissionFeedBackId).first()
    if submissionFeedBack:
        # 构建反馈框架
        submissionFeedbackDetail = SubmissionFeedBackDetail(criteria=criteria, comment=comment, score_sum=scoreSum,
                                                            score_get=scoreGet,
                                                            submission_feedback_id=submissionFeedBackId)
        resultId = submissionFeedbackDetail.save(db)
        return jsonify({
            'code': 200,
            'data': {'res': True},
            'msg': '增加成功'
        })
    else:
        return jsonify({
            'code': 500,
            'data': {'res': False},
            'msg': '该submissionFeedBack不存在，请检查？'
        })


# 获取用户列表
@app.route('/user/getAllUser', methods=['GET'])
def getAllUser():
    # 查询所有学生
    studentList = Student.query(db).all()
    studentListData = myToDir(studentList)
    # 学生列表
    studentListMap = {"studentList": studentListData}
    # 查询所有教师
    instructorList = Instructor.query(db).all()
    instructorListData = myToDir(instructorList)
    instructorMap = {"instructorList": instructorListData}
    userList = (studentListMap, instructorMap)
    return jsonify({
        'code': 200,
        'data': userList,
        'msg': '查询成功'
    })


# 创建用户信息
@app.route('/user/addUser', methods=['PUT'])
def addUser():
    username = request.form.get('username')
    password = request.form.get('password')
    phone = request.form.get('phone')
    email = request.form.get('email')
    major = request.form.get('major')
    department = request.form.get('department')
    type = request.form.get('type')
    type = int(type)
    if type == UserType.student.value:
        # 表名为学生
        userTest = Student.query(db).filter("username = %s ", username).first()
        if userTest:
            return jsonify({
                'code': 500,
                'data': {'res': False},
                'msg': '用户已存在，请检查类型或者名字'
            })
        user = Student(username=username, password=myBcryptEncoder(password), phone=phone, email=email, major=major)
    if type == UserType.instructor.value:
        # 表名为老师
        userTest = Instructor.query(db).filter("username = %s ", username).first()
        if userTest:
            return jsonify({
                'code': 500,
                'data': {'res': False},
                'msg': '用户已存在，请检查类型或者名字'
            })
        user = Instructor(username=username, password=myBcryptEncoder(password), phone=phone, email=email,
                          department=department)
    if type == UserType.admin.value:
        # 表名为管理员
        userTest = Admin.query(db).filter("username = %s ", username).first()
        if userTest:
            return jsonify({
                'code': 500,
                'data': {'res': False},
                'msg': '用户已存在，请检查类型或者名字'
            })
        user = Admin(username=username, password=myBcryptEncoder(password), phone=phone, email=email)

    resultId = user.save(db)
    return jsonify({
        'code': 200,
        'data': {
            'identity': type,
            'resultId': resultId
        },
        'msg': '创建用户成功'
    })


# 编辑用户信息
@app.route('/user/editUser', methods=['POST'])
def editlUser():
    # 信息接收
    userId = request.form.get('id')
    username = request.form.get('username')
    password = request.form.get('password')
    phone = request.form.get('phone')
    email = request.form.get('email')
    major = request.form.get('major')
    department = request.form.get('department')
    type = request.form.get('type')
    type = int(type)
    user = {}
    if type == UserType.student.value:
        # 表名为学生
        student = Student.query(db).filter("id = %s ", userId).first()
        user = student
    if type == UserType.instructor.value:
        # 表名为老师
        instructor = Instructor.query(db).filter("id = %s ", userId).first()
        user = instructor

    if user:
        # 相同信息
        # 选择性更新字段，只有当相应字段不为空时才更新
        if username:
            user.username = username
        if password:
            user.password = myBcryptEncoder(password)
        if phone:
            user.phone = phone
        if email:
            user.email = email
        if major:
            user.major = major
        if department:
            user.department = department

        resultId = user.update(db)
        return jsonify({
            'code': 200,
            'data': {
                "res": True,
                'resultId': resultId
            },
            'msg': '编辑成功'
        })
    return jsonify({
        'code': 500,
        'data': {"res": "可能查找不到数据,是否传入id有误"},
        'msg': '可能查找不到数据,是否传入id有误'
    })


# 删除用户信息
@app.route('/user/deleteUser', methods=['DELETE'])
def deleteUser():
    # 信息接收
    userId = request.form.get('id')
    type = request.form.get('type')
    type = int(type)
    if type == UserType.student.value:
        # 表名为学生
        user = Student.query(db).filter("id = %s ", userId).first()
    if type == UserType.instructor.value:
        # 表名为老师
        user = Instructor.query(db).filter("id = %s ", userId).first()
    if user:
        deleteResult = user.delete(db)
        if deleteResult:
            return jsonify({
                'code': 200,
                'data': {"res": True},
                'msg': '删除成功'
            })
        else:
            return jsonify({
                'code': 500,
                'data': {"res": False},
                'msg': '也许你无法在删除其实体关联的实体前对此实体进行删除'
            })
    else:
        return jsonify({
            'code': 500,
            'data': {"res": False},
            'msg': '找不到数据，请检查用户id和类型？'
        })


# 获取课程列表
@app.route('/course/getAllCourse', methods=['GET'])
def getAllCourse():
    # 查询所有课程
    courseList = Course.query(db).all()
    courseListData = myToDir(courseList)
    courseListMap = {"courseList": courseListData}

    return jsonify({
        'code': 200,
        'data': courseListMap,
        'msg': '查询成功'
    })


# 创建课程信息
@app.route('/course/addCourse', methods=['PUT'])
def addCourse():
    courseName = request.form.get('course_name')
    description = request.form.get('description')
    course = Course(course_name=courseName, description=description)
    resultId = course.save(db)
    return jsonify({
        'code': 200,
        'data': {'res': True,
                 "resultId": resultId
                 },
        'msg': '添加成功'
    })


# 编辑课程信息
@app.route('/course/editCourse', methods=['POST'])
def editCourse():
    # 信息接收
    courseId = request.form.get('id')
    courseName = request.form.get('course_name')
    description = request.form.get('description')
    # 根据id查询信息
    course = Course.query(db).filter("id = %s ", courseId).first()
    if course:
        # 修改信息
        if courseName:
            course.course_name = courseName
        if description:
            course.description = description

        resultId = course.update(db)
        return jsonify({
            'code': 200,
            'data': {
                "res": True,
                "resultId": resultId
            },
            'msg': '编辑成功'
        })
    return jsonify({
        'code': 500,
        'data': {"res": "可能查找不到数据,是否传入id有误"},
        'msg': '可能查找不到数据,是否传入id有误'
    })


# 删除课程信息
@app.route('/course/deleteCourse', methods=['DELETE'])
def ddeleteCourse():
    # 信息接收
    courseId = request.form.get('id')

    # 根据id查询信息
    course = Course.query(db).filter("id = %s ", courseId).first()
    if course:
        # 修改信息
        deleteResult = course.delete(db)
        if deleteResult:
            return jsonify({
                'code': 200,
                'data': {"res": True},
                'msg': '删除成功'
            })
        else:
            return jsonify({
                'code': 500,
                'data': {"res": False},
                'msg': '也许你无法在删除其实体关联的实体前对此实体进行删除'
            })
    else:
        return jsonify({
            'code': 500,
            'data': {"res": False},
            'msg': '查询不到数据，检查一下？'
        })


# 获取教学课程列表
@app.route('/lecture/getAllLecture', methods=['GET'])
def getAllLecture():
    # 查询所有教学课程
    lectureList = Lecture.query(db).all()
    lectureListData = myToDir(lectureList)
    lectureListMap = {"lectureList": lectureListData}

    return jsonify({
        'code': 200,
        'data': lectureListMap,
        'msg': '查询成功'
    })


# 编辑教学课程信息
@app.route('/lecture/editLecture', methods=['POST'])
def editLecture():
    # 获取参数
    lectureId = request.form.get('id')
    time = request.form.get('time')
    lectureName = request.form.get('lecture_name')
    status = request.form.get('status')
    is_delete = request.form.get('is_delete')
    # 格式转换
    if is_delete == "true" or is_delete == "1":
        isDelete = True
    else:
        isDelete = False
    # 查询教学课程
    lecture = Lecture.query(db).filter("id = %s ", lectureId).first()

    if lecture:
        if lectureName:
            lecture.lecture_name = lectureName
        if time:
            lecture.time = time
        if status:
            lecture.status = status
        if isDelete:
            lecture.is_delete = isDelete

        resultId = lecture.update(db)
        return jsonify({
            'code': 200,
            'data': {"res": True,
                     "resultId": resultId
                     },
            'msg': '编辑成功'
        })

    return jsonify({
        'code': 500,
        'data': {"res": "可能查找不到数据,是否传入id有误"},
        'msg': '可能查找不到数据,是否传入id有误'
    })


# 删除教学课程信息
@app.route('/lecture/deleteLecture', methods=['DELETE'])
def deleteLecture():
    # 获取参数
    lectureId = request.form.get('id')

    # 查询教学课程
    lecture = Lecture.query(db).filter("id = %s", lectureId).first()
    print(lecture)
    if lecture:

        deleteResult = lecture.delete(db)
        if deleteResult:
            return jsonify({
                'code': 200,
                'data': {"res": True},
                'msg': '删除成功'
            })
        else:
            return jsonify({
                'code': 500,
                'data': {"res": False},
                'msg': '也许你无法在删除其实体关联的实体前对此实体进行删除'
            })
    else:
        return jsonify({
            'code': 500,
            'data': {"res": "可能查找不到数据,是否传入id有误"},
            'msg': '可能查找不到数据,是否传入id有误'
        })


# 为一名教师创建课程
@app.route('/lecture/addLecture', methods=['POST'])
def addLecture():
    # 获取参数
    instructorId = request.form.get('instructor_id')
    courseId = request.form.get('course_id')
    time = request.form.get('time')
    lectureName = request.form.get('lecture_name')
    course = Course.query(db).filter("id = %s", courseId).first()
    if course:

        if time != '' and time != ' ' and time is not None:
            # 新增教学课程
            lecture = Lecture(instructor_id=instructorId, course_name=course.course_name, course_id=courseId, time=time,
                              lecture_name=lectureName)
        else:
            lecture = Lecture(instructor_id=instructorId, course_name=course.course_name, course_id=courseId,
                              time=datetime.datetime.now(),
                              lecture_name=lectureName)
        lecture.save(db)
        return jsonify({
            'code': 200,
            'data': {"res": True},
            'msg': '添加成功'
        })
    return jsonify({
        'code': 500,
        'data': {"res": False},
        'msg': '检查一下'
    })


# 决定是否允许学生注册课程
@app.route('/enrollment/decideEnterEnrollment', methods=['POST'])
def decideEnterEnrollment():
    # 教学课程id
    enrollmentId = request.form.get('id')
    print("decideEnterEnrollment:" + "enrollmentId:====>" + enrollmentId)
    # level:等级,condition:状态,都有默认值,因为只是学生申请,管理员同意才能修改
    condition = request.form.get('condition')

    # 查询是否存在
    enrollment = Enrollment.query(db).filter("id = %s", enrollmentId).first()

    if enrollment:
        if condition:
            enrollment.status = condition
        print(enrollment)
        enrollment.update(db)
        return jsonify({
            'code': 200,
            'data': True,
            'msg': '成功提交'
        })
    return jsonify({
        'code': 500,
        'data': False,
        'msg': '检查id'
    })


@app.route('/file/ListFiles', methods=['GET'])
def index():
    # 获取目录中的文件列表
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    # 将文件列表传递给模板
    return jsonify({
        'code': 200,
        'data': {"fileList": files},
        'msg': '检查id'
    })


@app.route('/file/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)
    # 获取目录中的文件列表
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return jsonify({
        'code': 200,
        'data': {
            "res": True,
            "fileList": files
        },
        'msg': '获取成功'
    })


@app.route('/files/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)


@app.route('/display/<filename>')
def display_file(filename):
    try:
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with open(file_path, 'rb') as f:
            # 文件读取流
            file_content = f.read()
        if filename.endswith('.txt'):
            return Response(file_content, mimetype='text/plain')
        elif filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            return Response(file_content, mimetype='image/jpeg')
        elif filename.lower().endswith('.pdf'):
            return Response(file_content, mimetype='application/pdf')
        else:
            return "File format not supported for preview."
    except IOError:
        return "File not found."


if __name__ == '__main__':
    # """在第一次请求处理前创建所有定义的表"""
    # with app.app_context():
    #     db.create_all()
    app.run(debug=True)
