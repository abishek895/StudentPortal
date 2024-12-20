using Microsoft.AspNetCore.Mvc;
using StudentPortal.Entities.DTO;
using StudentPortal.Services;
using StudentPortal.Services.IServices;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SemesterController : ControllerBase
    {
        private readonly ISemesterService _semesterService;

        public SemesterController(ISemesterService semesterService)
        {
            _semesterService = semesterService;
        }

        [HttpGet]
        public async Task<ActionResult<List<SemesterDto>>> GetAllSemesters()
        {
            var semesters = await _semesterService.GetAllSemestersAsync();
            return Ok(semesters);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SemesterDto>> GetSemesterById(int id)
        {
            var semester = await _semesterService.GetSemesterByIdAsync(id);
            if (semester == null) return NotFound();
            return Ok(semester);
        }

        [HttpPost]
        public async Task<ActionResult> AddSemester(SemesterDto semesterDto)
        {
            await _semesterService.AddSemesterAsync(semesterDto);
            return CreatedAtAction(nameof(GetSemesterById), new { id = semesterDto.Semid }, semesterDto);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateSemester(int id, SemesterDto semesterDto)
        {
            await _semesterService.UpdateSemesterAsync(id, semesterDto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSemester(int id)
        {
            await _semesterService.DeleteSemesterAsync(id);
            return NoContent();
        }
    }
}
