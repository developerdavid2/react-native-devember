import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Apartment } from "@/constants/days/day5";
import { Image } from "expo-image";

interface ApartmentListItemProps {
  apartment: Apartment;
}

const ApartmentListItem = ({ apartment }: ApartmentListItemProps) => {
  return (
    <View style={styles.card}>
      <Image source={apartment?.images[0]} style={styles.image} />
      <View style={styles.rightContainer}>
        <Text style={styles.title}>{apartment.title}</Text>
        <Text style={styles.description}>
          Stay at this apartment for an affordable price
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>$ {apartment.price}</Text>
          <Text style={styles.price}>
            * {apartment.rating} ({apartment.stars})
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",

    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
  },

  rightContainer: {
    padding: 10,
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginBottom: 10,
    fontSize: 18,
  },
  description: {
    color: "gray",
  },
  price: {
    fontWeight: "700",
  },
  image: {
    width: 150,
    aspectRatio: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
});

export default ApartmentListItem;
