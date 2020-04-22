function initPage() {
    const inputEl = document.getElementById("city-input");

    const clearEl = document.getElementById("clear-history");

    let searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    console.log(searchHistory);


    const APIKey = "c9a9ed03a355403f4cb9a36e931c0b4a";
    //  When search button is clicked, read the city name typed by the user

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

    function getNextWeather(cityID) {
        //  Using saved city name, execute a 5-day forecast get request from open weather map api
        let forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + APIKey + "&cnt=5" + "&units=metric";
        axios.get(forecastQueryURL)
            .then(function (response) {
                for (i = 0; i < 5; i++) {


                    const forecastWeatherEl = document.createElement("img");
                    forecastWeatherEl.setAttribute("src", "https://openweathermap.org/img/wn/" + response.data.list[i].weather[0].icon + "@2x.png");
                    forecastWeatherEl.setAttribute("alt", response.data.list[i].weather[0].description);
                    forecastEls[i].append(forecastWeatherEl);
                    const forecastTempEl = document.createElement("p");
                    forecastTempEl.innerHTML = "Temp: " + roundNum((response.data.list[i].main.temp) - 273.15) + " &#176F";
                    forecastEls[i].append(forecastTempEl);
                    const forecastHumidityEl = document.createElement("p");
                    forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[i].main.humidity + "%";
                    forecastEls[i].append(forecastHumidityEl);
                }
            })
    }

    function getWeather() {
        var cityName = searchHistory[searchHistory.length - 1];
        //  Using saved city name, execute a current condition get request from open weather map api
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey + "&units=metric";
        axios.get(queryURL)
            .then(function (response) {
                $('#todayTitle').text(cityName + ', ' + moment().format("MMMM Do"));
                $('#todayTemp').text(roundNum(response.data.main.temp));
                $('#todayHum').text(response.data.main.humidity);
                $('#todayWind').text(roundNum(response.data.wind.speed));
                let lat = response.data.coord.lat;
                let lon = response.data.coord.lon;
                getUVindex(lat, lon);
                var todayImgSrc = `https://openweathermap.org/img/wn/` + response.data.weather[0].icon + `@2x.png`
                $('#todayImg').attr({ src: todayImgSrc, alt: response.data.weather[0].main });
                let cityID = response.data.id;
                getNextWeather(cityID);
            });
    }

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


    $('input').pressEnter(function () {
        const searchTerm = inputEl.value;
        getWeather(searchTerm);
        searchHistory.push(searchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

    clearEl.addEventListener("click", function () {
        searchHistory = [];
        renderSearchHistory();
    })

    function roundNum(Num) {
        return (Math.round((Num + Number.EPSILON) * 10) / 10);
    }

    function renderSearchHistory() {
        for (let i = 0; i < searchHistory.length; i++) {
            console.log(searchHistory[i]);
            const historyItem = `<a class="btn btn-neutral btn-block py-2" onclick="getWeather();">` + searchHistory[i] + `</a>`
            $('#historyList').append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }


    //  Save user's search requests and display them underneath search form
    //  When page loads, automatically generate current conditions and 5-day forecast for the last city the user searched for

}

function generatePage() {
    var nextWeatherCard = `
    <div class="col forecast text-center" id="nextDay">
        <h4 class="card-title">Day</h4>
        <img class="card-img-top p-2" src="assets/img/iconPlaceholder.png" alt="Weather placeholder">
        <p> T: <strong><span id="nextTemp"></span>°C</strong></p>
        <p> H: <strong><span id="nextHum"></span>%</strong></p>
    </div>
    `
    for (i = 0; i < 5; i++) {
        $('#nextWeather').append(nextWeatherCard);
        $('#nextDay').attr({ id: 'nextDay' + i })
    }
}

generatePage();

$(function () {
    initPage();
})

