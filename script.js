const inpFile = document.getElementById("fileInput"),
	btnUpload = document.getElementById("btnUpload"),
	canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d');

var currentEditedImageFileName,
	imageObjGlobal,
	canvasGetDefaultUriState = {},
	crop_initated = false, // this variable still now in experimental state
	isFlipUIActionTriggered = false,
	isCropUIActionTriggered = false, // this variable still now in experimental state
	dataUrlAfterFlipTrigger = {}; // this variable still now in experimental state


btnUpload.addEventListener("click", function () {
	// check if files are empty
	if (inpFile.files.length === 0) {
		alert("No files selected");
		return;
	} else {
		const xhr = new XMLHttpRequest();
		const formData = new FormData();
		// processing button upload files into form field for ajax request
		for (const file of inpFile.files) {
			formData.append('formFiles[]', file);
		}
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				initGallery();
				// resetting file input field
				document.getElementById("fileInput").value = null;
			}
		}
		xhr.open("POST", "helper.php/?action=upload");
		xhr.send(formData);
	}
});

// cancel button of image canvas edited mood
document.querySelector('.btn-cancel-image-edit').addEventListener('click', function () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	galleryPanelToggle(true);
});

// filter panel enable //
document.querySelector('#btn-action-filter').addEventListener('click', function () {
	var imageUrl = 'uploads/original_files/' + currentEditedImageFileName;
	const filterImageNodeAll = document.querySelectorAll('.filter-grid-item img');
	[].forEach.call(filterImageNodeAll, function (img) {
		img.src = imageUrl;
	});
	document.querySelector('.filter-panel').style.display = 'block';
	document.querySelector('.crop-panel').style.display = 'none';
	document.querySelector('.save-cancel-action-button-wrapper').style.display = 'block';

	// resetitng action button active situatio 
	const thisSiblingTarget = document.querySelectorAll('.edited-image-type-action-list button');
	[].forEach.call(thisSiblingTarget, function (button) {
		button.classList.remove('active');
	});

	this.classList.add("active");
});

// Setting click event for all filter grid
[].forEach.call(document.querySelectorAll('.filter-grid-item'), function (filterDiv) {
	filterDiv.addEventListener('click', function () {
		let dataFilterName = this.dataset.filter;
		var img = new Image();
		// Must be set before src and image src must have CORS enabled
		img.crossOrigin = 'Anonymous';
		img.src = canvasGetDefaultUriState.data_url;
		img.alt = '';
		img.onload = function () {
			setTimeout(function () {
				if (dataFilterName === 'sepia' || dataFilterName === 'invert' || dataFilterName === 'contrast') {
					applyFilterToCanvasCustomFilter(dataFilterName, img);
				} else {
					applyFilterToCanvas(dataFilterName, img);
				}
			}, 0);
		};
	});
});
/*
    aciton when click on save button
*/
document.querySelector('.btn-save-image-edit').addEventListener('click', function () {
	var dataURL = canvas.toDataURL();
	document.querySelector('.hdn_canvas_data_url').value = dataURL;
	document.querySelector('.hdn_image_id').value = currentEditedImageFileName;
	var fd = new FormData(document.forms["frmCanvasData"]);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'helper.php?action=edit', true);
	xhr.send(fd);
	xhr.onprogress = function (event) {
		document.querySelector('.loaderBg').style.display = 'block';
	};
	xhr.onload = function () {
		setTimeout(function () {
			document.querySelector('.loaderBg').style.display = 'none';
		}, 500);
		if (xhr.status != 200) { // analyze HTTP status of the response
			alert(`Error ${xhr.status}: ${xhr.statusText}`);
		} else {
			alert("Saved Images");
			canvasGetDefaultUriState = {};
			// resetting gallery default view //
			initGallery();
			// clearing canvas //
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			galleryPanelToggle(true);
		}
	};
});

