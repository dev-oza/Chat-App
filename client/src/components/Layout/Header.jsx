import { AppBar, Backdrop, Badge, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { lazy, Suspense, useState } from 'react'
import { orange } from "../../constants/color"
import { Menu as MenuIcon, Search as SearchIcon, Add as AddIcon, Group as GroupIcon, Logout as LogoutIcon, Notifications as NotificationsIcon } from "@mui/icons-material"
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { server } from '../../constants/config'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { userNotExists } from '../../redux/reducer/auth'
import { setIsMobile, setIsSearch, setIsNotification, setIsNewGroup } from "../../redux/reducer/misc"
import { resetNotificationCount } from "../../redux/reducer/chat";

const SearchDialog = lazy(() => import("../specific/Search"));
const NotificationsDialog = lazy(() => import("../specific/Notifications"));
const NewGroupsDialog = lazy(() => import("../specific/NewGroups"));


const IconBtn = ({ title, icon, onClick, value }) => {
    return (
    <Tooltip title={title} >
        <IconButton color="inherit" size="large" onClick={onClick}>
            { value? <Badge badgeContent={value} color='error'>{icon}</Badge>: icon }
        </IconButton>
    </Tooltip>
    )
}

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {isSearch, isNotification, isNewGroup} = useSelector(state => state.misc);
    const { notificationCount } = useSelector((state) => state.chat);

    const handleMobile = () => dispatch(setIsMobile(true));
    
    const openSearch = () => dispatch(setIsSearch(true));

    const openNewGroup = () => dispatch(setIsNewGroup(true));

    const openNotification = () => {
        dispatch(setIsNotification(true));
        dispatch(resetNotificationCount(true));
    };

    const navigateToGroup = () => navigate("/groups");

    const logoutHandler = async () => {
        try {
            const {data} = await axios.get(`${server}/api/v1/user/logout`, {withCredentials: true});

            dispatch(userNotExists());
            toast.success(data.message);
        } catch (error) {
            toast.error(error?.respnse?.data?.message || "Something went wrong");
        }
    }

  return (
    <>
        <Box sx={{flexGrow:1}} height={"4rem"}>
            <AppBar position="static" sx={{bgcolor:orange}} >
                <Toolbar>
                    <Typography variant="h6" sx = {{display:{xs:"none", sm:"block"}}}>
                        Chat-App
                    </Typography>
                    <Box sx = {{display:{xs:"block", sm:"none"}}} >
                        <IconButton color="inherit" onClick={handleMobile}><MenuIcon /></IconButton>
                    </Box>
                    <Box sx={{flexGrow:1}} />
                    <Box>
                        <IconBtn title={"Search"} icon={<SearchIcon />} onClick={openSearch} />
                        <IconBtn title={"New Group"} icon={<AddIcon />} onClick={openNewGroup} />
                        <IconBtn title={"Manage Group"} icon={<GroupIcon />} onClick={navigateToGroup} />
                        <IconBtn title={"Notifications"} icon={<NotificationsIcon />} onClick={openNotification} value={notificationCount}/>
                        <IconBtn title={"Logout"} icon={<LogoutIcon />} onClick={logoutHandler} />
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>

        {
            isSearch && (
                <Suspense fallback={<Backdrop open />} >
                    <SearchDialog />
                </Suspense>
            )
        }
        {
            isNotification && (
                <Suspense fallback={<Backdrop open />} >
                    <NotificationsDialog />
                </Suspense>
            )
        }
        {            isNewGroup && (
                <Suspense fallback={<Backdrop open />} >
                    <NewGroupsDialog />
                </Suspense>
            )
        }
    </>
  )
}

export default Header;