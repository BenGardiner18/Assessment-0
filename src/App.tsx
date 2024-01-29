import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Unstable_Grid2";
import { Select, Typography, MenuItem, SelectChangeEvent} from "@mui/material";
import { GradeTable } from "./components/GradeTable";
import { calcAllFinalGrade, calculateStudentFinalGrade, getAssignmentWeights} from "./utils/calculate_grade";

/**
 * You will find globals from this file useful!
 */
import { BASE_API_URL, GET_DEFAULT_HEADERS, MY_BU_ID } from "./globals";
import { IUniversityClass, IStudent } from "./types/api_types";
import { s } from "@fullcalendar/core/internal-common";

function App() {
  // You will need to use more of these!
  const [currClassId, setCurrClassId] = useState<string>("");
  const [currClassName,setCurrClassName] = useState<string>("");
  const [classList, setClassList] = useState<IUniversityClass[]>([]);
  const [studentList, setStudentList] = useState<IStudent[]>([]);

  const semester = "fall2022";

  const fetchClasses = async () => {
    // fetch classes from the API
    const res = await fetch(`${BASE_API_URL}/class/listBySemester/${semester}?buid=${MY_BU_ID}`, {
      method: "GET",
      headers: GET_DEFAULT_HEADERS(),
    });

    // turn response into JSON
    const json = await res.json();

    // turn JSON into IUniversityClass[]
    const universityClasses: IUniversityClass[] = json.map((item:any) => {
      return {
          classId: item.classId,
          title: item.title,
          description: item.description,
          meetingTime: item.meetingTime,
          meetingLocation: item.meetingLocation,
          status: item.status,
          semester: item.semester
      };
    });

    // set classList to IUniversityClass[]
    setClassList(universityClasses);

    const firstClassId = universityClasses[0].classId;
    setCurrClassId(firstClassId);
  };

  const fetchClassInfo = async (classId:string) => {
    const res = await fetch(`${BASE_API_URL}/class/getById/${classId}?buid=${MY_BU_ID}`, {
      method: "GET",
      headers: GET_DEFAULT_HEADERS(),
    });

    // turn response into JSON
    const json = await res.json();
    console.log(json);
    const className:string = json.title;
    return className;
  }

  useEffect(() => {
    fetchClasses();
  },[])

  useEffect(() => {
    fetchStudents();

    }, [currClassId]);

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const newValue = event.target.value;
    setCurrClassId(newValue);
  };

  const fetchStudents = async () => {
    const res = await fetch(`${BASE_API_URL}/class/listStudents/${currClassId}?buid=${MY_BU_ID}`, {
      method: "GET",
      headers: GET_DEFAULT_HEADERS(),
    });
  
    const studentIds = await res.json();
    const weights = await getAssignmentWeights(currClassId);

    const className = await fetchClassInfo(currClassId);
  
    const studentInfoPromises = studentIds.map((studentId: string) => fetchStudentInfo(studentId, weights,className));
    const students = await Promise.all(studentInfoPromises);
  
    setStudentList(students);
  };
  

  const fetchStudentInfo = async (studentId: string, weights: Array<number>,className:string) => {
    const res = await fetch(`${BASE_API_URL}/student/getById/${studentId}?buid=${MY_BU_ID}`, {
      method: "GET",
      headers: GET_DEFAULT_HEADERS(),
    });
  
    const json = await res.json();
    const studentName = json[0].name;
  
    const grade = await calculateStudentFinalGrade(studentId, currClassId, weights);
    
    const student:IStudent = {
      studentId: studentId,
      studentName: studentName,
      classId: currClassId,
      className: className, // Ensure this is updated with the correct class name
      semester: semester,
      grade: grade
    };

    return student;
  };
  


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom>
            Spark Assessment
          </Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            Select a class
          </Typography>
          <div style={{ width: "100%" }}>
            <Select value={currClassId} label="Class" fullWidth={true} onChange={handleSelectChange}>
              {classList.map((item:IUniversityClass) => (
                <MenuItem key={item.classId} value={item.classId}>
                  {item.title}
                </MenuItem>
              ))}
            </Select>

          </div>
        </Grid>
        <Grid xs={12} md={8}>
          <Typography variant="h4" gutterBottom>
            Final Grades
          </Typography>
          <div>
            <GradeTable list={studentList} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

