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
  ListItemButton,
} from "@mui/material";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../../components/common";
import { formatDate } from "../../utils/helpers";

const Chat: React.FC = () => {
  const { sessions, sessionsLoading, loadSession } = useChat();

  if (sessionsLoading) {
    return <LoadingSpinner message="Đang tải danh sách chat..." />;
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h5" component="h1" sx={{ p: 2, pb: 1 }}>
        Chats
      </Typography>

      <Paper sx={{ flex: 1, overflow: "hidden" }}>
        <List sx={{ height: "100%", overflow: "auto" }}>
          {sessions.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="Chưa có cuộc trò chuyện nào"
                secondary="Tạo chat mới để bắt đầu trò chuyện"
              />
            </ListItem>
          ) : (
            sessions.map((session, index) => (
              <React.Fragment key={session.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => loadSession(session.id)}>
                    <ListItemAvatar>
                      <Avatar>{session.title.charAt(0).toUpperCase()}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={session.title}
                      secondary={
                        <Box>
                          {session.lastMessageAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {formatDate(session.lastMessageAt)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < sessions.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Chat;
