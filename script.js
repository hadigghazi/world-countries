const countriesContainer = document.querySelector('.countries');
const searchBtn = document.getElementById('searchBtn');
const countryInput = document.getElementById('countryInput');

const renderCountry = function (data, className = '') {
  const currency = data.currencies ? data.currencies[Object.keys(data.currencies)[0]].name : 'Unknown';

  const html = `
  <div class="country ${className}">
    <img class="country__img" src="${data.flags.svg}" />
    <div class="country__data">
      <h3 class="country__name">${data.name.common}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(1)} million people</p>
      <p class="country__row"><span>🗣️</span>${data.languages ? Object.values(data.languages)[0] : 'Unknown'}</p>
      <p class="country__row"><span>💰</span>${currency}</p>
    </div>
  </div>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
};

const getJSON = async function (url, errorMsg = 'Something went wrong') {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
  return response.json();
};

const getCountryData = async function (country) {
  try {
    countriesContainer.innerHTML = '';
    const data = await getJSON(`https://restcountries.com/v3.1/name/${country}`);
    renderCountry(data[0], 'original');

    const neighborCodes = data[0].borders;
    if (!neighborCodes || neighborCodes.length === 0) throw new Error('No neighbors found!');

    let limitedNeighbors;
    if (country.toLowerCase() === 'palestine') {
      limitedNeighbors = neighborCodes.slice(1, 3);
    } else {
      limitedNeighbors = neighborCodes.slice(0, 2);
    }

    for (const code of limitedNeighbors) {
      if (code === 'ISR') {
        const palestineData = await getJSON(`https://restcountries.com/v3.1/name/Palestine`);
        renderCountry(palestineData[0], 'neighbour');
      } else {
        const neighborData = await getJSON(`https://restcountries.com/v3.1/alpha/${code}`);
        renderCountry(neighborData[0], 'neighbour');
      }
    }
  } catch (err) {
    renderError(`${err.message}`);
  }
};

searchBtn.addEventListener('click', () => {
  const country = countryInput.value.trim();
  if (country) {
    getCountryData(country);
  }
});