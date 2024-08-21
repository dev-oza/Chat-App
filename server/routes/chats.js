import express from "express";
import { addMembers, deleteChat, getChatDetails, getMessages, getMyChats, getMyGroups, leaveGroup, newGroupChat, removeMember, renameGroup, sendAttachments } from "../controllers/chats.js";
import { addMemberValidator, chatIdValidator, newGroupValidator, removeMemberValidator, renameValidator, sendAttachmentsValidator, validateHandler } from "../lib/validators.js";
import { isAuthenticate } from "../middlewares/auth.js";
import { attachmentsMulter } from "../middlewares/multer.js";

const app = express.Router();

//After here user must be logged in to access these routes
app.use(isAuthenticate);

app.post("/new", newGroupValidator(), validateHandler, newGroupChat);
app.get("/my", getMyChats);
app.get("/my/groups", getMyGroups);

app.put("/add-members", addMemberValidator(), validateHandler, addMembers);
app.put("/remove-members", removeMemberValidator(), validateHandler, removeMember);
app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup)

//send attachment
app.post("/message", attachmentsMulter, sendAttachmentsValidator(), validateHandler, sendAttachments );

//get messages
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages)

//get chat details, rename, delete
app.route("/:id").get(chatIdValidator(), validateHandler, getChatDetails).put(renameValidator(), validateHandler, renameGroup).delete(chatIdValidator(), validateHandler, deleteChat);

export default app;