const db=require("../db/queries")
const { uploadToCloudinary, deleteFromCloudinary } =require("../utils/cloudinaryUpload")
const { selectFields } = require("express-validator/lib/field-selection")

async function getCreateFileForm(req,res,next){
    try{
        // files/upload?folderId=.....
        const folderId=req.query.folderId?parseInt(req.query.folderId):null
        let folder=null
        if(folderId){
            folder=await db.getFolderById(folderId)
        }
        res.render("files/form",{
            title:"Create file",error:"",
            folderId
            // formAction:"/files/create",
            // formData:{}
        })
    }catch(err){
        next(err)
    }
}

async function postCreateFile(req,res,next){
    try{
        let folder=null;
        const folderId=req.body.folderId?parseInt(req.body.folderId):null
        if(folderId!==null&&isNaN(folderId))return res.status(404).render("error",{title:"Not found",message:"No such folder."})
        if(folderId!==null){
            folder=await db.getFolderById(folderId)
        }
        if(!req.file){
            return res.render("files/form",{
                title:"Create file",error:"Please choose a file.",
                folderId
            })
        }
        if((folderId!==null&&!folder)||(folder&&folder.userId!==req.user.id)){
            return res.status(403).render("error",{title:"Forbidden",message:"It's not your folder."})
        }

        // CLOUDINARY UPLOAD
        const result=await uploadToCloudinary(
            req.file.buffer,
            "file-uploader"
        )
        
        await db.createFile(req.file.originalname,
            req.user.id,
            folderId,
            result.secure_url,
            result.public_id
        )
        if(folderId!==null){
            res.redirect(`/folders/${folderId}`)
        }else{
            res.redirect("/")
        }
    }catch(err){
        next(err)
    }
}

async function deleteFile(req,res,next){
    try{
        // /files/:id/delete
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"No such file."})
        const file=await db.getFileById(id)
        if(!file||file.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your file."})
        await deleteFromCloudinary(file.cloudinaryId)
        await db.removeFile(id)
        if(file.folderId!==null){
            res.redirect(`/folders/${file.folderId}`)
        }else{
            res.redirect("/")
        }
    }catch(err){
        next(err)
    }
    
}

async function getFileDetails(req,res,next){
    // /files/:id
    try{
        const id=parseInt(req.params.id)
        if(isNaN(id))return res.status(404).render("error",{title:"Not found",message:"No such file."})
        const file=await db.getFileById(id)
        if(!file||file.userId!==req.user.id)return res.status(403).render("error",{title:"Forbidden",message:"It's not your file."})
        res.render("files/details",{title:"File Details",
            file
        })
    }catch(err){
        next(err)
    }
}


module.exports={
    getCreateFileForm,getFileDetails,postCreateFile,deleteFile

}