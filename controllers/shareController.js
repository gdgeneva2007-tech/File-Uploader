const db=require("../db/queries")
async function getSharedFolder(req,res,next){
    try{
        const shareId=req.params.id
        if(!shareId)return res.status(404).render("error",{title:"Not found",message:"Not found"})
        const folder=await db.getFolderByShareId(shareId)
        if(!folder||new Date()>new Date(folder.shareExpiry)){
            return res.status(403).render("error",{
                title:"Forbidden",
                message:"Share link is invalid or has expired"
            })
        }
        const user=db.getUserById(folder.userId)
        res.render("share/details",{
            title:"Shared folder",
            folder,
            shareId,
            firstName:user.firstName,
            lastName:user.lastName
        })
    }catch(err){
        next(err)
    }
    
}

async function postCreateShareFolder(req,res,next){
    try{
        // /folders/:id/share
        const id=parseInt(req.params.id)
        if(id===null||isNaN(id)){
            return res.status(404).render("error",{title:"Not found",message:"No such folder."})
        }
        const folder=await db.getFolderById(id)
        if(!folder||folder.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        const days=parseInt(req.body.days)
        const expiryDate=new Date(
            Date.now()+days*24*60*60*1000
        )
        await db.createShareLink(id,expiryDate)
        res.redirect(`/folders/${id}`)
    }catch(err){
        next(err)
    }
}

async function postRemoveShareFolder(req,res,next){
    try{
        // /folders/:id/unshare
        const id=parseInt(req.params.id)
        if(id===null||isNaN(id)){
            return res.status(404).render("error",{title:"Not found",message:"No such folder."})
        }
        const folder=await db.getFolderById(id)
        if(!folder||folder.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        await db.removeSharedFolder(id)
        res.redirect(`/folders/${id}`)
    }catch(err){
        next(err)
    }
}

async function getNestedFile(req,res,next){
    try{
        const shareId=req.params.shareId
        const fileId=req.params.fileId?parseInt(req.params.fileId):null
        if(fileId===null||isNaN(fileId))return res.status(404).render("error",{title:"Not found",message:"No such folder."})
        const sharedFolder=await db.getFolderByShareId(shareId)
        const nestedFile=await db.getFileById(fileId)
        if(!sharedFolder||!nestedFile||(new Date(sharedFolder.shareExpiry)<new Date())){
            return res.status(403).render("error",{title:"Forbidden",message:"Not found"})
        }
        const ancestorId=await db.getSharedAncestorOfFile(fileId)
        if(shareId!==ancestorId)return res.status(403).render("error",{title:"Forbidden",message:"It's not your file."})
        res.render("share/sharedFileDetails",{
            title:"Shared file",
            file:nestedFile,
            shareId
        })
    }catch(err){
        next(err)
    }
}

async function getNestedFolder(req,res,next){
    try{
        const shareId=req.params.shareId
        const folderId=req.params.folderId?parseInt(req.params.folderId):null
        if(folderId===null||isNaN(folderId))return res.status(404).render("error",{title:"Not found",message:"No such folder."})
        const sharedFolder=await db.getFolderByShareId(shareId)
        const nestedFolder=await db.getFolderById(folderId)
        if(!sharedFolder||!nestedFolder||(new Date(sharedFolder.shareExpiry)<new Date())){
            return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        }
        const ancestorId=await db.getSharedAncestor(folderId)
        if(shareId!==ancestorId)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        const user=await db.getUserById(sharedFolder.userId)
            res.render("share/details",{
            title:"Shared folder",
            folder:nestedFolder,
            shareId,
            firstName:user.firstName,
            lastName:user.lastName
        })
    }catch(err){
        next(err)
    }
}

module.exports={
    getSharedFolder,
    postCreateShareFolder,
    postRemoveShareFolder,
    getNestedFile,
    getNestedFolder
}