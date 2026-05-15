const db=require("../db/queries")
async function getSharedFolder(req,res,next){
    const shareId=req.params.id
    if(!shareId)return res.status(404).render("error",{title:"Not found",message:"Not found"})
    const folder=await db.getFolderByShareId(shareId)
    if(!folder||new Date()>new Date(folder.shareExpiry)){
        return res.status(403).render("error",{
            title:"Forbidden",
            message:"Share link is invalid or has expired"
        })
    }
    res.render("share/details",{
        title:"Shared folder",
        folder
    })
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

module.exports={
    getSharedFolder,
    postCreateShareFolder,
    postRemoveShareFolder,
}