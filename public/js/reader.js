var current_page = 1;
var total_pages;
var images;
var fitCurrent = 'height';

const loadPage = () => {
  for(let i = 1; i <= total_pages; i++){
    document.getElementById(`image${i}`).style.visibility = "hidden";
  }
  document.getElementById(`image${current_page}`).style.visibility = 'visible';
  document.getElementById('pageCounter').textContent = `${current_page}/${total_pages}`;
}
let leftPage = () => {
  if (current_page - 1 >= 1) {
    current_page -= 1;
    window.scrollTo(0,0);
    loadPage();
  }
}

let rightPage = () => {
  if (current_page + 1 <= total_pages) {
    current_page += 1;
    window.scrollTo(0,0);
    loadPage();
  }
}

const invertPage = () => {
  [leftPage, rightPage] = [rightPage, leftPage];
}

const fitWidth = () => {
  fitCurrent = 'width';
  for(let i = 1; i <= total_pages; i++) {
    document.getElementById(`image${i}`).style.maxWidth = '100%';
    document.getElementById(`image${i}`).style.height = 'auto';
  }
}

const fitHeight = () => {
  fitCurrent = 'height';
  for(let i = 1; i <= total_pages; i++) {
    document.getElementById(`image${i}`).style.maxWidth = null;
    document.getElementById(`image${i}`).style.height = '100%';
  }
}

document.getElementById("fitButton").addEventListener("click", function (e) {
  if (fitCurrent == "height") {
    fitWidth();
  } else{
    fitHeight();
  }
});

document.addEventListener("keydown", function (e) {
  e = e || window.event;
  switch (e.keyCode) {
      case 32:
      case 39:
      case 76:
        rightPage();
        break;
      case 37:
      case 72:
        leftPage();
        break;
      default: return;
  }
  e.preventDefault();
});

document.getElementById("invertButton").addEventListener("click", function (e) {
  invertPage();
});

document.getElementById("pageLeft").addEventListener("click", function (e) {
  leftPage()
});

document.getElementById("pageRight").addEventListener("click", function (e) {
  rightPage()
});

document.getElementById("titlebar").style.visibility = "hidden";

document.getElementById("titlebarContainer").addEventListener("mouseenter", function () {
  document.getElementById("titlebar").style.visibility = "visible";
});

document.getElementById("titlebarContainer").addEventListener("mouseleave", function () {
  document.getElementById("titlebar").style.visibility = "hidden";
});

(async () => {
  const release_data = await (await fetch('/api/release/' + document.getElementsByName('id')[0].content)).json();
  const manga_data = await (await fetch('/api/manga/' + release_data[0].manga_id)).json();

  images = release_data[0].images;
  total_pages = images.length

  images.forEach((image, i) => {
    var img = document.createElement('img');
    img.setAttribute('draggable', 'false');
    img.setAttribute('src', '/assets/' + image);
    img.className = "imageView";
    img.id = `image${i + 1}`;
    img.style.visibility = 'hidden';
    img.style.maxWidth = null;
    img.style.height = '100%';
    document.getElementById('pageView').appendChild(img);
  });

  document.getElementById('titlebarText').innerHTML = manga_data[0].eng_title;
  document.getElementById('pageCounter').textContent = `${current_page}/${total_pages}`;
  document.getElementById(`image1`).style.visibility = "visible";
  // let images = release_data[0].images;
  // images.sort();
  // total_pages = images.length
  // images.forEach((image, i) => {
  //   var img = document.createElement('img');
  //   img.setAttribute('draggable', 'false');
  //   img.setAttribute('src', '/assets/' + image);
  //   img.className = "imageView";
  //   img.id = `image${i}`;
  //   // img.style.visibility = 'hidden';
  //   img.style.width = 'auto';
  //   img.style.height = '100%';
  //   document.getElementById('pageView').appendChild(img);
  // });

  // if (images.length) {
  //   // layoutSingle();
  //   // fitHeight();
  //   // loadPage();
  // } else {
  //   console.log("no pages to load");
  // }
})()