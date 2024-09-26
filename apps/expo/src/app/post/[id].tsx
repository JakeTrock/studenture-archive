import { Button, SafeAreaView, Text, View } from "react-native";
import { Stack, useGlobalSearchParams } from "expo-router";

import { api } from "~/utils/api";

export default function Post() {
  const { id } = useGlobalSearchParams();
  if (!id || typeof id !== "string") throw new Error("unreachable");
  const { data } = api.post.byId.useQuery(id);
  const { data: userData } = api.auth.getSession.useQuery();

  const deletePost = api.post.delete.useMutation();
  const applyToPost = api.jobApplication.applyToJob.useMutation();

  if (!data) return null;

  //TODO: propogate post created by

  //TODO: type hell location
  return (
    <SafeAreaView className="bg-[#1F104A]">
      <Stack.Screen options={{ title: data.title }} />
      <View className="h-full w-full p-4">
        <Text className="py-2 text-3xl font-bold text-black">{data.title}</Text>
        <Text className="py-4 text-black">{data.subHead}</Text>
        <Text className="py-4 text-black">{data.tags}</Text>
        <Text className="py-4 text-black">{data.body}</Text>
        {userData?.user.id ? (
          <Button
            onPress={() => deletePost.mutateAsync(data.id)}
            title="Delete post"
            color={"#f472b6"}
          />
        ) : (
          <Button
            onPress={() => applyToPost.mutateAsync(data.id)}
            title="Apply to job"
            color={"green"}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
