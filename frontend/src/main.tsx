import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import HomePage from "./app/home/HomePage.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlayWithFriendsPage from "./app/play-with-friends/PlayWithFriendsPage.tsx";
import RoomPage from "./app/room/[roomId]/RoomPage.tsx";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/play-with-friends" element={<PlayWithFriendsPage />} />

        <Route path="/play-with-friends/room/:roomId" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>,
);
