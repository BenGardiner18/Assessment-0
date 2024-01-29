/**
 * This file contains some function stubs(ie incomplete functions) that
 * you MUST use to begin the work for calculating the grades.
 *
 * You may need more functions than are currently here...we highly encourage you to define more.
 *
 * Anything that has a type of "undefined" you will need to replace with something.
 */
import { IStudent } from "../types/api_types";
import { BASE_API_URL,MY_BU_ID,GET_DEFAULT_HEADERS } from "../globals";


/**
 * This function might help you write the function below.
 * It retrieves the final grade for a single student based on the passed params.
 * 
 * If you are reading here and you haven't read the top of the file...go back.
 */
export async function calculateStudentFinalGrade(
  studentID: string,
  classID: string,
  weights: Array<number>
) {

  const grades = await getStudentGrades(studentID, classID);

  const finalGrade = grades.reduce((acc: number, grade: number, index: number) => {
    return acc + grade * weights[index];
  }, 0)/100;


  return finalGrade;
}

export async function getStudentGrades(studentID: string, classID: string) {
  const res = await fetch(`${BASE_API_URL}/student/listGrades/${studentID}/${classID}?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  const json = await res.json();

  const gradesObject = json.grades
  const gradesStr = Object.values(gradesObject[0])
  const gradesInt = gradesStr.map((grade: any) => { return parseInt(grade) });

  return gradesInt;
}


export async function getAssignmentWeights(classID: string) {
  const res = await fetch(`${BASE_API_URL}/class/listAssignments/${classID}?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  const json = await res.json();

  const weights = json.map((assignment: any) => {

    return assignment.weight;
  });
  return weights;
}

export async function getStudents(classID: string,) {
  const res = await fetch(`${BASE_API_URL}/class/listStudents/${classID}?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  const json = await res.json();

  return json;
}

/**
 * You need to write this function! You might want to write more functions to make the code easier to read as well.
 * 
 *  If you are reading here and you haven't read the top of the file...go back.
 * 
 * @param classID The ID of the class for which we want to calculate the final grades
 * @returns Some data structure that has a list of each student and their final grade.
 */
export async function calcAllFinalGrade(classID: string, studentList: IStudent[]) {
  const weights: Array<number> = await getAssignmentWeights(classID); // Get the weights for each assignment type

  const students: Array<string> = await getStudents(classID); // Get the students in the class

  const gradePromises = students.map((student: any) => {
    return calculateStudentFinalGrade(student, classID, weights);
  });

  const grades = await Promise.all(gradePromises);
  console.log(grades);  

  for (let i = 0; i < studentList.length; i++) {
    studentList[i].grade = grades[i];
  }

  return Promise.all(studentList);
}
