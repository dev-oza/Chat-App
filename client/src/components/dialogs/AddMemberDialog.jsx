import { Button, Dialog, DialogTitle, Skeleton, Stack, Typography } from '@mui/material'
import React, { useState } from 'react'
import { sampleUsers } from '../../constants/sampleData'
import UserItem from "../shared/UserItem"
import { useAsyncMutation, useErrors } from '../../hooks/hooks'
import { useAddGroupMemberMutation, useAvailableFriendsQuery, useChatDetailsQuery } from '../../redux/api/api'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAddMember } from '../../redux/reducer/misc'

const AddMemberDialog = ({chatId}) => {
    const dispatch = useDispatch();
    
    const [selectedMembers, setSelectedMembers] = useState([]);

    const {isAddMember} = useSelector(state=>state.misc)

    const [addMember, isLoadingAddMember] = useAsyncMutation(useAddGroupMemberMutation)
    // const groupDetails = useChatDetailsQuery({chatId, populate: true}, {skip: !chatId})
    const {isError, isLoading, error, data} = useAvailableFriendsQuery(chatId);
  
    const selectMemberHandler = (id) => {
      setSelectedMembers((prev) => (prev.includes(id)? prev.filter((currElement) => currElement!=id ) : [...prev, id]))
    }

    const addMemberSubmitHandler = () => {
        addMember("Adding members...", {members:selectedMembers, chatId});
        closeHandler();
    }

    const closeHandler= () => dispatch(setIsAddMember(false));

    useErrors([{isError, error}]);

  return (
    <Dialog open={isAddMember} onClose={closeHandler}>
        <Stack p={"2rem"} width={"25rem"} spacing={"2rem"}>
            <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
            <Stack spacing={"1rem"}>
                {
                    isLoading ? (<Skeleton />) : (
                        data?.friends?.length > 0 ? data?.friends?.map(user => (
                            <UserItem key={user._id} user={user} handler={selectMemberHandler} isAdded={selectedMembers.includes(user._id)}/>
                        )) : (
                            <Typography textAlign={"center"}>No Friends</Typography>
                        )
                    )
                }
            </Stack>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-evenly"} spacing={"1rem"}>
                <Button onClick={closeHandler} color="error" variant='contained' >Cancel</Button>
                <Button onClick={addMemberSubmitHandler} variant="contained" disabled={isLoadingAddMember}>Submit Changes</Button>
            </Stack>
        </Stack>
    </Dialog>
  )
}

export default AddMemberDialog