//Lets play with localstorage
var __storageAvailable = storageAvailable('localStorage');
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
}


var __favorites = null;
function getFavorites() {
    if (!__storageAvailable) return [];

    if (__favorites != null) return __favorites;

    return __favorites = JSON.parse(localStorage.getItem("savedStocks")) || [];
}
function saveFavorites() {
    localStorage.setItem("savedStocks", JSON.stringify(__favorites));
    saveTimeout = null;
    console.log("Favorite stocks saved to localStorage");
}
function isFavorite(ticker) {
    return !!~getFavorites().indexOf(ticker);
}


var saveTimeout = null;
function toggleFavorite(ele, ticker) {
    if (isFavorite(ticker)) {
        var index = getFavorites().indexOf(ticker);
        __favorites.splice(index, 1);
        setCheckboxAsFavorite(ele, false);
    } else {
        __favorites.push(ticker);
        setCheckboxAsFavorite(ele, true);
    }
    if (saveTimeout != null) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveFavorites, 2000);

    //console.log("Favorite stocks is now: " + __favorites);
}
function setCheckboxAsFavorite(checkbox, isFavorite) {
    var rowElement = checkbox.parentNode.parentNode;

    rowElement.dataset.favorite = isFavorite;
    checkbox.checked = isFavorite;
}


function loadMoscoreFavorite(checkbox) {
    if (!__storageAvailable) {
        checkbox.disabled = true;
    } else {
        var rowElement = checkbox.parentNode.parentNode;

        var tickerSymbol = rowElement.dataset.ticker;

        checkbox.onclick = function() { toggleFavorite(this, rowElement.dataset.ticker) };

        if (isFavorite(tickerSymbol)) {
            setCheckboxAsFavorite(checkbox, true);
        }
    }
}


addEvent( window, "load", function() {
  var a = document.getElementsByTagName("*") || document.all;

  for ( var i = 0; i < a.length; i++ )
    if ( has( a[i].className, "moscore_toggle" ) )
      loadMoscoreFavorite(a[i]);
} );
