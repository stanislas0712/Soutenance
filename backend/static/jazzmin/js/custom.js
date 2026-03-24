document.addEventListener('DOMContentLoaded', function () {
  var photoUrl = window.CURRENT_USER_PHOTO;
  if (!photoUrl) return;

  /* Remplace l'icône fa-user par la vraie photo dans la navbar */
  var userDropdown = document.getElementById('jazzy-usermenu');
  if (!userDropdown) return;

  var triggerLink = userDropdown.closest('.nav-item').querySelector('a.nav-link');
  if (!triggerLink) return;

  triggerLink.id = 'jazzy-usermenu-trigger';
  triggerLink.innerHTML =
    '<img src="' + photoUrl + '" alt="Photo profil" ' +
    'style="width:34px;height:34px;border-radius:50%;object-fit:cover;' +
    'border:2px solid rgba(255,255,255,.55);display:block;">';
});
