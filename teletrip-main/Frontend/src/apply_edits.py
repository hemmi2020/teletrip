import re

path = r'C:\wamp64\www\telitrip\teletrip\teletrip-main\Frontend\src\AdminDashboard.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Edit 2: Add PayOnSiteManagement import after DestinationManagement
old_import = "import DestinationManagement from './components/DestinationManagement';\nimport './styles/admin-responsive.css';"
new_import = "import DestinationManagement from './components/DestinationManagement';\nimport PayOnSiteManagement from './components/PayOnSiteManagement';\nimport './styles/admin-responsive.css';"

if old_import not in content:
    print("ERROR: Could not find DestinationManagement import block")
    exit(1)

content = content.replace(old_import, new_import, 1)

# Edit 3: Add menu item after payments
old_menu = "    { id: 'payments', label: 'Payments', icon: CreditCard },\n    { id: 'support', label: 'Support', icon: MessageSquare },"
new_menu = "    { id: 'payments', label: 'Payments', icon: CreditCard },\n    { id: 'pay-on-site', label: 'Pay on Site', icon: Building2 },\n    { id: 'support', label: 'Support', icon: MessageSquare },"

if old_menu not in content:
    print("ERROR: Could not find menuItems block")
    exit(1)

content = content.replace(old_menu, new_menu, 1)

# Edit 4: Add renderContent case before fallback
old_render = "    }\n\n    // Render data tables for other tabs\n    return ("
# Need to be more specific because there are multiple "}\n\n    // Render..."
# Let's use the context around the overview block
old_render = """          <ActivityFeed activities={activities} loading={false} />
        </div>
      );
    }

    // Render data tables for other tabs
    return ("""
new_render = """          <ActivityFeed activities={activities} loading={false} />
        </div>
      );
    }

    if (activeTab === 'pay-on-site') {
      return <PayOnSiteManagement showToast={showToast} />;
    }

    // Render data tables for other tabs
    return ("""

if old_render not in content:
    print("ERROR: Could not find renderContent fallback block")
    exit(1)

content = content.replace(old_render, new_render, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("All edits applied successfully")
