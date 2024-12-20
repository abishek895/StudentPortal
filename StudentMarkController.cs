using Microsoft.AspNetCore.Mvc;
using StudentPortal.Entities.DTO;
using StudentPortal.Services.IServices;

namespace StudentPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentMarkController : ControllerBase
    {
        private readonly IStudentMarkService _studentMarkService;

        public StudentMarkController(IStudentMarkService studentMarkService)
        {
            _studentMarkService = studentMarkService;
        }

        // GET: api/studentmark
        [HttpGet]
        public async Task<ActionResult<IEnumerable<StudentMarkDto>>> GetStudentMarks()
        {
            var marks = await _studentMarkService.GetStudentMarksAsync();
            return Ok(marks);
        }

        // GET: api/studentmark/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<StudentMarkDto>> GetStudentMark(int id)
        {
            var mark = await _studentMarkService.GetStudentMarkAsync(id);
            if (mark == null) return NotFound();
            return Ok(mark);
        }

        // POST: api/studentmark
        [HttpPost]
        public async Task<ActionResult> AddStudentMark(StudentMarkDto studentMarkDto)
        {
            await _studentMarkService.AddStudentMarkAsync(studentMarkDto);
            return CreatedAtAction(nameof(GetStudentMark), new { id = studentMarkDto.Id }, studentMarkDto);
        }

        // PUT: api/studentmark/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateStudentMark(int id, StudentMarkDto studentMarkDto)
        {
            await _studentMarkService.UpdateStudentMarkAsync(id, studentMarkDto);
            return NoContent();
        }

        // DELETE: api/studentmark/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteStudentMark(int id)
        {
            await _studentMarkService.DeleteStudentMarkAsync(id);
            return NoContent();
        }
    }
}
