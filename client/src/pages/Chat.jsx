import React, { useCallback, useEffect, useRef, useState } from "react";
import AppLayout from "../components/Layout/AppLayout";
import { IconButton, Skeleton, Stack, Typography, Box } from "@mui/material";
import { grayColor, orange } from "../constants/color";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { InputBox } from "../components/styles/StyledComponents";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import { getSocket } from "../socket";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from "../constants/event";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hooks";
import { useInfiniteScrollTop } from "6pp";
import { useDispatch } from "react-redux";
import { setIsFileMenu } from "../redux/reducer/misc";
import { removeNewMessagesAlert } from "../redux/reducer/chat";
import { TypingLoader } from "../components/Layout/Loaders";
import { useNavigate } from "react-router-dom";

// Utility function to group messages by date
const groupMessagesByDate = (messages) => {
  return messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString("en-GB"); // Format date as "DD/MM/YYYY"
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
};

const Chat = ({ chatId, user }) => {
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const members = chatDetails?.data?.chat?.members;

  const messageOnChangeHandler = (e) => {
    setMessage(e.target.value);
    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, 2000);
  };

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Emitting message to server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "user._id",
          name: "user.name",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandlers = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, eventHandlers);
  useErrors(errors);

  // Combine and group messages
  const allMessages = [...oldMessages, ...messages];
  const groupedMessages = groupMessagesByDate(allMessages);

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <>
      <Stack bgcolor={grayColor} height={"90%"}>
        {Object.keys(groupedMessages).map((date) => (
          <div key={date} >
            {/* Date Header Box */}
            <Box
              sx={{
                textAlign: "center",
                padding: "0.5rem",
                backgroundColor: grayColor,
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "0.875rem",
                color: "text.secondary",
                width: "10rem",
                align: "center",
                // margin:"1rem 0"
                margin: "1rem auto",
              }}
            >
              {date} {/* Display the date */}
            </Box>
            <Stack
              ref={containerRef}
              boxSizing={"border-box"}
              padding={"1rem"}
              spacing={"1rem"}
              sx={{
                overflowX: "hidden",
                overflowY: "auto",
              }}
            >
              {groupedMessages[date].map((message) => (
                <MessageComponent
                  key={message._id}
                  message={message}
                  user={user}
                />
              ))}
              {userTyping && <TypingLoader />}
              <div ref={bottomRef} />
            </Stack>
          </div>
        ))}
      </Stack>
      <form
        style={{
          height: "10%",
        }}
        onSubmit={submitHandler}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: "1.5rem",
              rotate: "30deg",
            }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>
          <InputBox
            placeholder="Type Message here"
            value={message}
            onChange={messageOnChangeHandler}
            sx={{
              paddingLeft: "3rem",
            }}
          />
          <IconButton
            type="submit"
            sx={{
              backgroundColor: orange,
              color: "white",
              marginLeft: "0.5rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>
      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
    </>
  );
};

export default AppLayout()(Chat);
