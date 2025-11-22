// StockMaster - Main JavaScript

// Toast Notification System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Dialog Management
function openDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.classList.add('open');
  }
}

function closeDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.classList.remove('open');
  }
}

// Close dialog when clicking outside
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('dialog')) {
    e.target.classList.remove('open');
  }
});

// Logout Function
function logout() {
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
      if (window.innerWidth < 1024) {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.remove('open');
        }
      }
    });
  }
});

// Load Sidebar for Internal Pages
function loadSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const navItems = [
    { href: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Dashboard' },
    { href: 'products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Products' },
    { href: 'receipts', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', label: 'Receipts' },
    { href: 'deliveries', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z', label: 'Delivery Orders' },
    { href: 'adjustments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'Stock Adjustments' },
    { href: 'transfers', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Move History' },
    { href: 'settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', label: 'Settings' },
  ];

  let navHtml = '<div class="sidebar-header">';
  navHtml += '<div class="flex items-center gap-3">';
  navHtml += '<div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">';
  navHtml += '<svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
  navHtml += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />';
  navHtml += '</svg></div>';
  navHtml += '<div><h1 class="font-bold text-lg">StockMaster</h1>';
  navHtml += '<p class="text-xs text-muted-foreground">Inventory System</p></div>';
  navHtml += '</div></div>';
  
  navHtml += '<nav class="sidebar-nav">';
  navItems.forEach(item => {
    const isActive = activePage === item.href ? ' active' : '';
    navHtml += `<a href="${item.href}" class="nav-item${isActive}">`;
    navHtml += `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">`;
    navHtml += `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}" />`;
    navHtml += `</svg>${item.label}</a>`;
  });
  navHtml += '</nav>';

  navHtml += '<div class="sidebar-footer">';
  navHtml += '<a href="profile" class="nav-item">';
  navHtml += '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
  navHtml += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />';
  navHtml += '</svg>My Profile</a>';
  navHtml += '<button onclick="logout()" class="nav-item">';
  navHtml += '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">';
  navHtml += '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />';
  navHtml += '</svg>Logout</button>';
  navHtml += '</div>';

  sidebar.innerHTML = navHtml;
}