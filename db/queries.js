// db/queries.js
const { DbNull } = require("@prisma/client/runtime/client");
const prisma = require("./prisma");
const {v4: uuidv4} =require("uuid")

async function getUserByEmail(email) {
  return await prisma.user.findUnique({
    where: { email: email }
  });
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: id }
  });
}

async function createUser(user) {
  return await prisma.user.create({
    data: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password
    }
  });
}

// add your project queries below

async function getFolderById(id){
  return await prisma.folder.findUnique({
    where:{id},
    include:{
      children:true,
      parent:{select:{id:true,name:true}},
      files:true
    }
  })
}

async function getRootFolders(userId){
  return await prisma.folder.findMany({
    where:{userId,parentId:null},
    include:{
      children:true,
      files:true
    }
  })
}

async function getUncategorizedFiles(userId){
  return await prisma.file.findMany({
    where:{userId,folderId:null},
    orderBy:{uploadedAt:"desc"}
  })
}

async function getFileById(id){
  return await prisma.file.findUnique({
    where:{id}
  })
}

async function createFolder(parentId=null,name,userId){
  return await prisma.folder.create({
    data:{name,userId,parentId}
  })
}

async function removeFolder(id){
  return await prisma.folder.delete({
    where:{id}
  })
}

async function renameFolder(id,name){
  return await prisma.folder.update({
    where:{id},
    data:{name}
  })
}

async function createFile(name,userId,folderId=null,url,cloudinaryId,mimetype){
  return await prisma.file.create({
    data:{name,userId,folderId,url,cloudinaryId,
      mimetype:mimetype||"application/octet-stream"
    }
  })
}

async function removeFile(id){
  return await prisma.file.delete({
    where:{id}
  })
}


async function createSharedFolder(id,shareId,shareExpiry){
  return await prisma.folder.update({
    where:{id},
    data:{shareId,shareExpiry}
  })
}

async function removeSharedFolder(id){
  return await prisma.folder.update({
    where:{id},
    data:{shareId:null,shareExpiry:null}
  })
}

async function getFolderByShareId(shareId){
  return await prisma.folder.findUnique({
    where:{shareId},
    include:{children:true,files:true,user:{select:{firstName:true,lastName:true}}}
  })
}

async function createShareLink(folderId,expiryDate){
  const shareId=uuidv4()
  return await prisma.folder.update({
    where:{id:folderId},
    data:{
      shareId,
      shareExpiry:expiryDate
    }
  })
}

async function getSharedAncestor(folderId){
  const folder=await prisma.folder.findUnique({
    where:{id:folderId}
  })
  if(!folder)return null
  if(new Date()<=new Date(folder.shareExpiry))return folder.shareId
  if(folder.parentId===null)return null
  return getSharedAncestor(folder.parentId)
}

async function getSharedAncestorOfFile(fileId){
  const file=await prisma.file.findUnique({
    where:{id:fileId}
  })
  if(!file)return null
  if(file.folderId===null)return null
  const ancestorFolderShareId=await getSharedAncestor(file.folderId)
  return ancestorFolderShareId
}


async function getFilesByFolderId(folderId){
  return await prisma.file.findMany({
    where:{folderId}
  })
}

async function getChildrenFolders(parentId){
  return await prisma.folder.findMany({
    where:{parentId}
  })
}

async function getAllNestedFiles(folderId){
  let allFiles=await getFilesByFolderId(folderId)
  const childrenFolders=await getChildrenFolders(folderId)
  if(!childrenFolders.length)return allFiles
  for(const child of childrenFolders){
    const childFiles=await getAllNestedFiles(child.id)
    allFiles=allFiles.concat(childFiles)
  }
  return allFiles
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  getFolderById,getRootFolders,
  getUncategorizedFiles,getFileById,createFolder,
  removeFolder,renameFolder,createFile,removeFile,
  createSharedFolder,
  removeSharedFolder,getFolderByShareId,
  createShareLink,
  getSharedAncestor,
  getSharedAncestorOfFile,
  getAllNestedFiles
};