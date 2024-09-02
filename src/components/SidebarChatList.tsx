"use client";

import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import UnseenChatToast from "@/components/UnseenChatToast";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

    const newFriendHandler = () => {
      router.refresh();
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      // user should be notified
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          senderId={message.senderId}
          senderName={message.senderName}
          senderImg={message.senderImg}
          senderMessage={message.text}
          sessionId={sessionId}
        />
      ));

      setUnseenMessages((prev) => [...prev, message]);
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_Friend", newFriendHandler);

    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_Friend", newFriendHandler);
    };
  }, [pathname, sessionId, router]);

  // check for unseen msgs by matching the senderId for each msg and the chatId
  // rn unseenMessages includes the unseen msgs for all the friends
  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        // get the unseen msg for each friend
        const unseenMessagesCount = unseenMessages.filter((unseenMsg) => {
          return unseenMsg.senderId === friend.id;
        }).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2
              text-sm leading-6 font-semibold"
            >
              <div className="relative h-5 w-5">
                <Image
                  fill
                  src={friend.image as string}
                  alt="friend profile picture"
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div
                  className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex
                justify-center items-center"
                >
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
