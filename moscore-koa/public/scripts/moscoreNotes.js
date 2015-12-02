// Icons:
// star
// note
// hide
// question mark

//In this file I adding the ability to add personalized notes, which get stored in localStorage


//Client-side script
//  unobtrusively render note abilities

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

function setNotes(identifer, notes) {
    if (!notes) {
        console.log("Removing");
        localStorage.removeItem("notes_" + identifer);
    } else {
        localStorage.setItem("notes_" + identifer, notes);
    }
}
function getNotes(identifer) {
    return localStorage.getItem("notes_" + identifer) || "";
}


function renderNoteControls(ele) {
    if (!__storageAvailable)
        return;

    var jele = $(ele);
    var ticker = jele.data('ticker');

    //var notesColumnHtml = "<span class='icon-pencil'></span>";
    //notesColumnHtml += "<span class='input notes' contenteditable>" + getNotes(ticker) + "</span>";

    var notesEditButton = $("<span class='icon-pencil smallerIcon'></span>");
    jele.append(notesEditButton);
    var loadedNotes = getNotes(ticker);
    var notesEntry = $("<div class='input notes' contenteditable>" + loadedNotes + "</div>");

    if (loadedNotes) {
        notesEditButton.hide();
        notesEntry.show();
    } else {
        notesEntry.hide();
    }

    //Events:
    notesEditButton.click(function() {
        notesEditButton.hide();
        notesEntry.show();
        notesEntry.focus();
    });
    notesEntry.on('input', function(e) {
        var text = notesEntry.text();
        console.log(ticker);
        setNotes(ticker, text);
    });
    notesEntry.on('blur', function(e) {
        //When focus is left
        var text = notesEntry.text();
        setNotes(ticker, text);

        if (!text) {
            notesEditButton.show();
            notesEntry.hide();
        }
    });
    jele.append(notesEntry);

    //jele.html(notesColumnHtml);
}


// addEvent( window, "load", function() {
//   var a = document.getElementsByTagName("*") || document.all;

//   for ( var i = 0; i < a.length; i++ )
//     if ( has( a[i].className, "notesHolder" ) )
//       renderNoteControls(a[i]);
// } );

//Using jquery to render
$(function () {
    $(".notesHolder").each(function (i, v) { renderNoteControls(v); });
});