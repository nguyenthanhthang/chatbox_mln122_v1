import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../../components/common";
import { formatDate } from "../../utils/helpers";

const Chat: React.FC = () => {
  const { chats, isLoading, error, selectChat } = useChat();
  const { user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Đang tải danh sách chat..." />;
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">Lỗi: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" component="h1" sx={{ p: 2, pb: 1 }}>
        Chats
      </Typography>

      <Paper sx={{ flex: 1, overflow: "hidden" }}>
        <List sx={{ height: "100%", overflow: "auto" }}>
          {chats.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Chưa có cuộc trò chuyện nào"
                secondary="Tạo chat mới để bắt đầu trò chuyện"
              />
            </ListItem>
          ) : (
            chats.map((chat, index) => (
              <React.Fragment key={chat._id}>
                <ListItem
                  button
                  onClick={() => selectChat(chat._id)}
                  sx={{
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={chat.avatar} alt={chat.name}>
                      {chat.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.name}
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {chat.lastMessage?.content || "Chưa có tin nhắn"}
                        </Typography>
                        {chat.lastMessageAt && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {formatDate(chat.lastMessageAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                {index < chats.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Chat;
