========================================
FORDIPS TECH - How to Start Local Server
========================================

OPTION 1: Double-Click the Batch File (Easiest!)
-------------------------------------------------
1. Double-click "START_SERVER.bat"
2. A window will open with the server running
3. Open your browser to: http://localhost:3000
4. To stop: Close the command window

OPTION 2: Use Command Line
---------------------------
1. Open Command Prompt (cmd)
2. Navigate to this folder:
   cd D:\Projects\Figma\outputs\websites\fordips-tech

3. Run:
   python -m http.server 3000

4. Open browser to: http://localhost:3000
5. To stop: Press Ctrl+C

OPTION 3: Use PowerShell
-------------------------
1. Open PowerShell
2. Navigate to this folder:
   cd D:\Projects\Figma\outputs\websites\fordips-tech

3. Run:
   python -m http.server 3000

4. Open browser to: http://localhost:3000
5. To stop: Press Ctrl+C

========================================
ACCESS URLS
========================================

On Your Computer:
  Homepage:     http://localhost:3000
  Admin Panel:  http://localhost:3000/admin.html
  My Account:   http://localhost:3000/my-account.html

On Your Phone (same WiFi):
  Homepage:     http://10.0.0.107:3000
  Admin Panel:  http://10.0.0.107:3000/admin.html

========================================
ADMIN SETUP
========================================

1. Sign up at: http://localhost:3000/my-account.html
   Email: brineketum@gmail.com

2. Go to Supabase:
   https://supabase.com/dashboard/project/loutcbvftzojsioahtdw

3. SQL Editor → New Query → Run this:

   UPDATE profiles
   SET is_admin = true
   WHERE email = 'brineketum@gmail.com';

4. Access admin panel:
   http://localhost:3000/admin.html

========================================
TROUBLESHOOTING
========================================

Port Already in Use:
  - Try a different port: python -m http.server 8888
  - Or kill existing servers: taskkill /F /IM python.exe

Can't Access on Phone:
  - Make sure phone is on same WiFi
  - Check Windows Firewall settings
  - Try: http://10.0.0.107:3000

========================================
