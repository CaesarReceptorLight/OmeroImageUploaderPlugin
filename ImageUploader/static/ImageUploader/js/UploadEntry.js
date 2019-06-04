function UploadEntry(id, file)
{
    this.id = id;
    this.file = file;
    this.cancleUpload = new Boolean(false);
    this.isUploading = new Boolean(false);
    this.tableRow = document.createElement("tr");
    this.CreateRow();
}

UploadEntry.prototype.CreateRow = function()
{    
    this.tableRow.setAttribute("id", "tableEntry" + this.id.toString());

    var cellName = document.createElement("td");
    cellName.setAttribute("style", "padding: 8px;");
    cellName.appendChild(document.createTextNode(this.file.name));

    var cellSpace = document.createElement("td");

    var cellSize = document.createElement("td");
    cellSize.appendChild(document.createTextNode(this.file.size));

    var cellSpace2 = document.createElement("td");

    var cellButton = document.createElement("td");
    var btn = document.createElement("button");
    btn.setAttribute("id", "statusBtn" + this.id.toString());
    btn.setAttribute("onclick", "CancleJobFunc(this)");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "button");
    btn.setAttribute("style", "vertical-align: middle;");
    var img = document.createElement("img");
    img.setAttribute("id", "statusImg" + this.id.toString());
    btn.appendChild(img);
    cellButton.appendChild(btn);

    var cellStatus = document.createElement("td");
    cellStatus.setAttribute("id", "uploadStatus" + this.id.toString());
    cellStatus.appendChild(document.createTextNode("Unloaded"));
    
    this.tableRow.appendChild(cellName);
    this.tableRow.appendChild(cellSpace);
    this.tableRow.appendChild(cellSize);
    this.tableRow.appendChild(cellSpace2);
    this.tableRow.appendChild(cellButton);
    this.tableRow.appendChild(cellStatus);
};

UploadEntry.prototype.SetBackground = function(background)
{
    this.tableRow.setAttribute("style", "background-color: " + background + ";");
};

//updates the icon of the status button
//status == 0 -> Offline icon (for deleting item from list)
//status == 1 -> Stop icon (while uploading to server)
//status == 2 -> OK icon (after successful importing)
//status == 3 -> invalid icon (after canceling upload)
//status == 4 -> warning icon (unsupported format)
//status == 5 -> hourglass icon (while importing into omero server)
UploadEntry.prototype.UpdateStatusImage = function(status)
{
	var img = document.getElementById("statusImg" + this.id.toString());
	if(img != null)
	{
		if(status == 0)
			img.src = DJANGO_STATIC_URL + "ImageUploader/images/StatusOffline_16x.png";
		else if(status == 1)
			img.src = DJANGO_STATIC_URL + "ImageUploader/images/StatusStop_16x.png";
		else if(status == 2)
			img.src = DJANGO_STATIC_URL + "ImageUploader/images/StatusOK_16x.png";
        else if(status == 3)
			img.src = DJANGO_STATIC_URL + "ImageUploader/images/StatusInvalid_16x.png";
        else if(status == 4)
			img.src = DJANGO_STATIC_URL + "ImageUploader/images/StatusWarning_16x.png";
        else if(status == 5)
			img.src = DJANGO_STATIC_URL + "ImageUploader/images/Hourglass_16x.png";
	}

	var btn = document.getElementById("statusBtn" + this.id.toString());
	if(btn != null)
	{
		if(status > 1)
			btn.disabled = true;
	}
};

//updates the text of the status 
UploadEntry.prototype.UpdateStatusText = function(status)
{
	var txt = document.getElementById("uploadStatus" + this.id.toString());
	if(txt != null)
	{
		txt.childNodes[0].nodeValue = status;
    }
};