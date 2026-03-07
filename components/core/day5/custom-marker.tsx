import type { Apartment } from "@/constants/days/day5";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Marker } from "react-native-maps";

interface CustomMarkerProps {
  data: Apartment;
  selectedId: string;
  onSelect: (data: Apartment) => void;
}

const CustomMarker = ({ data, selectedId, onSelect }: CustomMarkerProps) => {
  const isSelected = selectedId === data.id;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => setTracksViewChanges(false), 500);
    return () => clearTimeout(timer);
  }, [isSelected]);

  return (
    <Marker
      coordinate={{
        latitude: data.latitude,
        longitude: data.longitude,
      }}
      onPress={() => onSelect(data)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={{
          backgroundColor: isSelected ? "#FF385C" : "white",
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderWidth: 1.5,
          borderColor: isSelected ? "#FF385C" : "#ccc",
          borderRadius: 20,
          elevation: 4,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text
          style={{
            color: isSelected ? "white" : "black",
            fontWeight: "700",
            fontSize: 13,
          }}
        >
          ₦{data.price.toLocaleString()}
        </Text>
      </View>
    </Marker>
  );
};

export default CustomMarker;
