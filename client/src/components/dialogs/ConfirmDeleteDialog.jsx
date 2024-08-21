import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import React from 'react'

const ConfirmDeleteDialog = ({open, handleClose, delteHandler}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to delete this group?
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>No</Button>
            <Button onClick={delteHandler} color='error' >Yes</Button>
        </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeleteDialog