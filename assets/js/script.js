// VARIABLES
const APIKey = "c9a9ed03a355403f4cb9a36e931c0b4a";

// FUNCTIONS

// Get and display the current UV index for the current search
function getUVindex(lat, lon) {
    let UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey + "&cnt=1";
    axios.get(UVQueryURL)
        .then(function (response) {
            var uvVal = response.data[0].value;
            var todayUV = $('#todayUV');
            todayUV.text(uvVal);
            $(todayUV).attr('class', 'badge mb-0')
            if (uvVal > 0 && uvVal <= 2) {
                $(todayUV).addClass('badge-info');
            }
            else if (uvVal > 2 && uvVal <= 5) {
                $(todayUV).addClass('badge-success');
            }
            else if (uvVal > 5 && uvVal <= 7) {
                $(todayUV).addClass('badge-warning');
            }
            else if (uvVal > 7 && uvVal <= 10) {
                $(todayUV).addClass('badge-primary');
            }
            else if (uvVal > 10) {
                $(todayUV).addClass('badge-danger');
            }
        });
}

// Get and display the weather forecast for 5 days for the current search
function getNextWeather(cityID) {
    let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&cnt=5" + "&units=metric" + "&appid=" + APIKey;
    axios.get(forecastQueryURL)
        .then(function (response) {
            for (i = 0; i < 5; i++) {
                $('#nextWeather').addClass('text-dark');
                $('#nextDay' + i).text(parseInt(moment().format("DD")) + i + "/" + moment().format("MM"));
                var nextImgSrc = "https://openweathermap.org/img/wn/" + response.data.list[i].weather[0].icon + "@2x.png";
                $('#nextImg' + i).attr({ src: nextImgSrc, alt: response.data.list[i].weather[0].description });
                $('#nextTemp' + i).text(roundNum(response.data.list[i].main.temp, 1));
                $('#nextHum' + i).text(roundNum(response.data.list[i].main.humidity, 1));
            }
        })
}

// Get and display the current weather for the current search
function getWeather(cityName) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric" + "&appid=" + APIKey;
    axios.get(queryURL)
        .then(function (response) {
            $('#today').addClass('text-dark');
            $('#todayTitle').text(cityName + ', ' + moment().format("MMMM Do"));
            $('#todayTemp').text(roundNum(response.data.main.temp, 10));
            $('#todayHum').text(response.data.main.humidity);
            $('#todayWind').text(roundNum(response.data.wind.speed, 10));
            let lat = response.data.coord.lat;
            let lon = response.data.coord.lon;
            getUVindex(lat, lon);
            var todayImgSrc = `https://openweathermap.org/img/wn/` + response.data.weather[0].icon + `@2x.png`
            $('#todayImg').attr({ src: todayImgSrc, alt: response.data.weather[0].main });
            let cityID = response.data.id;
            getNextWeather(cityID);
        });
}

// Check for localStorage and input, choose one that isn't empty (priority on input), and parse its value to displaying functions
function displayInfo(cityName) {
    searchHistoryArray = localStorage.getItem('searchHistory');

    // If local storage is empty, create empty array
    searchHistoryArray = searchHistoryArray ? searchHistoryArray.split(',') : [];
    if (cityName != '') {
        searchHistoryArray.unshift(cityName);
        if (searchHistoryArray.length > 10) {
            searchHistoryArray.splice(10, searchHistoryArray.length - 10)
        }
        localStorage.setItem('searchHistory', searchHistoryArray);
        isInputUsed = true;
    }
    else if (cityName == '' && searchHistoryArray != '') {
        cityName = searchHistoryArray[0];
    }
    else {
        $('#alert').attr({ class: 'visible alert alert-info mb-0' })
        return
    }
    renderSearchHistory(searchHistoryArray, cityName);
    getWeather(cityName);
    $('#cityName').val('');
}

// Check for pressed enter on input
$.fn.pressEnter = function (fn) {
    return this.each(function () {
        $(this).bind('enterPress', fn);
        $(this).keyup(function (e) {
            if (e.keyCode == 13) {
                $(this).trigger("enterPress");
            }
        })
    });
};

// Check if new entry is empty
function checkNewEntry() {
    let cityName = $('#cityName').val();
    if (cityName != '') {
        displayInfo(cityName)
    }
}

// Round decimals to  n significant points
function roundNum(Num, n) {
    return (Math.round((Num) * n) / n);
}

// Render search history
function renderSearchHistory(searchHistoryArray) {
    $('#historyList').html('');
    for (i = 0; i < searchHistoryArray.length; i++) {
        const lastSearch = `<a class="btn btn-neutral btn-block py-2" onclick="displayInfo('` + searchHistoryArray[i] + `')">` + searchHistoryArray[i] + `</a>`
        $('#historyList').append(lastSearch);
    }
}

// Clear search history
function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    $('#historyList').html('');
}

// On input enter, start checkNewEntry
$('input').pressEnter(function () {
    checkNewEntry();
})

// On search button click, start checkNewEntry
$('#searchBtn').click(function () {
    checkNewEntry();
});

// On clear button click, start clearSearchHistory
$('#clearBtn').click(function () {
    localStorage.removeItem('searchHistory');
    $('#historyList').html('');
})

// Generate panels for next days
function generatePage() {
    var nextWeatherCard = `
    <div class="col forecast text-center px-0">
        <h4 class="card-title" id="nextDay">Day</h4>
        <img class="card-img-top p-2" id="nextImg" src="assets/img/iconPlaceholder.png" alt="Weather placeholder">
        <p> T: <strong><span id="nextTemp"></span>°C</strong></p>
        <p> H: <strong><span id="nextHum"></span>%</strong></p>
    </div>
    `
    for (i = 0; i < 5; i++) {
        $('#nextWeather').append(nextWeatherCard);
        $('#nextDay').attr({ id: 'nextDay' + i });
        $('#nextImg').attr({ id: 'nextImg' + i });
        $('#nextTemp').attr({ id: 'nextTemp' + i });
        $('#nextHum').attr({ id: 'nextHum' + i });
    }
}

// Run generatePage before document is loaded to speend up page generation
generatePage();

// Start when document is ready
$(function () {
    displayInfo('');
})

