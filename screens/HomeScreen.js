import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { theme } from "../theme";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import * as Progress from "react-native-progress";
import { StatusBar } from "expo-status-bar";
import { weatherImages } from "../constants";
import { getData, storeData } from "../utils/asyncStorage";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({});

  const handleSearch = (search) => {
    if (search && search.length > 2)
      fetchLocations({ cityName: search }).then((data) => {
        setLocations(data);
      });
  };

  const handleLocation = (loc) => {
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setLoading(false);
      setWeather(data);
      storeData("city", loc.name);
    });
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Astana";
    if (myCity) {
      cityName = myCity;
    }
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { location, current } = weather;

  return (
    <View style={{ height: "100%" }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.png")}
        style={{ width: "100%", height: "100%", position: "absolute" }}
      />
      {loading ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      ) : (
        <SafeAreaView>
          <View
            style={{
              height: "7%",
              zIndex: 50,
              paddingLeft: 15,
              paddingRight: 15,
            }}
          >
            <View
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : "transparent",
                borderRadius: 999,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor={"lightgray"}
                  style={[styles.text, { textAlign: "left", width: "75%" }]}
                />
              ) : null}
              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={{
                  backgroundColor: theme.bgWhite(0.3),
                  justifyContent: "center",
                  alignItems: "center",
                  width: 50,
                  height: 50,
                  borderRadius: 999,
                  margin: 10,
                }}
              >
                {showSearch ? (
                  <XMarkIcon size="25" color="white" />
                ) : (
                  <MagnifyingGlassIcon size="25" color="white" />
                )}
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View
                style={{
                  backgroundColor: "rgba(174,174,174,0.4)",
                  borderRadius: 30,
                  marginTop: 10,
                }}
              >
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? {
                        borderBottomWidth: 2,
                      }
                    : "";
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLocation(loc)}
                      style={[
                        {
                          border: 999,
                          padding: 15,
                          paddingBottom: 25,
                          flexDirection: "row",
                          alignItems: "center",
                        },
                        borderClass,
                      ]}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text
                        style={{ color: "#000", fontSize: 18, paddingLeft: 10 }}
                      >
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.textLocation,
              {
                flexDirection: "column",
                justifyContent: "space-between",
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  fontSize: 24,
                  fontWeight: "600",
                  textAlign: "center",
                  marginBottom: 50,
                },
              ]}
            >
              {location?.name},
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "600",
                  textAlign: "center",
                  color: theme.bgWhite(0.6),
                }}
              >
                {location?.country}
              </Text>
            </Text>

            <View style={{ alignItems: "center", marginBottom: 50 }}>
              <Image
                source={weatherImages[current?.condition?.text || "other"]}
                style={styles.imgMain}
              />
            </View>
            <View style={{ marginBottom: 50 }}>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: 48,
                    fontWeight: "600",
                    textAlign: "center",
                  },
                ]}
              >
                {current?.temp_c}&#176;
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    fontSize: 18,
                    fontWeight: "400",
                    textAlign: "center",
                  },
                ]}
              >
                {current?.condition?.text}
              </Text>
            </View>

            <View
              style={[
                styles.wrap,
                { justifyContent: "space-around", marginBottom: 40 },
              ]}
            >
              <View style={styles.wrap}>
                <Image
                  source={require("../assets/icons/wind.png")}
                  style={styles.imgInfo}
                />
                <Text
                  style={[
                    styles.text,
                    { marginLeft: 10, fontSize: 16, fontWeight: "600" },
                  ]}
                >
                  {current?.wind_kph}km
                </Text>
              </View>
              <View style={styles.wrap}>
                <Image
                  source={require("../assets/icons/drop.png")}
                  style={styles.imgInfo}
                />
                <Text
                  style={[
                    styles.text,
                    { marginLeft: 10, fontSize: 16, fontWeight: "600" },
                  ]}
                >
                  {current?.humidity}%
                </Text>
              </View>
              <View style={styles.wrap}>
                <Image
                  source={require("../assets/icons/sun.png")}
                  style={styles.imgInfo}
                />
                <Text
                  style={[
                    styles.text,
                    { marginLeft: 10, fontSize: 16, fontWeight: "600" },
                  ]}
                >
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          <View>
            <View style={[styles.wrap, { marginLeft: 15, marginBottom: 15 }]}>
              <CalendarDaysIcon size="22" color="white" />
              <Text style={[styles.text, { marginLeft: 10, fontSize: 18 }]}>
                Daily forecast
              </Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date);
                const options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];
                return (
                  <View key={index} style={styles.slider}>
                    <Image
                      source={
                        weatherImages[item?.day?.condition?.text || "other"]
                      }
                      style={styles.imgCard}
                    />
                    <Text style={styles.text}>{dayName}</Text>
                    <Text style={[styles.text, { fontSize: 24 }]}>
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  textLocation: {},
  imgMain: {
    width: 200,
    height: 200,
  },
  imgInfo: {
    width: 30,
    height: 30,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 10,
    backgroundColor: theme.bgWhite(0.15),
  },
  imgCard: {
    width: 70,
    height: 70,
  },
  text: {
    color: "#fff",
  },
});
