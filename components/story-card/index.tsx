import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import * as RN from "react-native";
import useSWR from "swr";
import { Skeleton } from "@/components/skeleton";
import { styled, styledMemo } from "@/dash";
import { useMetadata } from "@/hooks/use-metadata";
import type { StackParamList } from "@/screens/routers";
import { ago } from "@/utils/ago";

export const Story = React.memo(
  function Story({ index, id }: { index: number; id: number | null }) {
    const story = useSWR<{
      by: string;
      descendants: number;
      id: number;
      kids: number[];
      score: number;
      time: number;
      title: string;
      type: "story" | "job" | "comment" | "poll" | "pollopt";
      url: string;
    }>(
      id === -1
        ? null
        : `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
      (key) =>
        fetch(key, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())
    );
    const url = new URL(story.data?.url || "http://localhost");
    const navigation = useNavigation<NavigationProp<StackParamList>>();
    const metadata = useMetadata(url);

    if (!story.data) {
      return (
        <StyledStory index={index}>
          <StorySkeleton index={index} />
        </StyledStory>
      );
    }

    return (
      <StyledStory index={index}>
        {metadata?.image ? (
          <RN.TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("BrowserModal", {
                title: story.data?.title,
                url: url.toString(),
              })
            }
          >
            <StoryImage index={index} source={{ uri: metadata?.image }} />
          </RN.TouchableWithoutFeedback>
        ) : null}

        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("BrowserModal", {
              title: metadata?.applicationName || url.hostname,
              url: url.origin,
            })
          }
        >
          <HostContainer>
            <Favicon source={{ uri: metadata?.favicon }} />

            <Hostname numberOfLines={1} ellipsizeMode="tail">
              {metadata?.applicationName || url.host.replace(/^www\./, "")}
            </Hostname>
          </HostContainer>
        </RN.TouchableWithoutFeedback>

        <RN.TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("BrowserModal", {
              title: story.data?.title,
              url: url.toString(),
            })
          }
        >
          <StoryTitle
            index={index}
            adjustsFontSizeToFit
            numberOfLines={
              index === 0 ? 3 : index < 5 && metadata?.image ? 4 : 6
            }
          >
            {story.data.title}
          </StoryTitle>
        </RN.TouchableWithoutFeedback>

        <RN.View>
          <ByLine>
            <By>@{story.data.by}</By>
            <Ago>{ago.format(new Date(story.data.time * 1000), "mini")}</Ago>
          </ByLine>

          <FooterText>
            ⇧{story.data.score} &bull;{" "}
            <Comments>{story.data.descendants} comments</Comments>
          </FooterText>
        </RN.View>
      </StyledStory>
    );
  },
  (prev, next) => prev.id === next.id && prev.index === next.index
);

const StyledStory = styled(RN.View, (t, { index }: { index: number }) => ({
  width: index === 0 || index > 4 ? "100%" : "50%",
  padding: t.space.lg,
  paddingTop: index === 0 ? t.space.xl : index < 5 ? t.space.md : t.space.lg,
  paddingBottom: index === 0 ? t.space.xl : index < 5 ? t.space.lg : t.space.lg,
}));

const StorySkeleton = styled(Skeleton, (t, { index }: { index: number }) => ({
  width: "100%",
  height: index === 0 || index > 4 ? 172 : 96,
  marginBottom: t.space.md,
  borderRadius: t.radius.secondary,
}));

const StoryImage = styled(RN.Image, (t, { index }: { index: number }) => ({
  width: "100%",
  height: index === 0 || index > 4 ? 172 : 96,
  marginBottom: t.space.md,
  borderRadius: t.radius.secondary,
}));

const HostContainer = styled(RN.View, {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
});

const Favicon = styledMemo(RN.Image, (t) => ({
  width: 20,
  height: 20,
  borderRadius: t.radius.md,
  marginRight: t.space.sm,
}));

const Hostname = styledMemo(RN.Text, (t) => ({
  flex: 1,
  width: "100%",
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
}));

const StoryTitle = styled(RN.Text, (t, { index }: { index: number }) => ({
  color: t.color.textPrimary,
  fontSize: t.type.size[index === 0 ? "6xl" : index < 5 ? "lg" : "sm"],
  fontWeight: index === 0 ? "900" : index < 5 ? "800" : "700",
  letterSpacing: index < 4 ? t.type.tracking.tighter : t.type.tracking.tight,
  paddingTop: t.space.sm,
  paddingBottom: t.space.sm,
}));

const ByLine = styledMemo(RN.View, (t) => ({
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: t.space.xs,
}));

const By = styledMemo(RN.Text, (t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
}));

const Ago = styledMemo(RN.Text, (t) => ({
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
  fontWeight: "300",
}));

const FooterText = styledMemo(RN.Text, (t) => ({
  fontWeight: "600",
  color: t.color.textAccent,
  fontSize: t.type.size["2xs"],
}));

const Comments = styled(RN.Text, { fontWeight: "300" });
