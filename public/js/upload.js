document.getElementById('new-manga-button').addEventListener('click', () => {
  if (!document.getElementById('manga-id').disabled) {
    document.getElementById('manga-id').style.backgroundColor = "#515151"
    document.getElementById('manga-id').disabled = true;
  } else {
    document.getElementById('manga-id').style.backgroundColor = "#fff"
    document.getElementById('manga-id').disabled = false;
  }
})

const mangaInput = document.getElementById('manga-id');
const awesomplete = new Awesomplete(mangaInput, {
  filter: () => true,
  sort: false,
  list: []
});
mangaInput.addEventListener('input', (event) => {
  const inputText = event.target.value;
  fetch(`/api/autocomplete?q=${inputText}`)
    .then(res => res.json())
    .then(json => {
      awesomplete.list = json;
      awesomplete.evaluate();
    })
});