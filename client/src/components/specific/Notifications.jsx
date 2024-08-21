import {
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  ListItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation, useErrors } from "../../hooks/hooks";
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from "../../redux/api/api";
import { setIsNotification } from "../../redux/reducer/misc";
const Notifications = () => {

  const dispatch = useDispatch();
  const {isNotification} = useSelector(state => state.misc);
  const {isLoading, data, error, isError} = useGetNotificationsQuery()
  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation);

  const freiendRequesthandler = async({ _id, accept }) => {
    dispatch(setIsNotification(false));
    acceptRequest("Accepting...", {requestId: _id, accept});
  };

  useErrors([{error, isError}]);

  const closeHandler = () => dispatch(setIsNotification(false));
  return (
    <Dialog open={isNotification} onClose={closeHandler}>
      <Stack p={{ xs: "1rem", sm: "2rem" }} maxWidth={"25rem"}>
        <DialogTitle>Notifications</DialogTitle>
        {
          isLoading ? (<Skeleton />) : (
            <>
              {data?.allRequests.length > 0 ? (
                data?.allRequests.map(({ sender, _id }) => (
                  <NotificationsItems
                    sender={sender}
                    _id={_id}
                    handler={freiendRequesthandler}
                    key={_id}
                  />
                ))
              ) : (
                <Typography textAlign={"center"}>0 Notifications</Typography>
              )}
            </>
          )
        }
      </Stack>
    </Dialog>
  );
};

// eslint-disable-next-line react/display-name
const NotificationsItems = memo(({ sender, _id, handler }) => {
  const { avatar, name } = sender;

  return (
    <ListItem>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}
      >
        <Avatar src={avatar} />
        <Typography
          variant="body1"
          sx={{
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            width: "100%",
          }}
        >{`${name} sent a friend request.`}</Typography>
        <Stack direction={{ xs: "column", sm: "row" }}>
          <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
          <Button color="error" onClick={() => handler({ _id, accept: false })}>
            Reject
          </Button>
        </Stack>
      </Stack>
    </ListItem>
  );
});

export default Notifications;
