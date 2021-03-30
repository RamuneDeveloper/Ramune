document.getElementById('new-manga-button').addEventListener('click', () => {
  if (!document.getElementById('manga-id').disabled) {
    document.getElementById('manga-id').style.backgroundColor = "#515151"
    document.getElementById('manga-id').disabled = true;
  } else {
    document.getElementById('manga-id').style.backgroundColor = "#fff"
    document.getElementById('manga-id').disabled = false;
  }
})