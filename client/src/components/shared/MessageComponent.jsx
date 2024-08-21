import { Box, Typography } from '@mui/material';
import React, { memo, useEffect } from 'react'
import { lightBlue } from '../../constants/color';
import moment from 'moment';
import { fileFormat } from '../../lib/features';
import RenderAttachment from './RenderAttachment';
import { motion } from "framer-motion";
import { useDispatch } from 'react-redux';
import { resetNotificationCount } from '../../redux/reducer/chat';

const MessageComponent = ({message, user}) => {
    const { sender, content, attachments=[], createdAt } = message;

    const sameSender = sender?._id === user?._id;

    const timeAgo = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div 
        initial={{opacity:0, x:"-100%"}}
        whileInView={{opacity: 1, x:0}}
        style={{
            alignSelf: sameSender ? "flex-end" : "flex-start",
            backgroundColor: "white",
            color: "black",
            borderRadius: "15px",
            padding: "0.5rem",
            width: "fit-content",
            minWidth:"10rem",
        }}
    >
        {
            !sameSender && <Typography color={lightBlue} fontWeight={"600"} variant="caption">{sender.name}</Typography>
        }
        {
            content && <Typography>{content}</Typography>
        }

        {
            attachments.length > 0 && attachments.map((attachment, index)=>{
                const url = attachment.url;
                const file = fileFormat(url);

                return <Box key={index}>
                    <a href={url} target="_blank" download style={{color:"black",}}>{RenderAttachment(file, url)}</a>
                </Box>
            })
        }

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
        }}>
            <Typography variant="caption" color="text.secondary" >{timeAgo}</Typography>
        </div>
    </motion.div>
  )
}

export default memo(MessageComponent)