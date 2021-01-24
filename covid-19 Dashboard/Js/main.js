//menu responsive
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "sideBar") {
      x.className += " responsive";
    } else {
      x.className = "sideBar";
    }
  } 