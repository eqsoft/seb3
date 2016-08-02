const	remote 		= require('electron').remote,
	seb 		= remote.require('./modules/seb.jsm');

const startURL = seb.config.startURL;

window.onload = onLoad;
window.onresize = doLayout;

var isLoading = false;
var webview = null;

function dq (expr) {
	return document.querySelector(expr);
}

function onLoad () {
	webview = dq('webview');
	doLayout();
	setEventHandler();
	webview.src = startURL;
}

function setEventHandler() {
	webview.addEventListener('close', handleExit);
	webview.addEventListener('did-start-loading', handleLoadStart);
	webview.addEventListener('did-stop-loading', handleLoadStop);
	webview.addEventListener('did-fail-load', handleLoadAbort);
	webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
	webview.addEventListener('did-finish-load', handleLoadCommit);

	dq('#back').onclick = function() {
		webview.goBack();
	};

	dq('#forward').onclick = function() {
		webview.goForward();
	};

	dq('#home').onclick = function() {
		navigateTo(startURL);
	};

	dq('#reload').onclick = function() {
		if (isLoading) {
			webview.stop();
		}
		else {
			webview.reload();
		}
	};

	dq('#reload').addEventListener( 'webkitAnimationIteration',
		function() {
			if (!isLoading) {
				document.body.classList.remove('loading');
			}
		});

	dq('#location-form').onsubmit = function(e) {
		e.preventDefault();
		navigateTo(dq('#location').value);
	};

	// Test for the presence of the experimental <webview> zoom and find APIs.
	if (typeof(webview.setZoom) == "function" && typeof(webview.find) == "function") {
		var findMatchCase = false;
		dq('#zoom').onclick = function() {
			if(dq('#zoom-box').style.display == '-webkit-flex') {closeZoomBox();
			}
			else {
				openZoomBox();
			}
		};

		dq('#zoom-form').onsubmit = function(e) {
			e.preventDefault();
			var zoomText = document.forms['zoom-form']['zoom-text'];
			var zoomFactor = Number(zoomText.value);
			if (zoomFactor > 5) {
				zoomText.value = "5";
				zoomFactor = 5;
			}
			else if (zoomFactor < 0.25) {
				zoomText.value = "0.25";
				zoomFactor = 0.25;
			}
			webview.setZoom(zoomFactor);
		}

		dq('#zoom-in').onclick = function(e) {
			e.preventDefault();
			increaseZoom();
		}

		dq('#zoom-out').onclick = function(e) {
			e.preventDefault();
			decreaseZoom();
		}

		dq('#find').onclick = function() {
			if(dq('#find-box').style.display == 'block') {
				dq('webview').stopFinding();
				closeFindBox();
			}
			else {
				openFindBox();
			}
		};

		dq('#find-text').oninput = function(e) {
			webview.find(document.forms['find-form']['find-text'].value,
			 {matchCase: findMatchCase});
		}

		dq('#find-text').onkeydown = function(e) {
			if (event.ctrlKey && event.keyCode == 13) {
				e.preventDefault();
				webview.stopFinding('activate');
				closeFindBox();
			}
		}

		dq('#match-case').onclick = function(e) {
			e.preventDefault();
			findMatchCase = !findMatchCase;
			var matchCase = dq('#match-case');
			if (findMatchCase) {
				matchCase.style.color = "blue";
				matchCase.style['font-weight'] = "bold";
			}
			else {
				matchCase.style.color = "black";
				matchCase.style['font-weight'] = "";
			}
			webview.find(document.forms['find-form']['find-text'].value, {matchCase: findMatchCase});
		}

		dq('#find-backward').onclick = function(e) {
			e.preventDefault();
			webview.find(document.forms['find-form']['find-text'].value,
			 {backward: true, matchCase: findMatchCase});
		}

		dq('#find-form').onsubmit = function(e) {
			e.preventDefault();
			webview.find(document.forms['find-form']['find-text'].value,
			 {matchCase: findMatchCase});
		}

		webview.addEventListener('findupdate', handleFindUpdate);
		window.addEventListener('keydown', handleKeyDown);
	}
	else {
		var zoom = dq('#zoom');
		var find = dq('#find');
		zoom.style.visibility = "hidden";
		zoom.style.position = "absolute";
		find.style.visibility = "hidden";
		find.style.position = "absolute";
	}
};

function navigateTo(url) {
	resetExitedState();
	dq('webview').src = url;
}

function doLayout() {
	var webview = dq('webview');
	var controls = dq('#controls');
	var controlsHeight = controls.offsetHeight;
	var windowWidth = document.documentElement.clientWidth;
	var windowHeight = document.documentElement.clientHeight;
	var webviewWidth = windowWidth;
	var webviewHeight = windowHeight - controlsHeight;

	webview.style.width = webviewWidth + 'px';
	webview.style.height = webviewHeight + 'px';

	var sadWebview = dq('#sad-webview');
	sadWebview.style.width = webviewWidth + 'px';
	sadWebview.style.height = webviewHeight * 2/3 + 'px';
	sadWebview.style.paddingTop = webviewHeight/3 + 'px';
}

