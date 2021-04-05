var current_page = 1;
var total_pages;
var images;
var fitCurrent = 'height';

let leftPage = () => {
  if (current_page - 1 >= 1) {
    current_page -= 1;
    document.getElementById('image').setAttribute('src', '/assets/' + images[current_page - 1]);
    document.getElementById('pageCounter').textContent = `${current_page}/${total_pages}`;
    window.scrollTo(0,0);
  }
}

let rightPage = () => {
  if (current_page + 1 <= total_pages) {
    current_page += 1;
    document.getElementById('image').setAttribute('src', '/assets/' + images[current_page - 1]);
    document.getElementById('pageCounter').textContent = `${current_page}/${total_pages}`;
    window.scrollTo(0,0);
  }
}

const invertPage = () => {
  [leftPage, rightPage] = [rightPage, leftPage];
}

const fitWidth = () => {
  fitCurrent = 'width';
  document.getElementById('image').style.width = '100%';
  document.getElementById('image').style.height = 'auto';
  document.getElementById('image').style.margin = '0';
}

const fitHeight = () => {
  fitCurrent = 'height';
  document.getElementById('image').style.width = 'auto';
  document.getElementById('image').style.height = '100%';
  document.getElementById('image').style.margin = 'auto';
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

  images.forEach(image => {
    var img = document.createElement('img');
    img.setAttribute('src', '/assets/' + image);
    document.getElementById('preload').appendChild(img);
  });

  var img = document.createElement('img');
  img.setAttribute('draggable', 'false');
  img.setAttribute('src', '/assets/' + images[0]);
  img.className = "imageView";
  img.id = `image`;
  img.style.width = 'auto';
  img.style.height = '100%';
  document.getElementById('pageView').appendChild(img);

  document.getElementById('titlebarText').innerHTML = manga_data[0].eng_title;
  document.getElementById('pageCounter').textContent = `${current_page}/${total_pages}`;
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