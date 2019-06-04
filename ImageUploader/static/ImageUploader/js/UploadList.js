function UploadList()
{
    this.entries = [];   
}

UploadList.prototype.Count = function()
{
    return this.entries.length;
};

UploadList.prototype.CreateEntry = function(file)
{
    var id = 0;
    while(this.ExistsId(id) == true)
    {
        id++;   
    }
    var entry = new UploadEntry(id, file);
    this.entries.push(entry);
    return entry;
};

UploadList.prototype.ClearAll = function()
{
    while (this.entries.length) { this.entries.pop(); }
};

UploadList.prototype.GetEntry = function(id)
{
    for(var i = 0; i < this.Count(); i++)
    {
        if(this.entries[i].id == id)
        {
            return this.entries[i];
        }
    }

    return null;
};

UploadList.prototype.GetAt = function(index)
{
    if(index < 0)
    {
        return null;
    }

    if(index >= this.entries.length)
    {
        return null;
    }

    return this.entries[index];
};

UploadList.prototype.Remove = function(entry)
{
    var newEntries = [];

    for(var i = 0; i < this.Count(); i++)
    {
        if(this.entries[i].id != entry.id)
        {
            newEntries.push(this.entries[i]);
        }
    }

    this.entries = newEntries;
};

UploadList.prototype.ExistsId = function(id)
{
    for(var i = 0; i < this.Count(); i++)
    {
        if(this.entries[i].id == id)
        {
            return true;
        }
    }

    return false;
}
