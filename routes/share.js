const express=require("express")
const router=express.Router()
const shareController=require("../controllers/shareController")
router.get("/:id",shareController.getSharedFolder)
router.get("/:shareId/folders/:folderId",shareController.getNestedFolder)
router.get("/:shareId/files/:fileId",shareController.getNestedFile)
module.exports=router

