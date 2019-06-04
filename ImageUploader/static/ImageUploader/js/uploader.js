var uploadList = new UploadList();

//debugger;  //for force the debugger to stop here

var urlCreate = location.protocol + "//" + window.location.host + "/ImageUploader/imageUploadCreateFile/";
var urlDelete = location.protocol + "//" + window.location.host + "/ImageUploader/imageUploadDeleteFile/";
var urlData = location.protocol + "//" + window.location.host + "/ImageUploader/imageUploadAppendData/";
var urlImport = location.protocol + "//" + window.location.host + "/ImageUploader/imageUploadImportOmero/";
var MaxPackageLength = 1024 * 1024; //max 1M per package

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

//we need this security cookie to push POST requests to the server
var csrftoken = getCookie('csrftoken');

// !!!!  This is a hack and should be changed !!!!
function deUmlaut(value){
    value = value.replace(/ä/g, 'ae');
    value = value.replace(/ö/g, 'oe');
    value = value.replace(/ü/g, 'ue');
    value = value.replace(/Ä/g, 'Ae');
    value = value.replace(/Ö/g, 'Oe');
    value = value.replace(/Ü/g, 'Ue');
    value = value.replace(/ß/g, 'ss');
    return value;
}

//open input file dialog
function ChooseImagesFunc() {
	var input = document.getElementById("fileDialog");
	input.value = "";
	input.click();	
	return false;
}

//clear the list of files which should upload to server
function ClearImagesFunc() {
	var myTable = document.getElementById("fileTable");

	for (var i = 0; i < uploadList.Count(); ++i)
	{
		myTable.removeChild(uploadList.GetAt(i).tableRow);
	}
	
	uploadList.ClearAll();
	return false;
}

//deletes temporary file from server
function DeleteFile(id)
{
	return new Promise(function(resolve, reject) {		
		params = "id=" + id;
		var deleteRequest = new XMLHttpRequest();
		deleteRequest.onload = function () {
			if (this.status === 200) {
				// Success
				resolve("File deleted");
			} else {
				// Something went wrong (404 etc.)
				reject(new Error(this.statusText));
			}
		}
		deleteRequest.open("POST", urlDelete);
		deleteRequest.setRequestHeader("X-CSRFToken", csrftoken);
		deleteRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		deleteRequest.send(params);
	});
}

//imports temporary file into omero system
function ImportToOmero(id, success)
{
	return new Promise(function(resolve, reject) {		
		if(success == true)
		{
			params = "datasetId=" + currentDatasetId.toString() + "&" + "fileId=" + id;
			var importRequest = new XMLHttpRequest();
			importRequest.onload = function () {
				if (this.status === 200) {
					// Success
					resolve(this.responseText);
				} else {
					// Something went wrong (404 etc.)
					reject(new Error(this.statusText));
				}
			}
			importRequest.open("POST", urlImport);
			importRequest.setRequestHeader("X-CSRFToken", csrftoken);
			importRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			importRequest.send(params);
		}
		else
		{
			resolve("CANCLED");
		}
	});
}

//creats a new temporary at the server
function CreateFile(file)
{
	return new Promise(function(resolve, reject) {		
		//create temp file
		var fileName = deUmlaut(file.name);
		var params = "fileName=" + fileName;
		var createRequest = new XMLHttpRequest();
		createRequest.onload = function () {
			if (this.status === 200) {
				// Success
				var id = this.responseText;
				resolve(id);
			} else {
				// Something went wrong (404 etc.)
				reject(this.statusText);
			}
		}
		createRequest.onerror = function () {
			reject(this.statusText);
		};
		createRequest.open("POST", urlCreate);
		createRequest.setRequestHeader("X-CSRFToken", csrftoken);
		createRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		createRequest.send(params);
		
	});
}

//uploads a package (part of a file) to the temporary file at the server
function UploadPackage(idBuffer, file, offset, length) {
	return new Promise(function(resolve, reject) {		
		var fileBuffer = file.slice(offset, offset + length);
		var buffer = new Blob([idBuffer, fileBuffer], {type: "text/plain"});
		var copyRequest = new XMLHttpRequest();
		copyRequest.onload = function () {
			if (this.status === 200) {
				// Success
				resolve();
			} else {
				// Something went wrong (404 etc.)
				reject(this.statusText);
			}
		}
		copyRequest.onerror = function () {
			reject(this.statusText);
		};
		copyRequest.open("POST", urlData);
		copyRequest.setRequestHeader("X-CSRFToken", csrftoken);
		copyRequest.setRequestHeader("Content-type", "text/plain");
		copyRequest.send(buffer);
	});
}

//uploads a package (part of a file) to the temporary file at the server
function UploadFileSubData(idBuffer, file, offset, length, index)
{
	var o = offset;
	var l = length;
	var p = Math.min(MaxPackageLength, l);
	var pers = (offset * 100.0 / file.size).toFixed(0);
	uploadList.GetAt(index).UpdateStatusText("Uploading: " + pers.toString() + "%");
	var promise = new Promise(function(resolve, reject) {
		if(uploadList.GetAt(index).cancleUpload == true)
		{			
			resolve(false);
		}
		else
		{
			UploadPackage(idBuffer, file, o, p)
			.then(function() {						
				o += p;
				l -= p;
				if (l <= 0) {
					resolve(true);
				} else {				
					UploadFileSubData(idBuffer, file, o, l, index)
					.then(function(success) {
						resolve(success);
					});
				}
			});
		}
	});	

	return promise;
}

