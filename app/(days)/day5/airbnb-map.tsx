import ApartmentListItem from "@/components/core/day5/apartment-list-item";
import CustomMarker from "@/components/core/day5/custom-marker";
import { Apartment, apartments } from "@/constants/days/day5";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
} from "react-native-reanimated";

const AnimatedMapView = Animated.createAnimatedComponent(MapView);

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SNAP_CLOSED = SCREEN_HEIGHT * 0.91; // 9%
const SNAP_OPEN = SCREEN_HEIGHT * 0.5; // 50%

const INITIAL_REGION = {
  latitude: 6.4474,
  longitude: 3.4074,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function AirbnbScreen() {
  const [selectedApartment, setSelectedApartment] = useState<
    Apartment | undefined
  >(undefined);

  const snapPoints = useMemo(() => ["8%", "50%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const animatedPosition = useSharedValue(SCREEN_HEIGHT);

  const animatedProps = useAnimatedProps(() => {
    const latitudeDelta = interpolate(
      animatedPosition.value,
      [SNAP_OPEN, SNAP_CLOSED],
      [0.09, 0.05], // zooms out as sheet rises
      Extrapolation.CLAMP,
    );

    const longitudeDelta = interpolate(
      animatedPosition.value,
      [SNAP_OPEN, SNAP_CLOSED],
      [0.09, 0.05],
      Extrapolation.CLAMP,
    );

    // shift center up so markers stay visible above the sheet
    const latitudeOffset = interpolate(
      animatedPosition.value,
      [SNAP_OPEN, SNAP_CLOSED],
      [-0.02, 0],
      Extrapolation.CLAMP,
    );

    return {
      region: {
        latitude: INITIAL_REGION.latitude + latitudeOffset,
        longitude: INITIAL_REGION.longitude,
        latitudeDelta,
        longitudeDelta,
      },
    };
  });

  const handleSheetChanges = useCallback((index: number) => {
    console.log("snap index:", index);
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedMapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        animatedProps={animatedProps}
      >
        {apartments.map((apartment) => (
          <CustomMarker
            key={apartment.id}
            data={apartment}
            selectedId={selectedApartment?.id ?? ""}
            onSelect={setSelectedApartment}
          />
        ))}
      </AnimatedMapView>

      {selectedApartment && (
        <Animated.View style={styles.selectedCard}>
          <ApartmentListItem apartment={selectedApartment} />
        </Animated.View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={0}
        onChange={handleSheetChanges}
        enableOverDrag={false}
        enableDynamicSizing={false}
        animateOnMount={false}
        animatedPosition={animatedPosition}
        backgroundStyle={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: "white",
        }}
        handleIndicatorStyle={{
          backgroundColor: "#ccc",
          width: 40,
        }}
      >
        <Text style={styles.sheetTitle}>
          {apartments.length} apartments in Lagos Island
        </Text>
        <BottomSheetFlatList<Apartment>
          data={apartments}
          keyExtractor={(item: Apartment) => item.id}
          contentContainerStyle={{ gap: 10, padding: 10, paddingBottom: 40 }}
          renderItem={({ item }: { item: Apartment }) => (
            <ApartmentListItem apartment={item} />
          )}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    position: "relative",
  },
  selectedCard: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: "10%",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
});
