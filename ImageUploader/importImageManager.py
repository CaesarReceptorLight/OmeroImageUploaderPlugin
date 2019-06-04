import os
import os.path
import shutil
import tempfile

class _ImportState:
	stateFileName = "OmeroUploadState.txt"
	
	@staticmethod
	def readFile():
		entries = dict()
		fileName = os.path.join(tempfile.gettempdir(), _ImportState.stateFileName)
		if os.path.exists(fileName):
			myFile = open(fileName)
			for line in myFile:
				keyvalue = line.split(';')
				entries.update({keyvalue[0]:keyvalue[1]})
			myFile.close()
		return entries
	
	@staticmethod
	def writeFile(entries):
		fileName = os.path.join(tempfile.gettempdir(), _ImportState.stateFileName)
		if os.path.exists(fileName):
			os.remove(fileName);
		myFile = file(fileName, "w+")		
		for k,v in entries.items():
			line = k + ";" + v + ";\n"
			myFile.write(line)			
		myFile.close()
		
	@staticmethod
	def getPathFromId(id):
		entries = _ImportState.readFile()
		if id in entries:
			return entries[id]		
		return None
	
	@staticmethod
	def createNewFile(fileName):
		entries = _ImportState.readFile()
		newId = 1
		while str(newId) in entries:
			newId += 1
		entries.update({str(newId):os.path.join(tempfile.mkdtemp(), fileName)})
		_ImportState.writeFile(entries)
		return str(newId)
		
	@staticmethod
	def removeId(id):
		entries = _ImportState.readFile()
		if id in entries:
			shutil.rmtree(os.path.dirname(os.path.abspath(entries[id])))
			del entries[id]
			_ImportState.writeFile(entries)

class ImportFile:
	@staticmethod
	def createNewFile(fileName):
		id = _ImportState.createNewFile(fileName)
		fullFileName = _ImportState.getPathFromId(id)
		myFile = file(fullFileName, "w+")				
		myFile.close()
		return id
	
	@staticmethod
	def deleteFile(id):
		_ImportState.removeId(id)
		
	@staticmethod
	def appendData(id, data):
		fullFileName = _ImportState.getPathFromId(id)
		if fullFileName != None:
			myFile = file(fullFileName, "a")
			myFile.write(data)
			myFile.close()
		
	@staticmethod
	def getPathFromId(id):
		return _ImportState.getPathFromId(id)
	
