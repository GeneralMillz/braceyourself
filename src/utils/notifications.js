/**
 * @file notifications.js
 * @description UI notification system
 */

/**
 * Display a temporary notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - Type: 'info', 'success', 'error', 'warning'
 * @param {number} duration - How long to display (ms), default 3000
 */
export function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const header = document.querySelector('.app-header');
    if (header) {
        header.parentNode.insertBefore(notification, header.nextSibling);
    } else {
        document.body.prepend(notification);
    }

    setTimeout(() => {
        notification.remove();
    }, duration);
}
