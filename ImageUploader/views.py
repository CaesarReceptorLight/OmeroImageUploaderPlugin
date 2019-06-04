from importImageManager import ImportFile
from django.http import (HttpResponse, HttpResponseNotAllowed,
                         HttpResponseBadRequest)

from omeroweb.webclient.decorators import login_required
from django.shortcuts import render

import omero
import omero.cli

import os
import os.path
import shutil
import tempfile
import random

import logging
logger = logging.getLogger(__name__)


@login_required(setGroupContext=True)
def getImageUploadView(request, conn=None, **kwargs):
    try:
        datasetId = request.POST.get("datasetId", 0)
        dataset = conn.getObject("Dataset", datasetId)
        datasetName = 'Unnamed'
        if dataset is not None:
            datasetName = dataset.getName()
        return render(request, 'ImageUploader/index.html',
                      {'userName': conn.getUser().getName(),
                       'datasetId': datasetId,
                       'datasetName': datasetName
                       })
    except:
        raise


@login_required(setGroupContext=True)
def imageUploadCreateFile(request, conn=None, **kwargs):
    try:
        fileName = request.POST.get("fileName", 0)
        id = ImportFile.createNewFile(fileName)
        logger.info("Create temp file: %s" % fileName)
        return HttpResponse(id)
    except:
        raise


@login_required(setGroupContext=True)
def imageUploadDeleteFile(request, conn=None, **kwargs):
    try:
        id = request.POST.get("id", 0)
        ImportFile.deleteFile(id)
        logger.info("Delete temp file: %s" % id)
        return HttpResponse(id)
    except:
        raise


@login_required(setGroupContext=True)
def imageUploadAppendData(request, conn=None, **kwargs):
    try:
        idIndex = request.body.index(';')
        id = request.body[:idIndex]
        ImportFile.appendData(id, request.body[idIndex + 1:])
        return HttpResponse(id)
    except:
        raise


@login_required(setGroupContext=True)
def imageUploadImportOmero(request, conn=None, **kwargs):
    try:
        fileId = request.POST.get("fileId", 0)
        datasetId = request.POST.get("datasetId", 0)
        path = ImportFile.getPathFromId(fileId)
        if path is None:
            return HttpResponse("FAIL:No path for temp file ID " + str(fileId))

        dataset = conn.getObject("Dataset", datasetId)
        if dataset is None:
            return HttpResponse("FAIL:No dataset with ID " + str(datasetId))

        txt = ""
        ret_code = -1

        with tempfile.NamedTemporaryFile(suffix=".stdout") as stdout:
            with tempfile.NamedTemporaryFile(suffix=".stderr") as stderr:
                cli = omero.cli.CLI()
                cli.loadplugins()
                cli._client = conn.c
                cli.invoke(["import", "---errs", stderr.name, "---file",
                            stdout.name, "--no-upgrade-check", path, "-d", datasetId])
                ret_code = cli.rv
                if ret_code == 0:
                    txt = "IM_" + stdout.readline().split(':')[1]
        
        return HttpResponse(txt)
    except Exception as e:
        txt = "FAIL:" + str(e)
        return HttpResponse(txt)
