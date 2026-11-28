const fs = require('fs')
const path = require('path')

function read(relative) {
  return fs.readFileSync(path.join(process.cwd(), relative), 'utf8')
}

describe('notification micro-interaction contract', () => {
  test('the canonical motion and design layers load from the root layout', () => {
    const layout = read('src/app/layout.jsx')
    expect(layout).toContain("import '../styles/motion.css'")
    expect(layout).toContain("import '../styles/design-constitution.css'")
  })

  test('the notification bell keeps its semantic button and accessible state', () => {
    const component = read('src/components/NotificationBell.jsx')
    expect(component).toContain('aria-expanded={isOpen}')
    expect(component).toContain('aria-controls="vi-notification-panel"')
    expect(component).toContain('className="vi-icon-button notification-bell-trigger"')
    expect(component).toContain('className="notification-bell-icon"')
  })

  test('notification rows enter progressively without replacing the list data contract', () => {
    const component = read('src/components/NotificationBell.jsx')
    expect(component).toContain('notifications.map((notif, index) => (')
    expect(component).toContain('className="vi-notification-item"')
    expect(component).toContain('animationDelay: `calc(var(--motion-stagger-step) * ${Math.min(index, 6)})`')
    expect(component).toContain('onClick={() => openNotification(notif)}')
  })

  test('bell, panel and rows use canonical timing and support reduced motion', () => {
    const motion = read('src/styles/motion.css')
    expect(motion).toContain('@keyframes vi-notification-bell-swing')
    expect(motion).toContain('50% { transform: rotate(8deg); }')
    expect(motion).toContain('vi-notification-bell-swing var(--motion-emphasis) var(--motion-ease)')
    expect(motion).toContain('animation: vi-notification-panel-enter var(--motion-standard) var(--motion-ease)')
    expect(motion).toContain('animation: vi-notification-item-enter var(--motion-standard) var(--motion-ease)')
    expect(motion).toContain('@media (prefers-reduced-motion: reduce)')
    expect(motion).toContain('.vi-notification-item')
  })
  test('interactive targets and notification rows meet the 48px steering-law standard', () => {
    const tokens = read('src/styles/design-constitution.css')
    expect(tokens).toContain('--vi-target-min: 48px')
    expect(tokens).toContain('width: 48px;')
    expect(tokens).toContain('height: 48px;')
    expect(tokens).toContain('.vi-notification-item { min-height: var(--vi-target-min); }')
  })

  test('opening the notification panel does not mark all items as read', () => {
    const component = read('src/components/NotificationBell.jsx')
    expect(component).toContain('const togglePanel = () => {')
    expect(component).toContain('onClick={togglePanel}')
    expect(component).toContain('if (!userId) {')
    expect(component).toContain('setLoading(false)')
    expect(component).not.toContain('if (unreadCount > 0) markAllAsRead()')
    expect(component.match(/if \(!res\.ok\)/g)).toHaveLength(3)
  })

})
