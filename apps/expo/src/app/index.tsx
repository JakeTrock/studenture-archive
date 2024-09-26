import React from "react";
import { Button, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Stack } from "expo-router";

// import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

function PostCard(props: {
  post: RouterOutputs["post"]["naturalSearch"][number];
  onDelete: () => void;
}) {
  return (
    <View className="flex flex-row rounded-lg bg-white/10 p-4">
      <View className="flex-grow">
        <Pressable onPress={props.onDelete}>
          <Text className="font-bold uppercase text-red-400">Delete</Text>
        </Pressable>
        <Link
          asChild
          href={{
            pathname: "/post/[id]",
            params: { id: props.post.id },
          }}
        >
          <Pressable>
            <Text className="text-xl font-semibold text-blue-400">
              {props.post.title}
            </Text>
            <Text className="mt-2 text-black">{props.post.body}</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

function CreatePost() {
  const utils = api.useUtils();
  const auth = utils.auth.getSession;

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [subHead, setSubHead] = React.useState("");
  const [locationLat, setLocationLat] = React.useState(0);
  const [locationLon, setLocationLon] = React.useState(0);
  const [tags, setTags] = React.useState<string[]>([]);

  const { data: userData } = api.auth.getSession.useQuery();

  const { mutate, error } = api.post.create.useMutation({
    // async onSuccess() {
    onSuccess() {
      setTitle("");
      setBody("");
      setSubHead("");
      setLocationLat(0); //TODO: make a map-picker component
      setLocationLon(0);
      setTags([]);
      // await utils.post.getFeedChunk.invalidate();
    },
  });

  if (!auth)
    return (
      <View className="mt-4">
        <Text className="mb-2 text-red-500">
          You need to be logged in to create a post
        </Text>
      </View>
    );

  return (
    <View className="mt-4">
      <TextInput
        className="mb-2 rounded bg-white/10 p-2 text-black"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      {error?.data?.zodError?.fieldErrors.title && (
        <Text className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.title}
        </Text>
      )}
      <TextInput
        className="mb-2 rounded bg-white/10 p-2 text-black"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={subHead}
        onChangeText={setSubHead}
        placeholder="SubHead"
      />
      {error?.data?.zodError?.fieldErrors.subHead && (
        <Text className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.subHead}
        </Text>
      )}
      <TextInput
        className="mb-2 rounded bg-white/10 p-2 text-black"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={String(locationLat)}
        onChangeText={(e) => setLocationLat(Number(e))}
        placeholder="Contact Info"
      />
      {error?.data?.zodError?.fieldErrors.locationLat && (
        <Text className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.locationLat}
        </Text>
      )}
      <TextInput
        className="mb-2 rounded bg-white/10 p-2 text-black"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={String(locationLon)}
        onChangeText={(e) => setLocationLon(Number(e))}
        placeholder="Contact Info"
      />
      {error?.data?.zodError?.fieldErrors.locationLon && (
        <Text className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.locationLon}
        </Text>
      )}
      <TextInput
        className="mb-2 rounded bg-white/10 p-2 text-black"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={tags.join(",")}
        onChangeText={(e) => setTags(e.split(","))}
        placeholder="Tags"
      />
      {error?.data?.zodError?.fieldErrors.tags && (
        <Text className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.tags}
        </Text>
      )}
      {/*TODO: use loop to assemble this instead */}
      <TextInput
        className="mb-2 rounded bg-white/10 p-2 text-black"
        placeholderTextColor="rgba(255, 255, 255, 0.5)"
        value={body}
        onChangeText={setBody}
        placeholder="Content"
      />
      {error?.data?.zodError?.fieldErrors.content && (
        <Text className="mb-2 text-red-500">
          {error.data.zodError.fieldErrors.content}
        </Text>
      )}
      <Pressable
        className="rounded bg-blue-400 p-2"
        onPress={() => {
          if (!userData)
            return alert("You need to be logged in to create a post");
          mutate({
            title,
            subHead,
            body,
            postCreator: userData.user.profileId,
            locationLat,
            locationLon,
            tags,
          });
        }}
      >
        <Text className="font-semibold text-black">Publish post</Text>
      </Pressable>
      {error?.data?.code === "UNAUTHORIZED" && (
        <Text className="mt-2 text-red-500">
          You need to be logged in to create a post
        </Text>
      )}
    </View>
  );
}

const Index = () => {
  // const utils = api.useUtils();

  // const postQuery = api.post.getFeedChunk.useQuery({ continuePoint: 0 }); //TODO: implement continues and tag specifiers(make a list builder component)

  // const deletePostMutation = api.post.delete.useMutation({
  //   // onSettled: () => utils.post.getFeedChunk.invalidate(),
  // });

  return (
    <SafeAreaView className="bg-[#1F104A]">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="h-full w-full p-4">
        <Text className="pb-2 text-center text-5xl font-bold text-black">
          Studenture
        </Text>

        <Button
          // onPress={() => void utils.post.getFeedChunk.invalidate()}
          title="Refresh posts"
          color={"#f472b6"}
        />

        <View className="py-2">
          <Text className="font-semibold italic text-black">
            Press on a post
          </Text>
        </View>

        {/* <FlashList
          data={postQuery.data}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <PostCard
              post={p.item}
              onDelete={() => deletePostMutation.mutate(p.item.id)}
            />
          )}
        /> */}

        <CreatePost />
      </View>
    </SafeAreaView>
  );
};

export default Index;