//uploads data to the temporary file at the server
function UploadFileData(id, file, index)
{
	return new Promise(function(resolve, reject) {
		var idBuffer = id + ";";
		var length = file.size;		
		var offset = 0;
		
		UploadFileSubData(idBuffer, file, offset, length, index)
		.then(function(success) {
			if(success == true)
			{
				uploadList.GetAt(index).UpdateStatusText("Uploading: 100% - Wait for Importing");
				uploadList.GetAt(index).UpdateStatusImage(5);
			}
			else
			{
				uploadList.GetAt(index).UpdateStatusText("Uploading: CANCLED!");
				uploadList.GetAt(index).UpdateStatusImage(3);
			}
			resolve(success);
		})
		.catch(function (reason) {
			reject(reason);
		});		
	});
}

//imports the given file to the omero system
function ImportFile(file, index)
{
	return new Promise(function(resolve, reject) {
		if(file == null)
		{
			resolve("File is null!");
			return;
		}
		CreateFile(file)
		.then(function (id) {
			UploadFileData(id, file, index)
			.then(function(success) {
				if(success == true)
				{
					uploadList.GetAt(index).UpdateStatusImage(5);
				}
				ImportToOmero(id, success)				
				.then(function(re) {
					if(success == true)
					{						
						if(re.startsWith("FAIL"))
						{
							uploadList.GetAt(index).UpdateStatusText("Error while importing. " + re.split(":")[1]);
							uploadList.GetAt(index).UpdateStatusImage(4);
						}
						else
						{
							var words = re.split("_");
							if(words[0] == "IM")
							{
								uploadList.GetAt(index).UpdateStatusText("Finished! New Image ID: " + words[1]);
							}
							else
							{
								if ((words.length < 2) || (words[1] == "-1"))
								{
									uploadList.GetAt(index).UpdateStatusText("Error while importing. Contact administrator!");
									uploadList.GetAt(index).UpdateStatusImage(4);
								}
								else
								{
									uploadList.GetAt(index).UpdateStatusText("Finished! New User File ID: " + words[1]);
								}
							}
							uploadList.GetAt(index).UpdateStatusImage(2);
						}
					}
					DeleteFile(id)
					.then(function (value) {						
						resolve("Done");				
					})
					.catch(function (reason) {
						reject(reason);
					})
				})
				.catch(function (reason) {
					reject(reason);
				});
			})
			.catch(function (reason) {
				reject(reason);
			});
		})
		.catch(function (reason) {
			reject(reason);
		});
	});
}

//imports file at given index to the omero server
function UploadFile(index)
{
	DisableMainButtons(true);
	var promise = new Promise(function(resolve, reject) {
		uploadList.GetAt(index).isUploading = true;
		uploadList.GetAt(index).UpdateStatusImage(1);
		ImportFile(uploadList.GetAt(index).file, index)
		.then(function(value) {			
			if (uploadList.Count() <= (index + 1)) {
				ClearImagesFunc();
				DisableMainButtons(false);
				resolve();
			} else {				
				UploadFile(index+1)
				.then(function() {
					resolve();
				});
			}
		})
		.catch(function(reason) {
			alert(reason);
		});
	});	

	return promise;
}

//Starts importing files to the OMERO server
function UploadImagesFunc()
{
	if(uploadList.Count() > 0)
	{
		UploadFile(0);
	}
}

//list the choosen files in a list view
function FileChoosenFunc(input) {
	var myTable = document.getElementById("fileTable");	

	for (var i = 0; i < input.files.length; ++i)
	{
		var entry = uploadList.CreateEntry(input.files[i]);
		myTable.appendChild(entry.tableRow);
		entry.UpdateStatusImage(0);
	}

	RedrawBackground();

	return false;
}

function RedrawBackground()
{
	var noteven = new Boolean(true);

	for (var i = 0; i < uploadList.Count(); i++)
	{
		if (noteven == true)
		{
			uploadList.GetAt(i).SetBackground("#dddddd");
			noteven = false;
		}
		else
		{
			uploadList.GetAt(i).SetBackground("#fafafa");
			noteven = true;
		}
	}
}

//removes a file from file list or cancels upload if already started
function CancleJobFunc(btn)
{
	var idTxt = btn.getAttribute("id");
	var id = parseInt(idTxt.substring(9));

	var entry = uploadList.GetEntry(id);
	if(entry != null)
	{
		if(entry.isUploading == true)
		{
			entry.cancleUpload = true;
		}
		else
		{
			var myTable = document.getElementById("fileTable");
			if(myTable != null)
			{
				myTable.removeChild(entry.tableRow);
				uploadList.Remove(entry);
			}

			RedrawBackground();
		}
	}
}



//disables main buttons while upload process is running
function DisableMainButtons(status)
{
	var btn = document.getElementById("chooseButton");
	if(btn != null)
		btn.disabled = status;
	var btn = document.getElementById("clearButton");
	if(btn != null)
		btn.disabled = status;
	var btn = document.getElementById("uploadButton");
	if(btn != null)
		btn.disabled = status;
}
