var navToggle = document.getElementById('menu_for_mobile');
var navbarMenu = document.querySelector('.list');



function toggleNav() {
  
    var navbarunchecked = document.querySelector('.navbar-unchecked');
  if (navToggle.checked) { 
    if(navbarunchecked != null){
        navbarMenu.classList.remove('navbar-unchecked')
    }

    navbarMenu.classList.add('navbar-expanded');
    

  } else {
   

      navbarMenu.classList.remove('navbar-expanded');
      navbarMenu.classList.add('navbar-unchecked');
    
     
    
  }}