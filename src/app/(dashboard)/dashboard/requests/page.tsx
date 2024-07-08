import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

interface pageProps {}

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // ids of people who sent the current user a friend request
  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`,
  )) as string[];

  // Promise.all makes all the requests at once and not 1 by 1
  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as User;

      return {
        senderId,
        senderEmail: sender.email,
      };
    }),
  );
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">Add a friend</h1>
      <div className="flex flex-col gap-4 ">
      </div>
    </main>
  );
};

export default page;
