var current_page = 1;
var total_pages;
var images;
var fitCurrent = 'height';
var atEnd = false;

const loadPage = () => {
  for(let i = 1; i <= total_pages; i++){
    document.getElementById(`image${i}`).style.visibility = "hidden";
  }
  document.getElementById(`image${current_page}`).style.visibility = 'visible';
  document.getElementById('pageCounter').textContent = `${current_page}/${total_pages}`;
}
let leftPage = () => {
  if (atEnd) {
    atEnd = false;
    document.getElementById(`image${total_pages}`).style.visibility = 'visible';
    document.getElementById(`endView`).style.visibility = 'hidden';
  } else {
    if (current_page - 1 >= 1) {
      current_page -= 1;
      window.scrollTo(0,0);
      loadPage();
    }
  }
}

let rightPage = () => {
  if (current_page + 1 <= total_pages) {
    current_page += 1;
    window.scrollTo(0,0);
    loadPage();
  } else {
    if (!atEnd) {
      atEnd = true;
      document.getElementById(`image${total_pages}`).style.visibility = 'hidden';
      document.getElementById(`endView`).style.visibility = 'visible';
    }
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
document.getElementById("endView").style.visibility = "hidden";

document.getElementById("titlebarContainer").addEventListener("mouseenter", function () {
  document.getElementById("titlebar").style.visibility = "visible";
});

document.getElementById("titlebarContainer").addEventListener("mouseleave", function () {
  document.getElementById("titlebar").style.visibility = "hidden";
});

(async () => {
  const release_data = await (await fetch('/api/release/' + document.getElementsByName('id')[0].content)).json();
  const all_release_data = await (await fetch('/api/manga/' + release_data[0].manga_id + '/releases')).json();
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

  all_release_data.forEach(release => {
    document.getElementById('endSelect').innerHTML += `
      <option value="${release.id}" ${release.id === release_data[0].id ? 'selected' : ''}>
        ${release.volume_id && release.volume_id > 0 ? `Vol. ${release.volume_id} ` : ''}Ch. ${release.chapter_id}
      </option>
    `
  })
  
  const results_above_current_chapter = all_release_data.filter(x => x.volume_id === release_data[0].volume_id && x.chapter_id > release_data[0].chapter_id);
  if (results_above_current_chapter.length) {
    document.getElementById('endView').innerHTML += `
      <br>
      <a href="/release/${results_above_current_chapter[0].id}">Next chapter</a>
    `
  } else {
    const results_above_current_volume = all_release_data.filter(x => x.volume_id > release_data[0].volume_id);
    if (results_above_current_volume.length) {
      document.getElementById('endView').innerHTML += `
        <br>
        <a href="/release/${results_above_current_volume[0].id}">Next volume</a>
      `
    }
  }

  document.getElementById("endSelect").addEventListener('change', function () {
    window.location = '/release/' + document.getElementById("endSelect").value;
  });
})()