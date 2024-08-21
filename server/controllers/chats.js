import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js"
import { deleteFilesFromCloudinary, emitEvent, uploadFilesToCloudinary } from "../utils/features.js";
import { ALERT, NEW_ATTACHMENT, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMembers } from "../lib/helper.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";


const newGroupChat = TryCatch(async (req, res, next) => {
    const { name, members } = req.body;

    const allMembers = [...members, req.user];

    await Chat.create({name, groupChat: true, creator: req.user, members: allMembers});

    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group chat`);
    emitEvent(req, REFETCH_CHATS, members);

    return res.status(201).send({
        success:true,
        message: "Group chat created successfully"
    })
});

const getMyChats = TryCatch(async (req, res, next) => {
    const chats = await Chat.find({members: req.user}).populate("members", "name avatar");
    
    const transformedChats = chats.map(({ _id, name, members, groupChat}) => {
        const otherMembers = getOtherMembers(members, req.user);
        
        return {
            _id,
            groupChat,
            avatar: groupChat ? (members.slice(0,3).map(({avatar}) => (avatar?.url))) : ([otherMembers[0]?.avatar?.url]),
            name: groupChat ? name : otherMembers[0].name,
            members: members.reduce((prev, curr) => {
                if(curr._id.toString() !== req.user.toString()) prev.push(curr._id);

                return prev;
            },[]),
        }
    })

    return res.status(200).send({
        success: true,
        chats: transformedChats
    })
})

const getMyGroups = TryCatch(async (req, res,next) => {
    const chats = await Chat.find({members: req.user, groupChat: true, creator: req.user}).populate("members", "name avatar");

    const groupChat = chats.map(({members, _id, name, groupChat}) => ({
        _id, name, groupChat,
        avatar: members.slice(0,3).map(({avatar}) => avatar.url),
    }));

    return res.status(200).send({
        success: true,
        groups: groupChat
    })
})

const addMembers = TryCatch(async (req, res,next) => {
    const { chatId, members } = req.body;

    // Fetch users and validate existence
    const userPromises = members.map(id => User.findById(id));
    const users = await Promise.all(userPromises);
    
    const invalidUsers = users.filter(user => !user);
    if (invalidUsers.length > 0) {
        return next(new ErrorHandler("One or more users do not exist", 400));
    }

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404));
    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));
    if(chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not allowed to add members",403));

    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));
    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers.filter((i) => (!chat.members.includes(i._id.toString())));

    chat.members.push(...uniqueMembers);

    if(chat.members.length>100) return next(new ErrorHandler("Group members limit reached",400));

    await chat.save();

    const allUsersName = allNewMembers.map((i) => i.name).join(", ");

    emitEvent(req, ALERT, chat.members, `${allUsersName} added to the group`);
    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).send({
        success: true,
        members: "Members added succssfully"
    })
})

const removeMember = TryCatch(async (req, res,next) => {
    const { chatId, userId } = req.body;

    const [chat,userToRemove] = await Promise.all([Chat.findById(chatId), User.findById(userId,"name")]);

    if(!userToRemove) return next(new ErrorHandler("User not found",404));
    if(!chat) return next(new ErrorHandler("Chat not found", 404));
    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));
    if(chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not allowed to add members",403));

    if(chat.members.length <= 3) return next(new ErrorHandler("Group must have atleast 3 members",400));

    const allChatMembers = chat.members.map((i) => i.toString());

    chat.members = chat.members.filter(i => i.toString() !== userId.toString());
    await chat.save();
    
    emitEvent(req, ALERT, chat.members, `${userToRemove.name} removed from the group`);
    emitEvent(req, REFETCH_CHATS, allChatMembers);

    return res.status(200).send({
        success: true,
        members: "Member removed succssfully"
    })
})

const leaveGroup = TryCatch(async (req, res,next) => {
    const chatId = req.params.id;
    
    const chat = await Chat.findById(chatId);
    if(!chat) return next(new ErrorHandler("Chat not found", 404));
    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));

    const remainingMembers = chat.members.filter((i) => i.toString() !== req.user.toString());
    if(remainingMembers.length <= 2) return next(new ErrorHandler("Group must have atleast 3 members", 400));

    if(chat.creator.toString() === req.user.toString()) chat.creator = remainingMembers[0];

    chat.members = remainingMembers;

    const [user] = await Promise.all([User.findById(req.user, "name"), chat.save()]);
  
    emitEvent(req, ALERT, chat.members, {message:`${user} left the group`, chatId});

    return res.status(200).send({
        success: true,
        members: "Group left successfully"
    })
})

const sendAttachments = TryCatch(async (req, res,next) => {
    const {chatId} = req.body;

    const files = req.files || [];
    if(files.length<1) return next(new ErrorHandler("Please upload attachements",400))
    if(files.length>5) return next(new ErrorHandler("Files to send can't be more than 5",400))

    const [chat, me] = await Promise.all([Chat.findById(chatId), User.findById(req.user, "name")]);
    if(!chat) return next(new ErrorHandler("Chat not found", 404));

    if(files.length < 1) return next(new ErrorHandler("Please select attachments",400));

    //Upload files here
    const attachments = await uploadFilesToCloudinary(files);
    
    const messageForDB = {
        content: "",
        attachments,
        sender: req.user,
        chat: chatId,
    };

    const messageForRealTime = {
        ...messageForDB,
        sender: {
            _id: me.id,
            name: me.name,
        },
    };

    const message = await Message.create(messageForDB);
    
    emitEvent(req, NEW_MESSAGE, chat.members, {message: messageForRealTime, chatId});
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {chatId, message:"Attachments sent successfully"});

    return res.status(200).send({
        success: true,
        message,
    })
})

const getChatDetails = TryCatch(async(req, res, next) => {
    if(req.query.populate === "true"){
        const chat = await Chat.findById(req.params.id).populate("members", "name avatar").lean();
        if(!chat) return next(new ErrorHandler("Chat not found", 404));

        chat.members = chat.members.map(({_id, name, avatar}) => ({_id, name, avatar: avatar.url}))

        return res.status(200).json({
            success: true,
            chat,
        });
    } else {
        const chat = await Chat.findById(req.params.id);
        if(!chat) return next(new ErrorHandler("Chat not found", 404));

        return res.status(200).json({
            success: true,
            chat,
        })
    }
});

const renameGroup = TryCatch(async(req, res, next) => {
    const chatId = req.params.id;
    const {name} = req.body;
    
    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404));
    if(!chat.groupChat) return next(new ErrorHandler("This is not a group chat",400));
    if(chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not allowed to rename group",403));

    chat.name = name;

    await chat.save();

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        succss: true,
        message: "Group renamed successfully"
    })
});

const deleteChat = TryCatch(async(req, res, next) => {
    const chatId = req.params.id;
    
    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404));

    const members = chat.members;

    if(chat.groupChat && chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler("You are not allowed to delete this group", 403));

    if(!chat.groupChat && !chat.members.includes(req.user.toString())) return next(new ErrorHandler("You are not allowed to delete this group", 403));

    //here we have to delete all messages as well as attachments or files from cloudinary
    const messagesWithAttachments = await Chat.find({chat: chatId, attachments: {$exists: true, $ne:[]}});;

    const publicIds = [];
    
    messagesWithAttachments.forEach(({attachment}) => {
        attachment.forEach(({public_id}) =>  publicIds.push(public_id) );
    })

    await Promise.all([
        deleteFilesFromCloudinary(publicIds),
        chat.deleteOne(),
        Message.deleteMany({ chat: chatId}),
    ]);

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success:true,
        message: "Chat deleted successfully"
    })
});

const getMessages = TryCatch(async(req, res, next) => {
    const chatId = req.params.id;
    
    const {page=1} = req.query;
    const resultsPerPage = 20;
    const skip = (page-1) * resultsPerPage;
    
    const chat = await Chat.findById(chatId);
    if(!chat) return next(new ErrorHandler("Chat not found"));
    if(!chat.members.includes(req.user.toString())) return next(new ErrorHandler("You are not allowed to access this chat", 403))
    
    const [messages, totalmessagesCount] = await Promise.all([
        Message.find({chat: chatId}).sort({createdAt: -1}).skip(skip).limit(resultsPerPage).populate("sender", "name").lean(), 
        Message.countDocuments({chat:chatId}) 
    ]);

    const totalPages = Math.ceil(totalmessagesCount / resultsPerPage) || 0;

    return res.status(200).json({
        success: true,
        messages: messages.reverse(),
        totalPages,
    })
})

export { newGroupChat, getMyChats, getMyGroups, addMembers, removeMember, leaveGroup, sendAttachments, getChatDetails, renameGroup, deleteChat, getMessages };