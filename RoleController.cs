using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentPortal.Entities.Models;
using StudentPortal.Services.IServices;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace StudentPortal.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        // GET: api/Role
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetRoles()
        {
            var roles = await _roleService.GetRolesAsync();
            return Ok(roles);
        }

        // GET: api/Role/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRole(int id)
        {
            var role = await _roleService.GetRoleAsync(id);

            if (role == null)
            {
                return NotFound();
            }

            return Ok(role);
        }

        // POST: api/Role
        [HttpPost]
        public async Task<ActionResult<Role>> CreateRole(Role role)
        {
            await _roleService.AddRoleAsync(role);
            return CreatedAtAction(nameof(GetRole), new { id = role.Roleid }, role);
        }

        // PUT: api/Role/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(int id, Role role)
        {
            if (id != role.Roleid)
            {
                return BadRequest();
            }

            try
            {
                await _roleService.UpdateRoleAsync(role);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await RoleExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // DELETE: api/Role/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            var role = await _roleService.GetRoleAsync(id);
            if (role == null)
            {
                return NotFound();
            }

            await _roleService.DeleteRoleAsync(id);
            return NoContent();
        }

        private async Task<bool> RoleExists(int id)
        {
            return await _roleService.RoleExistsAsync(id);
        }
    }
}
