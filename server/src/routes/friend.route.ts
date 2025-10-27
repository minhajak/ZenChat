import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  acceptFriendRequest,
  addFriendRequest,
  getInvites,
  getSuggestions,
  rejectFriendRequest,
} from "../controllers/friend.controller";

const router = express.Router();


//add friend request
router.post("/:receiverId", authMiddleware, addFriendRequest);

//accept friend request
router.put("/:senderId", authMiddleware, acceptFriendRequest);


//reject friend request

router.put("/reject/:senderId",authMiddleware,rejectFriendRequest)
// get invites 

router.get("/invites",authMiddleware,getInvites)

// friends suggestions
router.get('/suggestions',authMiddleware,getSuggestions)
export default router;
