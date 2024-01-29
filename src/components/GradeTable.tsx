/**
 * You might find it useful to have some dummy data for your own testing.
 * Feel free to write this function if you find that feature desirable.
 * 
 * When you come to office hours for help, we will ask you if you have written
 * this function and tested your project using it.
 */
import { Table,TableHead,TableBody,TableRow,TableContainer,TableCell } from "@mui/material";
import { IStudent } from "../types/api_types";

export function dummyData() {
  return [];
}



/**
 * This is the component where you should write the code for displaying the
 * the table of grades.
 *
 * You might need to change the signature of this function.
 *
 */


export const GradeTable = ({list}:{list:IStudent[]}) => {

  return <TableContainer>
  <Table sx={{ minWidth: 650 }} aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell>Student ID</TableCell>
        <TableCell align="left">Student Name</TableCell>
        <TableCell align="left">Class ID</TableCell>
        <TableCell align="left">Class Name</TableCell>
        <TableCell align="left">Semester</TableCell>
        <TableCell align="left">Grade</TableCell>

      </TableRow>
    </TableHead>
    <TableBody>
      {list.map((s:IStudent) => (
        <TableRow key={s.studentId}>
          <TableCell>{s.studentId}</TableCell>
          <TableCell>{s.studentName}</TableCell>
          <TableCell>{s.classId}</TableCell>
          <TableCell>{s.className}</TableCell>
          <TableCell>{s.semester}</TableCell>
          <TableCell>{s.grade}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  </TableContainer>
};
