const express=require("express")
const router=express.Router()
const {getSharedFolder}=require("../controllers/shareController")
router.get("/:id",getSharedFolder)
module.exports=router