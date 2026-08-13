import re

path = r'Frontend/src/services/adminApi.jsx'

with open(path, 'r') as f:
    content = f.read()

# Add updateUser method after updateUserStatus
new_method = '''  updateUser: async (userId, userData) => {
    try {
      const response = await adminApi.put(`/api/admin/users/${userId}`, userData);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update user' 
      };
    }
  },
'''

# Find the end of updateUserStatus block and insert after it
pattern = r"(updateUserStatus: async \(userId, statusData\) => \{[\s\S]*?^  \},)"
match = re.search(pattern, content, re.MULTILINE)
if match:
    insert_pos = match.end()
    content = content[:insert_pos] + '\n' + new_method + content[insert_pos:]
    print('Added updateUser method')
else:
    print('Could not find updateUserStatus block')

with open(path, 'w') as f:
    f.write(content)
