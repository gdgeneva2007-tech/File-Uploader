const express=require('express')
const router=express.Router()
const folderController=require("../controllers/folderController")
const {postCreateShareFolder,postRemoveShareFolder}=require("../controllers/shareController")
const {ensureLoggedIn}=require("../middleware/auth")

router.get("/new",ensureLoggedIn,folderController.getCreateFolderForm)
router.post("/new",ensureLoggedIn,folderController.postCreateFolder)
router.get("/:id",ensureLoggedIn,folderController.getFolderDetail)
router.get("/:id/edit",ensureLoggedIn,folderController.getRenameFolderForm)
router.post("/:id/edit",ensureLoggedIn,folderController.postRenameFolder)
router.post("/:id/delete",ensureLoggedIn,folderController.deleteFolder)
router.post("/:id/share",ensureLoggedIn,postCreateShareFolder)
router.post("/:id/unshare",ensureLoggedIn,postRemoveShareFolder)

module.exports=router