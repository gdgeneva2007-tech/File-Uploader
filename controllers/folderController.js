const db=require("../db/queries")
const {deleteFromCloudinary}=require("../utils/cloudinaryUpload")
async function getCreateFolderForm(req,res,next){
    try{
        //folders/new?parentId=5
        const userId=req.user.id 
        const parentId=req.query.parentId?parseInt(req.query.parentId):null
        if(parentId!==null){
            if(isNaN(parentId))return res.status(404).render("error",{title:"Not found",message:"Not found"})
            if(parentId){
                const parent=await db.getFolderById(parentId)
                if(!parent||parent.userId!==userId)return res.status(403).render("error",{title:"Forbidden",message:"Not your folder"})
            }
        }
        res.render("folders/form",{
            title:"Create folder",
            error:"",
            formData:{},
            formAction:"/folders/new",
            parentId
        })
    }catch(err){
        next(err)
    }
    
}

async function postCreateFolder(req,res,next){
    try{
        const parentId=req.body.parentId?parseInt(req.body.parentId):null
        if(!req.body.name?.trim()){
            return res.render("folders/form",{
                title:"Create folder",
                error:"Name must not be empty",
                formData:req.body,
                formAction:"/folders/new",
                parentId
            })
        }
        await db.createFolder(parentId,req.body.name,req.user.id)
        if(parentId!==null){
            res.redirect(`/folders/${parentId}`)
        }else{
            res.redirect("/")
        }
    }catch(err){
        next(err)
    }
}

async function getFolderDetail(req,res,next){
    // /folders/:id
    const id=parseInt(req.params.id)
    if(id===null||isNaN(id)){
        return res.status(404).render("error",{title:"Not found",message:"No such folder."})
    }
    const folder=await db.getFolderById(id)
    if(!folder||folder.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
    res.render("folders/details",{
        title:"Folder detail",
        folder
    })
}

async function getRenameFolderForm(req,res,next){
    // /folders/:id/edit
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"Not found"})
        const folder=await db.getFolderById(id)
        if(!folder||folder.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        res.render("folders/form",{
            title:"Rename folder",
            error:"",
            formData:{name:folder.name},
            formAction:`/folders/${folder.id}/edit`,
            parentId:null
        })
    }catch(err){
        next(err)
    }
}

async function postRenameFolder(req,res,next){
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"Not found"})
        const folder=await db.getFolderById(id)
        if(!folder||folder.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        if(!req.body.name?.trim()){
            return res.render("folders/form",{
                title:"Rename folder",
                error:"Name must not be empty",
                formData:req.body,
                formAction:`/folders/${folder.id}/edit`,
                parentId:folder.parentId
            })
        }
        await db.renameFolder(folder.id,req.body.name)
        if(folder.parentId!==null){
            res.redirect(`/folders/${folder.parentId}`)
        }else{
            res.redirect("/")
        }
    }catch(err){
        next(err)
    }
}

async function deleteFolder(req,res,next){
    //  /folders/:id/delete
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"Not found"})
        const folder=await db.getFolderById(id)
        if(!folder||folder.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        const parentId=folder.parentId
        for(const file of folder.files) {
            await deleteFromCloudinary(file.cloudinaryId)
        }

        await db.removeFolder(id)
        if(parentId!==null){
            res.redirect(`/folders/${parentId}`)
        }else{
            res.redirect("/")
        }
    }catch(err){
        next(err)
    }
}

module.exports={
    getCreateFolderForm,
    postCreateFolder,
    getFolderDetail,
    getRenameFolderForm,
    postRenameFolder,
    deleteFolder
}