/*
    action for crop ui
*/
document.querySelector('#btn-action-crop').addEventListener('click', function () {
	document.querySelector('.filter-panel').style.display = "none";
	document.querySelector('.crop-panel').style.display = "block";
	// getting default canvas uri //
	canvasGetDefaultUriState = {
		data_url: canvas.toDataURL(),
		width: canvas.width,
		height: canvas.height
	};
	document.querySelector('.save-cancel-action-button-wrapper').style.display = 'block';

	// resetitng action button active situatio 
	const thisSiblingTarget = document.querySelectorAll('.edited-image-type-action-list button');
	[].forEach.call(thisSiblingTarget, function (button) {
		button.classList.remove('active');
	});

	this.classList.add('active');
});

/*
    if flip button trigger
*/
function flipMethodProcess(event) {
	if (event.value === "vertical") {
		isFlipUIActionTriggered = true;
		const image = new Image(); // Using optional size for image
		image.onload = function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.translate(0, canvas.height);
			ctx.scale(1, -1);
			ctx.drawImage(image, 0, 0);
			ctx.restore();
			dataUrlAfterFlipTrigger = {
				data_url: canvas.toDataURL(),
				width: canvas.width,
				height: canvas.height
			};
		}; // Draw when image has loaded
		image.src = canvas.toDataURL();
	} else if (event.value === "horizontal") {
		isFlipUIActionTriggered = true;
		const image = new Image(); // Using optional size for image
		image.onload = function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.translate(canvas.width, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(image, 0, 0);
			ctx.restore();
			dataUrlAfterFlipTrigger = {
				data_url: canvas.toDataURL(),
				width: canvas.width,
				height: canvas.height
			};
		}; // Draw when image has loaded
		image.src = canvas.toDataURL();
	} else {
		if (isFlipUIActionTriggered === false) {
			return;
		}
		const image = new Image(); // Using optional size for image
		image.onload = function () {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.drawImage(image, 0, 0, canvasGetDefaultUriState.width, canvasGetDefaultUriState.height);
			ctx.restore();
		}; // Draw when image has loaded
		image.src = canvasGetDefaultUriState.data_url;
	}
}

function drawRotated(event) {
	if (event.value > 0) {
		isCropUIActionTriggered = true;
	}

	let image = new Image(); // Using optional size for image
	image.onload = function () {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		// Here this translate() method means that we are now setting coordinate value to the middle. And we are rotating the value from center position
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(event.value * Math.PI / 180);
		ctx.drawImage(image, -image.width / 2, -image.height / 2);
		ctx.restore();
	}; // Draw when image has loaded
	image.src = isFlipUIActionTriggered ? dataUrlAfterFlipTrigger.data_url : canvasGetDefaultUriState.data_url;
	//image.src = canvas.toDataURL();

}

function initGallery() {
	const xhrOnload = new XMLHttpRequest();
	xhrOnload.open('GET', 'helper.php/?action=init');
	xhrOnload.send();
	xhrOnload.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			crop_initated = false;
			var imageFilesListJsonDecode = JSON.parse(this.responseText);
			if (imageFilesListJsonDecode['content'] !== false) {
				document.querySelector(".gallery-main-wrapper").innerHTML = imageFilesListJsonDecode['item_found'] + imageFilesListJsonDecode['content'];
			} else {
				document.querySelector(".gallery-main-wrapper").innerHTML = '<h1>Gallery is empty!</h1>';
			}
		}
	}
}

