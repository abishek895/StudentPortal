using Microsoft.AspNetCore.Mvc;
using StudentPortal.Entities.DTO;
using StudentPortal.Services.IServices;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestController : ControllerBase
{
    private readonly ILeaveRequestService _leaveRequestService;

    public LeaveRequestController(ILeaveRequestService leaveRequestService)
    {
        _leaveRequestService = leaveRequestService;
    }

    [HttpPost]
    public async Task<IActionResult> AddLeaveRequestAsync([FromBody] LeaveRequestDto leaveRequestDto)
    {
        if (leaveRequestDto == null)
        {
            return BadRequest("Leave request cannot be null.");
        }

        await _leaveRequestService.AddLeaveRequestAsync(leaveRequestDto);
        return Ok(leaveRequestDto);
    }

    [HttpGet("teacher")]
    public async Task<IActionResult> GetLeaveRequestsAsync()
    {
        var leaveRequests = await _leaveRequestService.GetLeaveRequestsAsync();
        return Ok(leaveRequests);
    }
    //HTTP LEAVe REQUEST

    [HttpGet("{id}")]
    public async Task<IActionResult> GetLeaveRequestStatusAsync(int id)
    {
        var leaveRequests = await _leaveRequestService.GetLeaveRequestsByStudentIdAsync(id);

        if (leaveRequests == null || !leaveRequests.Any())
        {
            return NotFound();
        }

        // Optionally, you can filter to get only the statuses if needed
        var leaveStatuses = leaveRequests.Select(lr => new
        {
            lr.From,
            lr.Till,
            lr.Status
        });

        return Ok(leaveStatuses);
    }




    [HttpGet("teacher/count")]
    public async Task<IActionResult> GetLeaveRequestCountForTeacher()
    {
        var count = await _leaveRequestService.GetPendingLeaveRequestCountAsync();
        return Ok(new { count });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLeaveRequestStatus(int id, [FromBody] string status)
    {
        var leaveRequest = await _leaveRequestService.GetLeaveRequestAsync(id);

        if (leaveRequest == null)
        {
            return NotFound("Leave request not found.");
        }

        await _leaveRequestService.UpdateLeaveRequestStatusAsync(id, status);

        return NoContent(); // Indicates successful update with no content
    }



    [HttpPost("{id}/approve")]
    public async Task<IActionResult> ApproveLeaveRequest(int id)
    {
        var leaveRequest = await _leaveRequestService.GetLeaveRequestAsync(id);

        if (leaveRequest == null)
        {
            return NotFound("Leave request not found.");
        }

        // Update the status to "Approved"
        await _leaveRequestService.UpdateLeaveRequestStatusAsync(id, "Approved");
        return NoContent(); // Indicate success with no content
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectLeaveRequest(int id)
    {
        var leaveRequest = await _leaveRequestService.GetLeaveRequestAsync(id);

        if (leaveRequest == null)
        {
            return NotFound("Leave request not found.");
        }

        // Update the status to "Rejected"
        await _leaveRequestService.UpdateLeaveRequestStatusAsync(id, "Rejected");
        return NoContent(); // Indicate success with no content
    }

}

