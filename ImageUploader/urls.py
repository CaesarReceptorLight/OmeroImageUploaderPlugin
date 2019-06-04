from django.conf.urls import *
from ImageUploader import views

urlpatterns = patterns(
    'django.views.generic.simple',

    url(r'^getImageUploadView/$',
        views.getImageUploadView,
        name="ImageUploader_getImageUploadView"),

	url(r'^imageUploadCreateFile/$',
        views.imageUploadCreateFile,
        name="ImageUploader_imageUploadCreateFile"),

	url(r'^imageUploadDeleteFile/$',
        views.imageUploadDeleteFile,
        name="ImageUploader_imageUploadDeleteFile"),

	url(r'^imageUploadAppendData/$',
        views.imageUploadAppendData,
        name="ImageUploader_imageUploadAppendData"),

        url(r'^imageUploadImportOmero/$',
        views.imageUploadImportOmero,
        name="ImageUploader_imageUploadImportOmero"),

)
