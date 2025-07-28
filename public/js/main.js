// public/js/main.js
// You can add client-side JavaScript here for interactive features,
// like form validation feedback, dynamic content loading, etc.

document.addEventListener('DOMContentLoaded', () => {
    // Example: Automatically hide flash messages after a few seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.transition = 'opacity 0.5s ease-out';
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 500); // Remove after transition
        }, 3000); // Hide after 3 seconds
    });
});

