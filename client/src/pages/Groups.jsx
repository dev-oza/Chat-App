import { Add as AddIcon, Delete as DeleteIcon, Done as DoneIcon, Edit as EditIcon, KeyboardBackspace as KeyboardBackspaceIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Backdrop, Box, Button, CircularProgress, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import React, { lazy, memo, Suspense, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutLoader } from '../components/Layout/Loaders';
import AvatarCard from "../components/shared/AvatarCard";
import UserItem from '../components/shared/UserItem';
import { Link } from "../components/styles/StyledComponents";
import { bgGradient, mattBlack } from "../constants/color";
import { useAsyncMutation, useErrors } from '../hooks/hooks';
import { useChatDetailsQuery, useDeleteChatMutation, useMyGroupsQuery, useRemoveGroupMemberMutation, useRenameGroupMutation } from '../redux/api/api';
import { setIsAddMember } from '../redux/reducer/misc';

const ConfirmDeleteDialog = lazy(() => import("../components/dialogs/ConfirmDeleteDialog"));
const AddMemberDialog = lazy(() => import("../components/dialogs/AddMemberDialog"));

const Groups = () => {
  const navigate = useNavigate();
  const chatId = useSearchParams()[0].get("group");
  const dispatch = useDispatch();

  const {isAddMember} = useSelector(state=>state.misc)

  const myGroups = useMyGroupsQuery();

  const groupDetails = useChatDetailsQuery({chatId, populate: true}, {skip: !chatId})
  
  const [updateGroup, isLoadingGroupName] = useAsyncMutation(useRenameGroupMutation)
  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(useRemoveGroupMemberMutation)
  const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(useDeleteChatMutation)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isEdit, SetIsEdit] = useState(false);
  const [grpName, setGrpName] = useState("");
  const [confirmDeleteDialog, setDeleteDialog] = useState(false);
  const [grpNameUpdatedValue, setGrpNameUpdatedValue] = useState("");
  const [members, setMembers] = useState([]);

  const errors=[
    {
      isError: myGroups.isError,
      error: myGroups.error
    },
    {
      isError: groupDetails.isError,
      error: groupDetails.error
    },
  ];

  useErrors(errors);

  useEffect(() => {
    const groupData = groupDetails.data;
    if(groupData){
      setGrpName(groupData.chat.name);
      setGrpNameUpdatedValue(groupData.chat.name);
      setMembers(groupData.chat.members);
    }

    return () => {
      setGrpName("");
      setGrpNameUpdatedValue("");
      setMembers([]);
      SetIsEdit(false);
    }
  }, [groupDetails.data])
  
  const navigateBack = () => {navigate("/")};

  const handleMobile = () => {
    setIsMobileMenuOpen(prev=>!prev);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }

  const updateGroupName = ()=>{
    SetIsEdit(false);
    updateGroup("Updating Group Name...", {chatId, name: grpNameUpdatedValue})
  }

  const openAddMemberhandler = () => {
    dispatch(setIsAddMember(true));
  };

  const openConfirmDeleteHandler = () => {
    setDeleteDialog(true);
  };

  const closeConfirmDeleteHandler = () => {
    setDeleteDialog(false);
  };

  const deleteHandler = () => {
    deleteGroup("Deleting group...", chatId)
    closeConfirmDeleteHandler();
    navigate("/groups")
  };

  const removeMemberHandler = (userId) => {
    removeMember("Removing member..." , {chatId, userId});
  }

  useEffect(()=>{
    if(chatId){
      setGrpName(`Group Name ${chatId}`);
      setGrpNameUpdatedValue(`Group Name ${chatId}`);
    }

    return()=>{
      setGrpName("");
      setGrpNameUpdatedValue("");
      SetIsEdit(false);
    }
  },[chatId])

  const IconBtns = <>
    <Box sx={{
      display:{
        xs:"block",
        sm:"none",
        position: "fixed",
        right:"1rem",
        top:"1rem"
      }
    }}
    >
    <Tooltip title={"menu"}>
      <IconButton onClick={handleMobile}>
        <MenuIcon />
      </IconButton>
    </Tooltip>
    </Box>
    <Tooltip title="Back">
      <IconButton sx={{
        position: "absolute",
        top: "2rem",
        left:"2rem",
        bgcolor:mattBlack,
        color:"white",
        ":hover":{
          bgcolor:"rgba(0,0,0,0.7)"
        }
      }}
      onClick={navigateBack}
      >
        <KeyboardBackspaceIcon />
      </IconButton>
    </Tooltip>
  </>

  const GroupName = (
  <Stack direction="row" alignItems={"center"} justifyContent={"center"} spacing={"1rem"} padding={"3rem"}>
    {
      isEdit ? (
      <>
        <TextField value={grpNameUpdatedValue} onChange={e=>setGrpNameUpdatedValue(e.target.value)} />
        <IconButton onClick={updateGroupName} disabled={isLoadingGroupName} ><DoneIcon /></IconButton>
      </>
      ) : (
      <>
        <Typography variant='h4'>{grpName}</Typography>
        <IconButton onClick={()=>SetIsEdit(true)} disabled={isLoadingGroupName}><EditIcon /></IconButton>
      </>
      )
    }
  </Stack>
  );

  const ButtonGroup = (
    <Stack
      direction={{
        xs: "column-reverse",
        sm: "row",
      }}
      spacing={"1rem"}
      p={{
        xs: "0",
        sm: "1rem",
        md: "1rem 4rem",
      }}
    >
      <Button
        size="large"
        variant='contained'
        color="error"
        startIcon={<DeleteIcon />}
        onClick={openConfirmDeleteHandler}
      >
        Delete Group
      </Button>
      <Button
        size="large"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openAddMemberhandler}
      >
        Add Member
      </Button>
    </Stack>
  );

  return myGroups.isLoading ? (<LayoutLoader /> ): (
    <Grid container height={"100vh"}>
      <Grid item sx={{
        display:{xs:"none", sm:"block"},
        }} 
        sm={4}
      >
          <GroupsList myGroups={myGroups?.data?.groups} chatId={chatId}/>
      </Grid>
      <Grid item xs={12} sm={8} sx={{
        display:"flex",
        flexDirection:"column", 
        alignItems:"center",
        position:"relative",
        padding:"1rem 3rem",
        }}
      >
        {IconBtns}
        {grpName && <>
          {GroupName}
          <Typography margin={"2rem"} alignSelf={"flex-start"} variant="body1">Members</Typography>
          <Stack
            maxWidth={"45rem"}
            width={"100%"}
            boxSizing={'border-box'}
            padding={{
              sm:"1rem",
              xs:"0",
              md:"1rem 4rem",
            }}
            spacing={"2rem"}
            height={"50vh"}
            overflow={"auto"}
          >
            {
              isLoadingRemoveMember ? <CircularProgress /> : (
                groupDetails.data.chat.members.map((user) => (
                  <UserItem key={user._id} user={user} isAdded styling={{
                    boxShadow: "0 0 0.5rem rgba(0,0,0,0.2)",
                    padding:"1rem 2rem",
                    borderRadius:"1rem",
                  }} handler={removeMemberHandler}/>
                ))
              )
            }
          </Stack>
          {ButtonGroup} 
        </>}
      </Grid>
        {
          isAddMember && <Suspense fallback={<Backdrop open />} >
            <AddMemberDialog chatId={chatId}/>
          </Suspense>
        }
        {
          confirmDeleteDialog && <Suspense fallback={<Backdrop open />}> 
          <ConfirmDeleteDialog open={confirmDeleteDialog} handleClose={closeConfirmDeleteHandler} delteHandler={deleteHandler} /> 
          </Suspense>
        }

      <Drawer sx={{
        display:{
          xs:"block",
          sm:"none",
        },
      }} open={isMobileMenuOpen} onClose={handleMobileMenuClose} >
        <GroupsList w={"50vw"} myGroups={myGroups?.data?.groups} chatId={chatId}/>
      </Drawer> 
    </Grid>
  )
};

const GroupsList = ({w="100%", myGroups=[], chatId}) => (
  <Stack width={w} sx={{backgroundImage:bgGradient}} height={"100vh"}>
    {
      myGroups.length > 0 ?myGroups.map((group) => {
        return <GroupListItem group={group} chatId={chatId} key={group._id}/>
      }) : <Typography textAlign={"center"} padding="1rem">No groups</Typography>
    }
  </Stack>
);

// eslint-disable-next-line react/display-name
const GroupListItem = memo(({group, chatId}) => {
  const {name, avatar, _id} = group;

  return (
    <Link to={`?group=${_id}`} onClick={(e)=>{if(chatId === _id) e.preventDefault();}}>
      <Stack direction="row" spacing="1rem" alignItems={"center"}>
        <AvatarCard avatar={avatar} />
        <Typography>{name}</Typography>
      </Stack>
    </Link>
  )
})



export default Groups