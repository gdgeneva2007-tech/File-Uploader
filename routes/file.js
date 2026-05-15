const express=require("express")
const router=express.Router()
const {ensureLoggedIn}=require("../middleware/auth")

const upload=require("../middleware/upload")
const multer=require("multer")

const fileController=require("../controllers/fileController")

router.get("/upload",ensureLoggedIn,fileController.getCreateFileForm)

router.post(
    "/upload",
    ensureLoggedIn,
    (req,res,next)=>{
        upload.single("file")(req,res,(err)=>{
            if(err instanceof multer.MulterError){
                //Built-in multer error (fiel too large etc.)
                if(err.code==='LIMIT_FILE_SIZE'){
                    return res.render("files/form",{
                        title:"Upload file",
                        error:"File is too large. Maximum size is 5MB",
                        folderId:req.body.folderId||null
                    })
                }
                return res.render("files/form",{
                    title:"Upload file",
                    error:err.message,
                    folderId:req.body.folderId||null
                })
            }else if(err){
                // Our custom fileFilter error
                return res.render("files/form",{
                    title:"Upload file",
                    error:err.message,
                    albumId:req.body.folderId||null
                })
            }
            // No error - go to controller
            next()
        })
    },
    fileController.postCreateFile
)

router.get("/:id",ensureLoggedIn,fileController.getFileDetails)
router.post("/:id/delete",ensureLoggedIn,fileController.deleteFile)
module.exports=router