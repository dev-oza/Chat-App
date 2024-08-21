import { Drawer, Grid, Skeleton } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
} from "../../constants/event";
import { useErrors, useSocketEvents } from "../../hooks/hooks";
import { getOrSaveFromStorage } from "../../lib/features";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  incrementNotificaion,
  setNewMessagesAlert,
} from "../../redux/reducer/chat";
import {
  setIsDeleteMenu,
  setIsMobile,
  setIsSelectedDeleteChat,
} from "../../redux/reducer/misc";
import { getSocket } from "../../socket";
import DeleteChatMenu from "../dialogs/DeleteChatMenu";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import Header from "./Header";

const AppLayout = () => (WrappedComponent) => {
  // eslint-disable-next-line react/display-name
  return (props) => {
    const params = useParams();
    const navigate = useNavigate();
    const chatId = params.chatId;
    const dispatch = useDispatch();

    const deleteMenuAnchor = useRef(null);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const socket = getSocket();

    const { isMobile } = useSelector((state) => state.misc);
    const { user } = useSelector((state) => state.auth);
    const { newMessagesAlert } = useSelector((state) => state.chat);

    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

    useErrors([{ isError, error }]);

    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setIsSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget;
    };

    const handleMobileClose = () => dispatch(setIsMobile(false));

    const newMessagesAlertListener = useCallback(
      (data) => {
        if (data.chatId === chatId) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatId]
    );

    const newRequestListener = useCallback(
      (data) => {
        dispatch(incrementNotificaion(data));
      },
      [dispatch]
    );

    const refetchListener = useCallback(
      (data) => {
        refetch();
        navigate("/");
      },
      [refetch, navigate]
    );

    const onlineUsersListener = useCallback((data) => {
      setOnlineUsers(data);
    }, []);

    const eventHandlers = {
      [NEW_REQUEST]: newRequestListener,
      [NEW_MESSAGE_ALERT]: newMessagesAlertListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

    useSocketEvents(socket, eventHandlers);

    return (
      <>
        <Title />
        <div>
          <Header />
        </div>
        <DeleteChatMenu
          dispatch={dispatch}
          deleteMenuAnchor={deleteMenuAnchor}
        />
        <div>
          {isLoading ? (
            <Skeleton />
          ) : (
            <Drawer open={isMobile} onClose={handleMobileClose}>
              <ChatList
                w="70vw"
                chats={data?.chats}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                onlineUsers={onlineUsers}
              />
            </Drawer>
          )}
          <Grid container sx={{ height: "calc(100vh - 4rem)"}} spacing="1rem">
            <Grid
              item
              sm={4}
              md={3}
              lg={3}
              sx={{ display: { xs: "none", sm: "block" }, paddingLeft: "0" }}
              height={"100%"}
            >
              {isLoading ? (
                <Skeleton />
              ) : (
                <ChatList
                  chats={data?.chats}
                  chatId={chatId}
                  handleDeleteChat={handleDeleteChat}
                  newMessagesAlert={newMessagesAlert}
                  onlineUsers={onlineUsers}
                />
              )}
            </Grid>
            <Grid
              item
              xs={12}
              sm={8}
              md={5}
              lg={6}
              height={"100%"}
              sx={{ paddingLeft: "0" }}
            >
              <WrappedComponent {...props} chatId={chatId} user={user} />
            </Grid>
            <Grid
              item
              md={4}
              lg={3}
              height={"100%"}
              marginTop={2}
              sx={{
                display: { xs: "none", md: "block" },
                padding: "2rem",
                paddingLeft: "0rem",
                bgcolor: "rgba(0,0,0,0.85)",
              }}
            >
              <Profile user={user} />
            </Grid>
          </Grid>
        </div>
      </>
    );
  };
};

export default AppLayout;
