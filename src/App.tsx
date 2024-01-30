  import React, { useEffect,useCallback,useState } from "react";
  import Grid from "@mui/material/Unstable_Grid2";
  import { Select, Typography, MenuItem, SelectChangeEvent} from "@mui/material";
  import { GradeTable } from "./components/GradeTable";
  import { calculateStudentFinalGrade, getAssignmentWeights} from "./utils/calculate_grade";

  /**
   * You will find globals from this file useful!
   */
  import { BASE_API_URL, GET_DEFAULT_HEADERS, MY_BU_ID } from "./globals";
  import { IUniversityClass, IStudent } from "./types/api_types";

  function App() {
    // You will need to use more of these!
    const [currClassId, setCurrClassId] = useState<string>("");
    const [classList, setClassList] = useState<IUniversityClass[]>([]);
    const [studentList, setStudentList] = useState<IStudent[]>([]);

    const semester = "fall2022";

    // testing

    const fetchClasses = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/class/listBySemester/${semester}?buid=${MY_BU_ID}`, {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        });
    
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
    
        const json = await res.json();
        const universityClasses = json.map((item: any) => ({
          classId: item.classId,
          title: item.title,
          description: item.description,
          meetingTime: item.meetingTime,
          meetingLocation: item.meetingLocation,
          status: item.status,
          semester: item.semester
        }));
    
        setClassList(universityClasses);
        const firstClassId = universityClasses[0]?.classId;
        if (firstClassId) {
          setCurrClassId(firstClassId);
        }
      } catch (error) {
        console.error("Failed to fetch classes:", error);
        // Additional error handling (e.g., show a notification to the user)
      }
    };


    const fetchStudentInfo = useCallback(async (studentId: string, weights: Array<number>, className: string) => {
      try {
        const res = await fetch(`${BASE_API_URL}/student/getById/${studentId}?buid=${MY_BU_ID}`, {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        });
    
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
    
        const json = await res.json();
        const studentName = json[0].name;
        const grade = await calculateStudentFinalGrade(studentId, currClassId, weights);
    
        return {
          studentId: studentId,
          studentName: studentName,
          classId: currClassId,
          className: className,
          semester: semester,
          grade: grade
        };
      } catch (error) {
        console.error(`Failed to fetch info for student ID ${studentId}:`, error);
        // Additional error handling
        return null; // Or a default error object
      }
    }, [BASE_API_URL, GET_DEFAULT_HEADERS, currClassId, calculateStudentFinalGrade]); // Include relevant dependencies

    
    

    const fetchClassInfo = useCallback(async (classId: string) => {
      try {
        const res = await fetch(`${BASE_API_URL}/class/getById/${classId}?buid=${MY_BU_ID}`, {
          method: "GET",
          headers: GET_DEFAULT_HEADERS(),
        });
    
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
    
        const json = await res.json();
        return json.title;
      } catch (error) {
        console.error(`Failed to fetch class info for class ID ${classId}:`, error);
        // Additional error handling
        return ''; // Return a default or error value
      }
    }, [BASE_API_URL, GET_DEFAULT_HEADERS, MY_BU_ID]);
    
    
    const fetchStudents = useCallback(async () => {
      const res = await fetch(`${BASE_API_URL}/class/listStudents/${currClassId}?buid=${MY_BU_ID}`, {
        method: "GET",
        headers: GET_DEFAULT_HEADERS(),
      });
    
      const studentIds = await res.json();
      const weights = await getAssignmentWeights(currClassId);
      const className = await fetchClassInfo(currClassId);
    
      const studentInfoPromises = studentIds.map((studentId: string) => fetchStudentInfo(studentId, weights, className));
      const students = await Promise.all(studentInfoPromises);
    
      setStudentList(students);
    }, [currClassId, fetchClassInfo, fetchStudentInfo]); // Updated dependencies
    

    useEffect(() => {
      fetchClasses();
    },[])

    useEffect(() => {
      fetchStudents();
    }, [currClassId, fetchStudents]);
    

    const handleSelectChange = (event: SelectChangeEvent<string>) => {
      const newValue = event.target.value;
      setCurrClassId(newValue);
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

