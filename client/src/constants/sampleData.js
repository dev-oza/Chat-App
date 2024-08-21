export const sampleChats = [
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Klaus Mikaelson",
    _id:"1",
    groupChat:false,
    members:["1","2","3","4","5","6"],
},
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Billy Butcher",
    _id:"2",
    groupChat:false,
    members:["1","2","3","4","5","6"],
},
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Jon Snow",
    _id:"3",
    groupChat:false,
    members:["1","2","3","4","5","6"],
},
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Elliot Alderson",
    _id:"4",
    groupChat:false,
    members:["1","2","3","4","5","6"],
},
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Marty Byrde",
    _id:"5",
    groupChat:false,
    members:["1","2","3","4","5","6"],
},
{
    avatar:["https://www.w3schools.com/howto/img_avatar.png"],
    name:"Dexter Morgan",
    _id:"6",
    groupChat:false,
    members:["1","2","3","4","5","6"],
}
]


export const sampleUsers = [
    {
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Klaus Mikaelson",
        _id:"1",
    },
    {
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Billy Butcher",
        _id:"2",
    },
    {
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Jon Snow",
        _id:"3",
    },
    {
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Elliot Alderson",
        _id:"4",
    },
    {
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Marty Byrde",
        _id:"5",
    },
    {
        avatar:["https://www.w3schools.com/howto/img_avatar.png"],
        name:"Dexter Morgan",
        _id:"6",
    }
]

export const sampleNotifications = [
    {
        sender:{
            avatar:["https://www.w3schools.com/howto/img_avatar.png"],
            name:"Klaus Mikaelson",
        },
        _id:"1",
    },
    {
        sender:{
            avatar:["https://www.w3schools.com/howto/img_avatar.png"],
            name:"Billy Butcher",
        },
        _id:"2",
    },
    {
        sender:{
            avatar:["https://www.w3schools.com/howto/img_avatar.png"],
            name:"Jon Snow",
        },
        _id:"3",
    },
    {
        sender:{
            avatar:["https://www.w3schools.com/howto/img_avatar.png"],
            name:"Elliot Alderson",
        },
        _id:"4",
    },
    {
        sender:{
            avatar:["https://www.w3schools.com/howto/img_avatar.png"],
            name:"Marty Byrde",
        },
        _id:"5",
    },
    {
        sender:{
            avatar:["https://www.w3schools.com/howto/img_avatar.png"],
            name:"Dexter Morgan",
        },
        _id:"6",
    }
]


export const sampleMessage =[
    {
        attachments:[
            {
                public_id: "public_id_1",
                url:"https://www.w3schools.com/howto/img_avatar.png",
            },
        ],
        content:"how are you",
        _id: "id_of_user_1",
        sender:{
            _id: "user_id_1",
            name: "sender_1",
        },
        chat: "chatId1",
        createdAt: "2024-02-12T10:41:30.630Z",
    },
    {
        attachments:[
            {
                public_id: "public_id_2",
                url:"https://www.w3schools.com/howto/img_avatar.png",
            },
        ],
        content:"I am fine",
        _id: "id_of_user_2",
        sender:{
            _id: "user_id_2",
            name: "sender_2",
        },
        chat: "chatId2",
        createdAt: "2024-02-12T10:50:30.630Z",
    },
] ;

export const dashboardData = {
    users:[
        {
            name:"Klaus Mikaelson",
            avatar:"https://www.w3schools.com/howto/img_avatar.png",
            _id:"1",
            username:"klaus_mikaelson",
            friends: 20,
            groups: 5,
        },
        {
            name:"Billy Butcher",
            avatar:"https://www.w3schools.com/howto/img_avatar.png",
            _id:"2",
            username:"billy_butcher",
            friends: 45,
            groups: 2,
        },
        {
            name:"Jon Snow",
            avatar:"https://www.w3schools.com/howto/img_avatar.png",
            _id:"3",
            username:"jon_snow",
            friends: 70,
            groups: 20,
        },
        {
            name:"Elliot Alderson",
            avatar:"https://www.w3schools.com/howto/img_avatar.png",
            _id:"4",
            username:"elliot_lderson",
            friends: 5,
            groups: 1,
        },
        {
            name:"Marty Byrde",
            avatar:"https://www.w3schools.com/howto/img_avatar.png",
            _id:"5",
            username:"marty_byrde",
            friends: 40,
            groups: 30,
        },
        {
            name:"Dexter Morgan",
            avatar:"https://www.w3schools.com/howto/img_avatar.png",
            _id:"6",
            username:"dexter_morgan",
            friends: 10,
            groups: 30,
        }
    ],
    chats: [
        {
          name: "LabadBass Group",
          avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
          _id: "1",
          groupChat: false,
          members: [
            { _id: "1", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
            { _id: "2", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
          ],
          totalMembers: 2,
          totalMessages: 20,
          creator: {
            name: "John Doe",
            avatar: "https://www.w3schools.com/howto/img_avatar.png",
          },
        },
        {
          name: "L*Da Luston Group",
          avatar: ["https://www.w3schools.com/howto/img_avatar.png"],
          _id: "2",
          groupChat: true,
          members: [
            { _id: "1", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
            { _id: "2", avatar: "https://www.w3schools.com/howto/img_avatar.png" },
          ],
          totalMembers: 2,
          totalMessages: 20,
          creator: {
            name: "John Boi",
            avatar: "https://www.w3schools.com/howto/img_avatar.png",
          },
        },
      ],
    
      messages: [
        {
          attachments: [],
          content: "L*uda ka Message hai",
          _id: "sfnsdjkfsdnfkjsbnd",
          sender: {
            avatar: "https://www.w3schools.com/howto/img_avatar.png",
            name: "Chaman ",
          },
          chat: "chatId",
          groupChat: false,
          createdAt: "2024-02-12T10:41:30.630Z",
        },
    
        {
          attachments: [
            {
              public_id: "asdsad 2",
              url: "https://www.w3schools.com/howto/img_avatar.png",
            },
          ],
          content: "",
          _id: "sfnsdjkfsdnfkdddjsbnd",
          sender: {
            avatar: "https://www.w3schools.com/howto/img_avatar.png",
            name: "Chaman  2",
          },
          chat: "chatId",
          groupChat: true,
          createdAt: "2024-02-12T10:41:30.630Z",
        },
      ],
}