function handleExit(event) {
	console.log(event.type);
	document.body.classList.add('exited');
	if (event.type == 'abnormal') {
		document.body.classList.add('crashed');
	} else if (event.type == 'killed') {
		document.body.classList.add('killed');
	}
}

function resetExitedState() {
	document.body.classList.remove('exited');
	document.body.classList.remove('crashed');
	document.body.classList.remove('killed');
}

function handleFindUpdate(event) {
	var findResults = dq('#find-results');
	if (event.searchText == "") {
		findResults.innerText = "";
	} else {
		findResults.innerText =
	event.activeMatchOrdinal + " of " + event.numberOfMatches;
	}

	// Ensure that the find box does not obscure the active match.
	if (event.finalUpdate && !event.canceled) {
		var findBox = dq('#find-box');
		findBox.style.left = "";
		findBox.style.opacity = "";
		var findBoxRect = findBox.getBoundingClientRect();
		if (findBoxObscuresActiveMatch(findBoxRect, event.selectionRect)) {
			// Move the find box out of the way if there is room on the screen, or
			// make it semi-transparent otherwise.
			var potentialLeft = event.selectionRect.left - findBoxRect.width - 10;
			if (potentialLeft >= 5) {
				findBox.style.left = potentialLeft + "px";
			} else {
				findBox.style.opacity = "0.5";
			}
		}
	}
}

function findBoxObscuresActiveMatch(findBoxRect, matchRect) {
	return findBoxRect.left < matchRect.left + matchRect.width &&
			findBoxRect.right > matchRect.left &&
			findBoxRect.top < matchRect.top + matchRect.height &&
			findBoxRect.bottom > matchRect.top;
}

function handleKeyDown(event) {
	if (event.ctrlKey) {
		switch (event.keyCode) {
			// Ctrl+F.
			case 70:
			event.preventDefault();
			openFindBox();
			break;

			// Ctrl++.
			case 107:
			case 187:
			event.preventDefault();
			increaseZoom();
			break;

			// Ctrl+-.
			case 109:
			case 189:
			event.preventDefault();
			decreaseZoom();
		}
	}
}

function handleLoadCommit() {
	resetExitedState();
	var webview = dq('webview');
	dq('#location').value = webview.getURL();
	dq('#back').disabled = !webview.canGoBack();
	dq('#forward').disabled = !webview.canGoForward();
	closeBoxes();
}

function handleLoadStart(event) {
	document.body.classList.add('loading');
	isLoading = true;

	resetExitedState();
	if (!event.isTopLevel) {
		return;
	}
	//dq('#location').value = event.url;
	dq('#location').value = event.url;
}

function handleLoadStop(event) {
	// We don't remove the loading class immediately, instead we let the animation
	// finish, so that the spinner doesn't jerkily reset back to the 0 position.
	isLoading = false;
}

function handleLoadAbort(event) {
	console.log('LoadAbort');
	console.log('	url: ' + event.url);
	console.log('	isTopLevel: ' + event.isTopLevel);
	console.log('	type: ' + event.type);
}

function handleLoadRedirect(event) {
	resetExitedState();
	dq('#location').value = event.newUrl;
}

function getNextPresetZoom(zoomFactor) {
	var preset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
		2.5, 3, 4, 5];
	var low = 0;
	var high = preset.length - 1;
	var mid;
	while (high - low > 1) {
		mid = Math.floor((high + low)/2);
		if (preset[mid] < zoomFactor) {
			low = mid;
		} else if (preset[mid] > zoomFactor) {
			high = mid;
		} else {
			return {low: preset[mid - 1], high: preset[mid + 1]};
		}
	}
	return {low: preset[low], high: preset[high]};
}

function increaseZoom() {
	var webview = dq('webview');
	webview.getZoom(function(zoomFactor) {
		var nextHigherZoom = getNextPresetZoom(zoomFactor).high;
		webview.setZoom(nextHigherZoom);
		document.forms['zoom-form']['zoom-text'].value = nextHigherZoom.toString();
	});
}

function decreaseZoom() {
	var webview = dq('webview');
	webview.getZoom(function(zoomFactor) {
		var nextLowerZoom = getNextPresetZoom(zoomFactor).low;
		webview.setZoom(nextLowerZoom);
		document.forms['zoom-form']['zoom-text'].value = nextLowerZoom.toString();
	});
}

function openZoomBox() {
	dq('webview').getZoom(function(zoomFactor) {
		var zoomText = document.forms['zoom-form']['zoom-text'];
		zoomText.value = Number(zoomFactor.toFixed(6)).toString();
		dq('#zoom-box').style.display = '-webkit-flex';
		zoomText.select();
	});
}

function closeZoomBox() {
	dq('#zoom-box').style.display = 'none';
}

function openFindBox() {
	dq('#find-box').style.display = 'block';
	document.forms['find-form']['find-text'].select();
}

function closeFindBox() {
	var findBox = dq('#find-box');
	findBox.style.display = 'none';
	findBox.style.left = "";
	findBox.style.opacity = "";
	dq('#find-results').innerText= "";
}

function closeBoxes() {
	closeZoomBox();
	closeFindBox();
}
