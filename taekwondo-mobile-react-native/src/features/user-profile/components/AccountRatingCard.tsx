import { Star } from "reicon-react-native";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { AppIcon } from "@/shared/ui/AppIcon";
import { ThemedText } from "@/shared/ui/ThemedText";
import { Colors, effects, radii } from "@/theme";

export function AccountRatingCard() {
  return (
    <View style={styles.ratingCard}>
      <View style={styles.ratingHeader}>
        <Image
          source={require("@/assets/images/evaluation-app.png")}
          style={styles.ratingImage}
          contentFit="cover"
          accessibilityLabel="Đánh giá ứng dụng"
        />
        <ThemedText type="subtitle" style={styles.ratingTitle}>
          Đánh giá của bạn
        </ThemedText>
        <ThemedText type="bodySmall" style={styles.ratingDescription}>
          Bạn hài lòng với trải nghiệm trên ứng dụng chứ ?
        </ThemedText>
      </View>
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={`rating-star-${index}`} style={styles.starIcon}>
            <AppIcon icon={<Star />} size={38} color="#FFC700" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ratingCard: {
    marginTop: 20,
    height: 161,
    borderRadius: radii.md,
    backgroundColor: Colors.light.surface,
    overflow: "hidden",
    ...effects.card,
  },
  ratingHeader: {
    height: 115,
    backgroundColor: "rgba(215, 17, 19, 0.1)",
    paddingLeft: 12,
    paddingTop: 14,
  },
  ratingTitle: {
    color: Colors.light.primary,
  },
  ratingDescription: {
    width: 224,
    marginTop: 11,
    color: Colors.light.primary,
  },
  stars: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    height: 46,
    paddingHorizontal: 22,
    paddingTop: 7,
  },
  starIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingImage: {
    position: "absolute",
    top: 3,
    right: 34,
    width: 82,
    height: 82,
  },
});
