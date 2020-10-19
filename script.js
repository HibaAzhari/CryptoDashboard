// API access data
const coinGeckoApi = {
    url: 'https://api.coingecko.com/api/v3/coins'
}

const allCoins = [
    'bitcoin',
    'ethereum',
    'ripple',
    'litecoin',
    'tether',
    'monero',
    'eos',
    'tezos',
    'bitcoin-cash',
    'polkadot',
    'cardano',
    'stellar',
    'cosmos',
    'neo',
    'nem',
    'leo-token',
    'dai',
    'okb',
    'cdai',
    'wrapped-bitcoin'
]

// Retrieve presets from localStorage (if exists)
var favorites = (localStorage.getItem('favorites') === null ?
    [] : JSON.parse(localStorage.getItem('favorites')))
var currency = (localStorage.getItem('currency') === null ?
'usd' : localStorage.getItem('currency'))

// Update presets in localStorage
localStorage.setItem('favorites',JSON.stringify(favorites))
localStorage.setItem('currency',currency)

function fetchCoins(coinList) {
    coinData = []
    for(i = 0; i < coinList.length; i++){
        // Generate URL to access API data
        const coinUrl = `${coinGeckoApi.url}/${coinList[i]}?sparkline=true`
        // Fetch data, convert to JSON and add to local list
        fetch(coinUrl)
            .then( (data) => data.json())
            .then( (coin) => addCoin(coin))
    }
}

/*
* Generate function to display coins from list
*/
function displayCoins(coinList){
    return function() {
        // For each coin
        for(i = 0; i < coinList.length; i++){
            // Generate URL to access API data
            const coinUrl = `${coinGeckoApi.url}/${coinList[i]}?sparkline=true`
            // Fetch data, convert to JSON and add to table
            fetch(coinUrl)
                .then( (data) => data.json())
                .then( (coin) => addCoin(coin))
        }
    }
}

var displayAllCoins = displayCoins(allCoins)
var displayFavCoins = displayCoins(favorites)

/*
* Add a coin to html table
*/
const addCoin = (coinData) => {
    // Retrieve table
    const coinTable = document.querySelector('.table')
    // Create row
    let row = coinTable.insertRow()
    // Populate row
    addFavButton(row, coinData.id)
    addIcon(row, coinData.image.small)
    insertData(row, coinData)
    addSparkline(row, coinData.market_data.sparkline_7d.price)
}

/*
* Set up fav button for coin
*/
function addFavButton(row, id) {
    // Generate cell with fav button img
    let cell = addCell(row, "")
    let favicon = document.createElement('img')
    favicon.src = "res/fav.png"
    // Set opacity based on whether coin is favorited
    let opacity = 
        (JSON.parse(localStorage.getItem('favorites')).includes(id) ? 1:0.2)
    favicon.setAttribute("style","opacity: "+opacity)
    // Add listener to toggle favorite on click
    favicon.addEventListener('click', function(){
        let added = toggleFav(id)
        // Update opacity
        let opacity = (added ? '1':'0.2')
        favicon.setAttribute("style","opacity: "+opacity)
    })
    cell.appendChild(favicon)
}

/*
* Add coin icon from img source
*/
function addIcon(row, src) {
    let cell = addCell(row, "")
    let img = document.createElement('img')
    img.src = src
    img.setAttribute('style','width: 30px')
    cell.appendChild(img)
}

/*
* Insert coin data to table row
*/
function insertData(row, data) {
    let marketData = getMarketDataByCurrency(data.market_data)
    addCell(row, data.name)
    addCell(row, `(${data.symbol})`)
    addCell(row, marketData.symbol+marketData.price)
    addCell(row, marketData.symbol+marketData.volume)
}

/*
* Retrieve market data based on chosen currency
*/
function getMarketDataByCurrency(market_data) {
    // Initialize
    let marketData = { 
        price: '',
        volume: '',
        symbol: ''
    }
    // Check user preference
    currency = localStorage.getItem('currency')
    // Retrieve data accordingly
    switch(currency) {
        case 'myr':
            marketData.price = market_data.current_price.myr
            marketData.volume = market_data.total_volume.myr
            marketData.symbol = 'RM'
            break
        case 'btc':
            marketData.price = market_data.current_price.btc
            marketData.volume = market_data.total_volume.btc
            marketData.symbol = '[BTC]'
            break
        default:
            marketData.price = market_data.current_price.usd
            marketData.volume = market_data.total_volume.usd
            marketData.symbol = '$' 
    }
    return marketData
}

/*
* Generate sparkline from 7 day  price data
*/
function addSparkline(row, lineData) {
    // New cell
    let sparkline = addCell(row, "")
    // Set up container
    let container = document.createElement('div')
    sparkline.appendChild(container)
    container.setAttribute("id","line")
    container.setAttribute("style","height: 60px")
    // Generate chart
    chart = anychart.sparkline()
    chart.container("line")
    chart.stroke('orange')
    chart.data(lineData)
    chart.draw()
}

/*
* Add or remove coin from favorites
*/
const toggleFav = (id) => {
    // Retrieve list
    favorites = JSON.parse(localStorage.getItem('favorites'))
    let added = false
    // If coin not present
    if(!favorites.includes(id)) {
        // Add coin
        favorites.push(id)
        added = true
        console.log(id+' added to favorites')
    } else {
        // Remove coin
        index = favorites.indexOf(id)
        favorites.splice(index,1)
        console.log(id+' removed from favorites')
    }
    // Update storage
    localStorage.setItem('favorites',JSON.stringify(favorites))
    return added
}

/*
* Add cell to given table row with given value
*/
function addCell(tr, text) {
    let td = tr.insertCell()
    td.textContent = text
    return td;
}

/*
* Toggle preferences
*/
function setCurrency(cur) {
    localStorage.setItem('currency',cur)
    location.reload()
}

function clearPrefs() {
    favorites = []
    localStorage.clear()
    location.reload()
}
    