// action if select gallery file and then triggering ui of edit //
function editTriggerMethod(fileName) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	currentEditedImageFileName = fileName;
	galleryPanelToggle();
	// load image into canvas //
	const image = new Image(); // Using optional size for image
	image.onload = drawImageActualSize; // Draw when image has loaded
	image.src = "uploads/" + fileName;
}
/*
    image loading funciton
*/
function drawImageActualSize() {
	// Use the intrinsic size of image in CSS pixels for the canvas element
	canvas.width = this.naturalWidth;
	canvas.height = this.naturalHeight;
	ctx.drawImage(this, 0, 0, this.width, this.height);

	canvasGetDefaultUriState = {
		data_url: canvas.toDataURL(),
		width: canvas.width,
		height: canvas.height
	};
}
/*
    toggle image gallery main panel
*/
function galleryPanelToggle(isShow) {
	if (isShow !== "undefined" && isShow === true) {
		document.querySelector(".gallery-main-wrapper").style.display = "block";
		document.querySelector(".file-upload-wrapper").style.display = "block";

		document.querySelector(".edit-panel-wrapper").style.display = "none";
		document.querySelector(".filter-panel").style.display = 'none';
		document.querySelector('.crop-panel').style.display = 'none';
		document.querySelector('.save-cancel-action-button-wrapper').style.display = 'none';

		// reseting action button active situatio 
		const thisSiblingTarget = document.querySelectorAll('.edited-image-type-action-list button');
		[].forEach.call(thisSiblingTarget, function (button) {
			button.classList.remove('active');
		});

		let cropAllButtonTarget = document.querySelectorAll('.crop-panel input');
		[].forEach.call(cropAllButtonTarget, function (radio) {
			radio.checked = false;
		});

	} else {
		document.querySelector(".gallery-main-wrapper").style.display = "none";
		document.querySelector(".file-upload-wrapper").style.display = "none";
		document.querySelector(".edit-panel-wrapper").style.display = "block";
	}
}
/**
 * @param {string} url - The source image
 * @param {number} aspectRatio - The aspect ratio
 * @return {Promise<HTMLCanvasElement>} A Promise that resolves with the resulting image as a canvas element
 */
function cropByRatio(aspectRatio) {
	// resetting flip and rotate selection
	resetInputFields();

	const imageURL = canvasGetDefaultUriState.data_url;

	if (aspectRatio === "5/3") {
		crop(imageURL, 5 / 3).then(_canvas => {
			canvas.width = _canvas.width;
			canvas.height = _canvas.height;
			ctx.clearRect(0, 0, _canvas.width, _canvas.height);
			ctx.save();
			ctx.drawImage(_canvas, 0, 0);
			ctx.restore();
		});
	} else if (aspectRatio === "16/9") {
		crop(imageURL, 16 / 9).then(_canvas => {
			canvas.width = _canvas.width;
			canvas.height = _canvas.height;
			ctx.clearRect(0, 0, _canvas.width, _canvas.height);
			ctx.save();
			ctx.drawImage(_canvas, 0, 0);
			ctx.restore();
		});
	} else if (aspectRatio === "10/7") {
		crop(imageURL, 10 / 7).then(_canvas => {
			canvas.width = _canvas.width;
			canvas.height = _canvas.height;
			ctx.clearRect(0, 0, _canvas.width, _canvas.height);
			ctx.save();
			ctx.drawImage(_canvas, 0, 0);
			ctx.restore();
		});
	} else if (aspectRatio === "7/5") {
		crop(imageURL, 7 / 5).then(_canvas => {
			canvas.width = _canvas.width;
			canvas.height = _canvas.height;
			ctx.clearRect(0, 0, _canvas.width, _canvas.height);
			ctx.save();
			ctx.drawImage(_canvas, 0, 0);
			ctx.restore();
		});
	} else if (aspectRatio === "4/3") {
		crop(imageURL, 4 / 3).then(_canvas => {
			canvas.width = _canvas.width;
			canvas.height = _canvas.height;
			ctx.clearRect(0, 0, _canvas.width, _canvas.height);
			ctx.save();
			ctx.drawImage(_canvas, 0, 0);
			ctx.restore();
		});
	} else if (aspectRatio === "2/3") {
		crop(imageURL, 2 / 3).then(_canvas => {
			canvas.width = _canvas.width;
			canvas.height = _canvas.height;
			ctx.clearRect(0, 0, _canvas.width, _canvas.height);
			ctx.save();
			ctx.drawImage(_canvas, 0, 0);
			ctx.restore();
		});
	}
}

/**
 * @url - Source of the image to use
 * @aspectRatio - The aspect ratio to apply
 */
