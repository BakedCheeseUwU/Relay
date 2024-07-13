"use client";

import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { chatHrefConstructor } from "@/lib/utils";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2
              text-sm leading-6 font-semibold"
            >
              {friend.name}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
