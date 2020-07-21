<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <title>Joomshepard UI file upload</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <div class="wrapper">
        <h1 id="gallery-heading">Midea Library</h1>
        <!-- gallery main wrapper. This is very important. here gallery is being inserting by ajax call-->
        <div class="gallery-wrapper-parent">
            <div class="gallery-main-wrapper"></div>
        </div>
        <!-- gallery wrapper end -->
        <!-- file upload wrapper-->
        <div class="file-upload-wrapper">
            <div class="file-upload-wrapper-inner">
                <label for="fileInput">Upload files : </label>
                <input type="file" id="fileInput" multiple accept="image/*">
                <button id="btnUpload">Upload Files</button>
            </div>
        </div>
        <!-- file upload wrapper end -->
        <!-- ui for edit panel show -->
        <div class="edit-panel-wrapper">
            <div class="edit-panel-wrapper-inner">
                <div class="edit-image-canvas-area">
                    <!-- <img src="">-->
                    <canvas id="canvas"></canvas>
                    <form class="frmCanvasData" name="frmCanvasData" enctype="multipart/form-data" method="POST">
                        <input type="hidden" name="hdn_canvas_data_url" class="hdn_canvas_data_url"/>
                        <input type="hidden" name="hdn_image_id" class="hdn_image_id"/>
                    </form>
                    <button class="btnBackToMainScreen" onclick="backToMainScreen()">Back</button>
                </div>
                <div class="edited-image-type-action-list">
                    <button id="btn-action-filter">Filter</button>
                    <button id="btn-action-crop">Crop</button>
                    <button id="btn-image-reset-action-to-default" onclick="imageResetToOriginalState()">Reset image to default original state</button>
                </div>
            </div>
        </div>
        <!-- end of edit panel show -->
        <div class="filter-panel">
            <div class="filter-panel-inner">
                <div class="filter-original filter-grid-item" data-filter="noFilter">
                    <img src="" width="200">
                    <label>Original</label>
                </div>
                <div class="filter-grayscale filter-grid-item" data-filter="grayscale">
                    <img src="" width="200">
                    <label>Grayscale</label>
                </div>
                <div class="filter-brightness filter-grid-item" data-filter="brightness">
                    <img src="" width="200">
                    <label>Brightness</label>
                </div>
                <div class="filter-blur filter-grid-item" data-filter="blurC">
                    <img src="" width="200">
                    <label>Blur</label>
                </div>
                <div class="filter-sepia filter-grid-item" data-filter="sepia">
                    <img src="" width="200">
                    <label>Sepia</label>
                </div>
                <div class="filter-invert filter-grid-item" data-filter="invert">
                    <img src="" width="200">
                    <label>invert</label>
                </div>
                <div class="filter-contrast filter-grid-item" data-filter="contrast">
                    <img src="" width="200">
                    <label>Contrast</label>
                </div>
            </div>
        </div>
        <!-- crop panel -->
        <div class="crop-panel">
            <ul>
                <li class="crop-panel-flip">
                    <div>Flip : </div>
                    <div>
                        <input type="radio" id="radFlipNone" name="radFlip" value="none" onchange="flipMethodProcess(this)">
                        <label for="radFlipNone">None</label>
                    </div>
                    <div>
                        <input type="radio" id="radFlipHorizontal" name="radFlip" value="horizontal" onchange="flipMethodProcess(this)">
                        <label for="radFlipHorizontal">Flip Horizontally</label>
                    </div>
                    <div>
                        <input type="radio" id="radFlipVertical" name="radFlip" value="vertical" onchange="flipMethodProcess(this)">
                        <label for="radFlipVertical">Flip Vertically</label>
                    </div>
                </li>
                <li class="crop-panel-rotate">
                    <div>Rotate : </div>
                    <div>
                        <input type="radio" id="radRotate0" name="radRotate" value="0" onchange="drawRotated(this)">
                        <label for="radRotate0">0 Deg</label>
                    </div>
                    <div>
                        <input type="radio" id="radRotate30" name="radRotate" value="30" onchange="drawRotated(this)">
                        <label for="radRotate30">30 Deg</label>
                    </div>
                    <div>
                        <input type="radio" id="radRotate60" name="radRotate" value="60" onchange="drawRotated(this)">
                        <label for="radRotate60">60 Deg</label>
                    </div>
                    <div>
                        <input type="radio" id="radRotate90" name="radRotate" value="90" onchange="drawRotated(this)">
                        <label for="radRotate90">90 Deg</label>
                    </div>
                    <div>
                        <input type="radio" id="radRotate180" name="radRotate" value="180" onchange="drawRotated(this)">
                        <label for="radRotate180">180 Deg</label>
                    </div>
                </li>
                <li class="crop-panel-ratio">
                    <div>Ratio : </div>
                    <div>
                        <input type="radio" id="radRatio-16-9" name="radRatio" value="16/9" onchange="cropByRatio(this.value)">
                        <label for="radRatio-16-9">16:9</label>                        
                    </div>
                    <div>
                        <input type="radio" id="radRatio-10-7" name="radRatio" value="10/7" onchange="cropByRatio(this.value)">
                        <label for="radRatio-10-7">10:7</label>                        
                    </div>
                    <div>
                        <input type="radio" id="radRatio-7-5" name="radRatio" value="7/5" onchange="cropByRatio(this.value)">
                        <label for="radRatio-7-5">7:5</label>                        
                    </div>
                    <div>
                        <input type="radio" id="radRatio-4-3" name="radRatio" value="4/3" onchange="cropByRatio(this.value)">
                        <label for="radRatio-4-3">4:3</label>                        
                    </div>
                    <div>
                        <input type="radio" id="radRatio-5-3" name="radRatio" value="5/3" onchange="cropByRatio(this.value)">
                        <label for="radRatio-5-3">5:3</label>                        
                    </div>
                    <div>
                        <input type="radio" id="radRatio-2-3" name="radRatio" value="2/3" onchange="cropByRatio(this.value)">
                        <label for="radRatio-2-3">2:3</label>                        
                    </div>
                </li>
            </ul>
        </div>
		<!-- action button --->
		<div class="save-cancel-action-button-wrapper">
			<button class="btn-cancel-image-edit">Cancel</button>
			<button class="btn-save-image-edit">Save</button>
		</div>
		<!-- action button end -->
        <!-- crop panel end -->
        <div class="loaderBg">
            <div class="loader"></div>
        </div>
    </div>
    <script type="text/javascript" src="filter.js"></script>
    <script type="text/javascript" src="script.js"></script>
    <script type="text/javascript">
        window.onload = initGallery;
    </script>
</body>
</html>