function crop(url, aspectRatio) {

	//console.log(url);
	//console.log('aspect ratio : ');
	//console.log(aspectRatio);

	return new Promise(resolve => {

		// this image will hold our source image data
		const inputImage = new Image();

		// we want to wait for our image to load
		inputImage.onload = () => {

			// let's store the width and height of our image
			const inputWidth = inputImage.naturalWidth;
			const inputHeight = inputImage.naturalHeight;

			// get the aspect ratio of the input image
			const inputImageAspectRatio = inputWidth / inputHeight;

			// if it's bigger than our target aspect ratio
			let outputWidth = inputWidth;
			let outputHeight = inputHeight;
			if (inputImageAspectRatio > aspectRatio) {
				outputWidth = inputHeight * aspectRatio;
			} else if (inputImageAspectRatio < aspectRatio) {
				outputHeight = inputWidth / aspectRatio;
			}

			// calculate the position to draw the image at
			const outputX = (outputWidth - inputWidth) * .5;
			const outputY = (outputHeight - inputHeight) * .5;

			// create a canvas that will present the output image
			const outputImage = document.createElement('canvas');

			// set it to the same size as the image
			outputImage.width = outputWidth;
			outputImage.height = outputHeight;

			// draw our image at position 0, 0 on the canvas
			const _ctx = outputImage.getContext('2d');
			_ctx.drawImage(inputImage, outputX, outputY);
			resolve(outputImage);
		};

		// start loading our image
		inputImage.src = url;
	});
};

function backToMainScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	galleryPanelToggle(true);
}

function imageResetToOriginalState() {
	if (confirm("Are you sure you want to reset this image to default state")) {
		var img = new Image();
		// Must be set before src and image src must have CORS enabled
		img.crossOrigin = 'Anonymous';
		img.src = 'uploads/original_files/' + currentEditedImageFileName;
		img.alt = '';
		img.onload = function () {
			setTimeout(function () {
				canvas.width = img.width;
				canvas.height = img.height;

				ctx.save();
				ctx.clearRect(0, 0, img.width, img.height);
				ctx.drawImage(img, 0, 0, img.width, img.height);
				ctx.restore();
				// now saving this image to directory //
				var dataURL = canvas.toDataURL();
				document.querySelector('.hdn_canvas_data_url').value = dataURL;
				document.querySelector('.hdn_image_id').value = currentEditedImageFileName;
				var fd = new FormData(document.forms["frmCanvasData"]);
				var xhr = new XMLHttpRequest();
				xhr.open('POST', 'helper.php?action=edit', true);

				xhr.send(fd);
				xhr.onload = function () {
					if (xhr.status != 200) { // analyze HTTP status of the response
						alert(`Error ${xhr.status}: ${xhr.statusText}`);
					} else {
						canvasGetDefaultUriState = {
							data_url: canvas.toDataURL(),
							width: canvas.width,
							height: canvas.height
						};
						initGallery();

						let cropAllButtonTarget = document.querySelectorAll('.crop-panel input');
						[].forEach.call(cropAllButtonTarget, function (radio) {
							radio.checked = false;
						});
					}
				};
				// end of save this image to directory //
			}, 0);
		};
		img.onerror = function () {
			alert("Unexpected error occured. Try agian.");
		}
	}
}

function removeCurrentImage(fileName) {
	if (confirm("Are you sure you want to delete this image from gallery directory")) {
		document.querySelector('.hdn_image_id').value = fileName;
		var fd = new FormData(document.forms["frmCanvasData"]);
		var xhr = new XMLHttpRequest();
		xhr.open('POST', 'helper.php?action=delete', true);

		xhr.send(fd);
		xhr.onload = function () {
			if (xhr.status != 200) { // analyze HTTP status of the response
				alert(`Error ${xhr.status}: ${xhr.statusText}`);
			} else {
				initGallery();
			}
		};
	}
}

function resetInputFields() {
	let cropRotateAllButtonTarget = document.querySelectorAll('.crop-panel-rotate div input');
	[].forEach.call(cropRotateAllButtonTarget, function (radio) {
		radio.checked = false;
	});

	let cropFlipAllButtonTarget = document.querySelectorAll('.crop-panel-flip div input');
	[].forEach.call(cropFlipAllButtonTarget, function (_radio) {
		_radio.checked = false;
	});
}