using Microsoft.AspNetCore.Mvc;
using StudentPortal.Entities.DTO;
using StudentPortal.Services.IServices;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.EntityFrameworkCore;

namespace StudentPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;

        public StudentsController(IStudentService studentService)
        {
            _studentService = studentService;
        }

        // GET: api/students
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentDto>>> GetStudents()
        {
            try
            {
                var students = await _studentService.GetStudentsAsync();
                return Ok(students);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/students/{id}

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentDto>> GetStudent(int id)
        {
            try
            {
                var student = await _studentService.GetStudentAsync(id);
                if (student == null)
                {
                    return NotFound();
                }
                return Ok(student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/students
        [HttpPost]
        public async Task<ActionResult<StudentDto>> PostStudent(StudentDto student)
        {
            if (student == null)
            {
                return BadRequest("Student data is null");
            }

            try
            {
                await _studentService.AddStudentAsync(student);
                return CreatedAtAction(nameof(GetStudent), new { id = student.Id }, student);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        // POST: api/students/send-email
        [HttpPost("send-email")]
        public async Task<IActionResult> SendMarksEmailAsync(StudentDto student)
        {
            Console.WriteLine($"Received payload: {JsonConvert.SerializeObject(student)}");

            if (student == null)
            {
                return BadRequest("Student data is null.");
            }

            if (student.Id <= 0) // Ensure that a valid ID is provided
            {
                return BadRequest("Invalid student ID.");
            }

            if (student.StudentMarks == null || !student.StudentMarks.Any())
            {
                return BadRequest("No marks available for this student.");
            }

            // Fetch the student email from the database using the provided ID
            var existingStudent = await _studentService.GetStudentByIdAsync(student.Id);
            if (existingStudent == null)
            {
                return NotFound($"Student with ID {student.Id} not found.");
            }

            // Prepare the student marks with email
            var email = existingStudent.Email;

            try
            {
                await _studentService.SendMarksEmailAsync(email, student);
                return Ok(new { message = "Email sent successfully!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/students/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> PutStudent(int id, StudentDto studentDto)
        {
            // Log incoming data
            Console.WriteLine($"Received StudentDto: {JsonConvert.SerializeObject(studentDto)}");

            if (id != studentDto.Id)
            {
                return BadRequest("Student ID mismatch");
            }

            try
            {
                await _studentService.UpdateStudentAsync(id, studentDto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        //dummy
        [HttpPut("{id}/details")]
        public async Task<ActionResult> PutStudentDetails(int id, StudentDto studentDto)
        {
            // Log incoming data
            Console.WriteLine($"Received StudentDto: {JsonConvert.SerializeObject(studentDto)}");

            if (id != studentDto.Id)
            {
                return BadRequest("Student ID mismatch");
            }

            try
            {
                await _studentService.UpdateStudentAsync(id, studentDto);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            try
            {
                var loginResponse = await _studentService.LoginAsync(loginDto);
                return Ok(loginResponse); // Return the anonymous object as the response
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Handle errors appropriately
            }
        }



        // DELETE: api/students/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            try
            {
                await _studentService.ToggleDeleteStudentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
