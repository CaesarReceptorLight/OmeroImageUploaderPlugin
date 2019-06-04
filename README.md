# OMERO ImageUploader plugin
A web plugin for uploading images from the OMERO web client.

**Requirements**

An installed OMERO server.

**Installation**

1.	Copy the folder 'ImageUploader' to:

    /home/omero/OMERO.server/lib/python/omeroweb/

2.	Add ImageUploader to the known web apps

    /home/omero/OMERO.server/bin/omero config append omero.web.apps '"ImageUploader"'

3.	Add the ImageUploader plugin the the center area

    /home/omero/OMERO.server/bin/omero config append omero.web.ui.center_plugins '["Image Upload", "ImageUploader/image_upload_init.js.html", "image_upload_panel"]'

4.  Restart the web server

    /home/omero/OMERO.server/bin/omero web restart
